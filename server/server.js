import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { devices, loginAttempts, recommendations, threatTimeline, trafficSeries, vulnerabilities, notifications } from "../src/data/mockData.js";
import { analyzePassword, analyzeUrl, generatePassword } from "./security.js";
import {
  createSession,
  createUser,
  findSessionByTokenHash,
  findUserByEmail,
  findUserById,
  getAdminStats,
  getCredentialByUserId,
  getHistory,
  getPasswordAudits,
  getPreferences,
  getStorageMode,
  listUsers,
  revokeSession,
  saveHistory,
  savePasswordAudit,
  savePreferences,
} from "./storage.js";
import {
  buildLogoutCookie,
  buildSessionCookie,
  createSessionToken,
  hashPassword,
  hashSessionToken,
  normalizeEmail,
  parseCookies,
  publicUser,
  sessionCookieName,
  sessionExpiryIso,
  validateEmail,
  validatePasswordPolicy,
  verifyPassword,
} from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

async function loadEnvFile() {
  try {
    const envFile = await fs.readFile(path.join(projectRoot, ".env"), "utf8");
    for (const line of envFile.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...valueParts] = trimmed.split("=");
      if (!process.env[key]) process.env[key] = valueParts.join("=").trim();
    }
  } catch {
    // A .env file is optional; deployed environments usually provide variables directly.
  }
}

await loadEnvFile();

const port = Number(process.env.API_PORT || process.env.PORT || 4174);
const host = process.env.API_HOST || "127.0.0.1";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function setSecurityHeaders(response, request) {
  const origin = request.headers.origin;
  const allowedOrigins = new Set([
    process.env.APP_ORIGIN,
    "http://127.0.0.1:5173",
    "http://localhost:5173",
  ].filter(Boolean));

  if (origin && (allowedOrigins.has(origin) || /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin))) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }

  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Frame-Options", "DENY");
}

function sendJson(response, statusCode, payload, headers = {}) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8", ...headers });
  response.end(JSON.stringify(payload));
}

function sendError(response, error) {
  const statusCode = error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
  sendJson(response, statusCode, {
    success: false,
    error: statusCode >= 500 ? "Unable to complete the request. Please try again." : error.message,
  });
}

function authError(message = "You must sign in to continue.") {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
}

function forbiddenError(message = "You do not have permission to access this page.") {
  const error = new Error(message);
  error.statusCode = 403;
  return error;
}

async function getRequestUser(request) {
  const cookies = parseCookies(request.headers.cookie || "");
  const token = cookies[sessionCookieName];
  if (!token) return null;

  const session = await findSessionByTokenHash(hashSessionToken(token));
  if (!session) return null;

  const user = await findUserById(session.user_id);
  if (!user || user.status !== "active") return null;

  return { user, session, token };
}

async function requireAuth(request) {
  const auth = await getRequestUser(request);
  if (!auth) throw authError();
  return auth;
}

async function requireAdmin(request) {
  const auth = await requireAuth(request);
  if (auth.user.role !== "admin") throw forbiddenError();
  return auth;
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 32_000) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  if (!chunks.length) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

function summarizeDashboard() {
  const activeDevices = devices.filter((device) => device.status !== "Offline").length;
  const criticalVulnerabilities = vulnerabilities.filter((item) => item.severity === "Critical").length;
  const openVulnerabilities = vulnerabilities.filter((item) => item.status !== "Accepted Risk").length;
  const reviewDevices = devices.filter((device) => device.firewall === "Review").length;

  return {
    generatedAt: new Date().toISOString(),
    storageMode: getStorageMode(),
    stats: {
      securityScore: 87,
      activeDevices,
      totalDevices: devices.length,
      threatAlerts: criticalVulnerabilities + reviewDevices,
      vulnerabilitiesFound: openVulnerabilities,
      firewallStatus: reviewDevices ? `${reviewDevices} reviews` : "Protected",
      cpuUsage: 62,
      ramUsage: 74,
      bandwidthUsage: 58,
    },
    trafficSeries,
    threatTimeline,
    activitySummary: [
      "Reviewed endpoint telemetry",
      "Completed URL configuration analysis",
      "Generated non-sensitive password audit summary",
      "Updated dashboard preferences",
    ],
    loginAttempts: loginAttempts.slice(0, 8),
    recommendations,
  };
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
}

function securitySummaryCsv() {
  const rows = [
    ["Metric", "Value"],
    ["Security Score", "87"],
    ["Total Sample Devices", devices.length],
    ["Active Sample Devices", devices.filter((device) => device.status !== "Offline").length],
    ["Open Demo Vulnerabilities", vulnerabilities.filter((item) => item.status !== "Accepted Risk").length],
    ["Critical Demo Findings", vulnerabilities.filter((item) => item.severity === "Critical").length],
    ["Notification Events", notifications.length],
    ["Storage Mode", getStorageMode()],
  ];

  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

async function handleApi(request, response, url) {
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, { success: true, data: { status: "ok", storageMode: getStorageMode() } });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/auth/me") {
    const auth = await getRequestUser(request);
    sendJson(response, 200, { success: true, data: { user: publicUser(auth?.user || null), storageMode: getStorageMode() } }, { "Cache-Control": "no-store" });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/register") {
    const body = await readJsonBody(request);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = normalizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    if (!name || !email || !password || !confirmPassword) {
      const error = new Error("Name, email, password, and confirmation are required.");
      error.statusCode = 400;
      throw error;
    }
    if (name.length > 80) {
      const error = new Error("Name must be 80 characters or fewer.");
      error.statusCode = 400;
      throw error;
    }
    if (!validateEmail(email)) {
      const error = new Error("Enter a valid email address.");
      error.statusCode = 400;
      throw error;
    }
    if (password !== confirmPassword) {
      const error = new Error("Password confirmation does not match.");
      error.statusCode = 400;
      throw error;
    }
    const passwordErrors = validatePasswordPolicy(password);
    if (passwordErrors.length) {
      const error = new Error(passwordErrors[0]);
      error.statusCode = 400;
      throw error;
    }

    const credential = await hashPassword(password);
    const created = await createUser({ name, email, role: "user", credential });
    const token = createSessionToken();
    await createSession({
      userId: created.user.id,
      tokenHash: hashSessionToken(token),
      expiresAt: sessionExpiryIso(),
      userAgent: request.headers["user-agent"] || "",
    });

    sendJson(response, 201, { success: true, data: { user: created.user, storage: created.storage } }, {
      "Set-Cookie": buildSessionCookie(token),
      "Cache-Control": "no-store",
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readJsonBody(request);
    const email = normalizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";

    if (!validateEmail(email) || !password) {
      const error = new Error("Unable to sign in. Please check your credentials.");
      error.statusCode = 401;
      throw error;
    }

    const user = await findUserByEmail(email);
    const credential = user ? await getCredentialByUserId(user.id) : null;
    const valid = credential ? await verifyPassword(password, credential) : false;
    if (!user || user.status !== "active" || !valid) {
      const error = new Error("Unable to sign in. Please check your credentials.");
      error.statusCode = 401;
      throw error;
    }

    const token = createSessionToken();
    await createSession({
      userId: user.id,
      tokenHash: hashSessionToken(token),
      expiresAt: sessionExpiryIso(),
      userAgent: request.headers["user-agent"] || "",
    });

    sendJson(response, 200, { success: true, data: { user } }, {
      "Set-Cookie": buildSessionCookie(token),
      "Cache-Control": "no-store",
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/logout") {
    const cookies = parseCookies(request.headers.cookie || "");
    const token = cookies[sessionCookieName];
    if (token) await revokeSession(hashSessionToken(token));
    sendJson(response, 200, { success: true, data: { message: "Signed out successfully." } }, {
      "Set-Cookie": buildLogoutCookie(),
      "Cache-Control": "no-store",
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/stats") {
    await requireAdmin(request);
    sendJson(response, 200, { success: true, data: await getAdminStats() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/users") {
    await requireAdmin(request);
    sendJson(response, 200, { success: true, data: await listUsers({ limit: 100 }) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/activity") {
    await requireAdmin(request);
    const scans = await getHistory(null, { admin: true, limit: 25 });
    sendJson(response, 200, { success: true, data: scans });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/dashboard") {
    await requireAuth(request);
    sendJson(response, 200, { success: true, data: summarizeDashboard() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/history") {
    const { user } = await requireAuth(request);
    const history = await getHistory(user.id);
    sendJson(response, 200, { success: true, data: history });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/password/audits") {
    const { user } = await requireAuth(request);
    const audits = await getPasswordAudits(user.id);
    sendJson(response, 200, { success: true, data: audits });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/password/analyze") {
    const { user } = await requireAuth(request);
    const body = await readJsonBody(request);
    const password = typeof body.password === "string" ? body.password : "";
    if (!password.trim()) {
      const error = new Error("Enter a password to analyze.");
      error.statusCode = 400;
      throw error;
    }
    if (password.length > 128) {
      const error = new Error("Password input is too long for this local checker.");
      error.statusCode = 400;
      throw error;
    }

    const analysis = analyzePassword(password);
    const audit = await savePasswordAudit(analysis, user.id);
    sendJson(response, 200, {
      success: true,
      data: {
        analysis,
        storage: audit.storage,
        privacy: "The submitted password was analyzed in memory and was not stored.",
      },
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/password/generate") {
    await requireAuth(request);
    const body = await readJsonBody(request);
    const password = generatePassword({ length: body.length });
    sendJson(response, 200, { success: true, data: { password } });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/url/analyze") {
    const { user } = await requireAuth(request);
    const body = await readJsonBody(request);
    const target = typeof body.url === "string" ? body.url.trim() : "";
    if (!target) {
      const error = new Error("Enter a URL to review.");
      error.statusCode = 400;
      throw error;
    }
    if (target.length > 500) {
      const error = new Error("URL is too long for this analyzer.");
      error.statusCode = 400;
      throw error;
    }

    const analysis = analyzeUrl(target);
    const history = await saveHistory({
      type: "url-analysis",
      target: analysis.target,
      riskLevel: analysis.riskLevel,
      score: analysis.score,
      summary: `${analysis.riskLevel} risk URL configuration review`,
      metadata: {
        hostname: analysis.hostname,
        findings: analysis.findings.length,
      },
    }, user.id);

    sendJson(response, 200, {
      success: true,
      data: {
        analysis,
        storage: history.storage,
      },
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/reports/security-summary.csv") {
    await requireAuth(request);
    response.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"cyberops-security-summary.csv\"",
    });
    response.end(securitySummaryCsv());
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/settings/preferences") {
    const { user } = await requireAuth(request);
    const preferences = await getPreferences(user.id);
    sendJson(response, 200, { success: true, data: preferences });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/settings/preferences") {
    const { user } = await requireAuth(request);
    const body = await readJsonBody(request);
    const preferences = body.preferences && typeof body.preferences === "object" ? body.preferences : {};
    const saved = await savePreferences(user.id, preferences);
    sendJson(response, 200, { success: true, data: saved });
    return;
  }

  const error = new Error("API route not found.");
  error.statusCode = 404;
  throw error;
}

async function serveStatic(response, url) {
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = path
    .normalize(decodeURIComponent(requestedPath))
    .replace(/^[/\\]+/, "")
    .replace(/^(\.\.[/\\])+/, "");
  const filePath = path.resolve(distDir, safePath);
  if (!filePath.startsWith(distDir)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    const target = stat.isDirectory() ? path.join(filePath, "index.html") : filePath;
    const extension = path.extname(target);
    const contents = await fs.readFile(target);
    response.writeHead(200, { "Content-Type": contentTypes[extension] || "application/octet-stream" });
    response.end(contents);
  } catch {
    try {
      const contents = await fs.readFile(path.join(distDir, "index.html"));
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.end(contents);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Build output not found. Run npm run build before starting the production server.");
    }
  }
}

const server = http.createServer(async (request, response) => {
  setSecurityHeaders(response, request);
  const url = new URL(request.url || "/", `http://${request.headers.host || `${host}:${port}`}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }

    await serveStatic(response, url);
  } catch (error) {
    sendError(response, error);
  }
});

server.listen(port, host, () => {
  console.log(`CyberOps Suite API listening at http://${host}:${port}`);
});
