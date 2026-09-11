import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeEmail } from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localStorePath = path.join(__dirname, "data", "local-store.json");

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

const defaultStore = () => ({
  users: [],
  credentials: [],
  sessions: [],
  history: [],
  passwordAudits: [],
  preferences: {},
});

async function readLocalStore() {
  try {
    const contents = await fs.readFile(localStorePath, "utf8");
    return { ...defaultStore(), ...JSON.parse(contents) };
  } catch {
    return defaultStore();
  }
}

async function writeLocalStore(store) {
  await fs.mkdir(path.dirname(localStorePath), { recursive: true });
  await fs.writeFile(localStorePath, JSON.stringify(store, null, 2));
}

function localId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function supabaseRequest(table, { method = "GET", query = "", body, prefer = "return=representation" } = {}) {
  const config = supabaseConfig();
  if (!config) return null;

  const response = await fetch(`${config.url}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: prefer,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = new Error(`Database request failed with status ${response.status}.`);
    error.statusCode = 503;
    throw error;
  }

  return response.status === 204 ? [] : response.json();
}

function publicProfile(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status || "active",
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

export function getStorageMode() {
  return supabaseConfig() ? "postgresql" : "local-demo";
}

export async function findUserByEmail(email) {
  const normalized = normalizeEmail(email);

  try {
    const remote = await supabaseRequest("profiles", { query: `?email=eq.${encodeURIComponent(normalized)}&select=*` });
    if (remote) return publicProfile(remote[0]);
  } catch {
    // Local fallback is used for demos when the optional database is unavailable.
  }

  const store = await readLocalStore();
  return publicProfile(store.users.find((user) => user.email === normalized));
}

export async function findUserById(id) {
  if (!id) return null;

  try {
    const remote = await supabaseRequest("profiles", { query: `?id=eq.${encodeURIComponent(id)}&select=*` });
    if (remote) return publicProfile(remote[0]);
  } catch {
    // Local fallback is used for demos when the optional database is unavailable.
  }

  const store = await readLocalStore();
  return publicProfile(store.users.find((user) => user.id === id));
}

export async function getCredentialByUserId(userId) {
  try {
    const remote = await supabaseRequest("auth_credentials", { query: `?user_id=eq.${encodeURIComponent(userId)}&select=*` });
    if (remote) return remote[0] || null;
  } catch {
    // Local fallback is used for demos when the optional database is unavailable.
  }

  const store = await readLocalStore();
  return store.credentials.find((credential) => credential.user_id === userId) || null;
}

export async function createUser({ name, email, role = "user", credential }) {
  const normalized = normalizeEmail(email);
  const now = new Date().toISOString();
  const allowedRole = role === "admin" ? "admin" : "user";

  try {
    const existing = await supabaseRequest("profiles", { query: `?email=eq.${encodeURIComponent(normalized)}&select=id` });
    if (existing?.length) {
      const error = new Error("An account already exists for this email.");
      error.statusCode = 409;
      throw error;
    }

    const remoteProfile = await supabaseRequest("profiles", {
      method: "POST",
      body: {
        name: name.trim(),
        email: normalized,
        role: allowedRole,
        status: "active",
        created_at: now,
        updated_at: now,
      },
    });

    if (remoteProfile) {
      const profile = remoteProfile[0];
      await supabaseRequest("auth_credentials", {
        method: "POST",
        body: {
          user_id: profile.id,
          password_hash: credential.password_hash,
          password_salt: credential.password_salt,
          password_params: credential.password_params,
          created_at: now,
        },
      });
      return { user: publicProfile(profile), storage: "postgresql" };
    }
  } catch (error) {
    if (error.statusCode === 409) throw error;
    // Fall back to local storage if optional PostgreSQL is unavailable.
  }

  const store = await readLocalStore();
  if (store.users.some((user) => user.email === normalized)) {
    const error = new Error("An account already exists for this email.");
    error.statusCode = 409;
    throw error;
  }

  const user = {
    id: localId("user"),
    name: name.trim(),
    email: normalized,
    role: allowedRole,
    status: "active",
    created_at: now,
    updated_at: now,
  };
  store.users.push(user);
  store.credentials.push({ user_id: user.id, ...credential, created_at: now });
  await writeLocalStore(store);
  return { user: publicProfile(user), storage: "local-demo" };
}

export async function createSession({ userId, tokenHash, expiresAt, userAgent = "" }) {
  const now = new Date().toISOString();
  const record = {
    user_id: userId,
    token_hash: tokenHash,
    user_agent: userAgent.slice(0, 240),
    created_at: now,
    expires_at: expiresAt,
    revoked_at: null,
  };

  try {
    const remote = await supabaseRequest("auth_sessions", { method: "POST", body: record });
    if (remote) return { session: remote[0] || record, storage: "postgresql" };
  } catch {
    // Local fallback is used for demos when the optional database is unavailable.
  }

  const store = await readLocalStore();
  const session = { id: localId("session"), ...record };
  store.sessions = [session, ...(store.sessions || []).filter((item) => new Date(item.expires_at) > new Date())].slice(0, 200);
  await writeLocalStore(store);
  return { session, storage: "local-demo" };
}

export async function findSessionByTokenHash(tokenHash) {
  try {
    const remote = await supabaseRequest("auth_sessions", { query: `?token_hash=eq.${encodeURIComponent(tokenHash)}&revoked_at=is.null&select=*` });
    if (remote) {
      const session = remote[0];
      if (!session || new Date(session.expires_at) <= new Date()) return null;
      return session;
    }
  } catch {
    // Local fallback is used for demos when the optional database is unavailable.
  }

  const store = await readLocalStore();
  const session = store.sessions.find((item) => item.token_hash === tokenHash && !item.revoked_at);
  if (!session || new Date(session.expires_at) <= new Date()) return null;
  return session;
}

export async function revokeSession(tokenHash) {
  const revokedAt = new Date().toISOString();
  try {
    const remote = await supabaseRequest("auth_sessions", {
      method: "PATCH",
      query: `?token_hash=eq.${encodeURIComponent(tokenHash)}`,
      body: { revoked_at: revokedAt },
      prefer: "return=minimal",
    });
    if (remote) return;
  } catch {
    // Local fallback is used for demos when the optional database is unavailable.
  }

  const store = await readLocalStore();
  store.sessions = store.sessions.map((session) => session.token_hash === tokenHash ? { ...session, revoked_at: revokedAt } : session);
  await writeLocalStore(store);
}

export async function saveHistory(entry, userId) {
  const record = {
    user_id: userId,
    scan_type: entry.type,
    target: entry.target || null,
    risk_level: entry.riskLevel || null,
    score: typeof entry.score === "number" ? entry.score : null,
    summary: entry.summary,
    metadata: entry.metadata || {},
    created_at: new Date().toISOString(),
  };

  try {
    const remote = await supabaseRequest("scan_history", { method: "POST", body: record });
    if (remote) return { record: remote[0] || record, storage: "postgresql" };
  } catch (error) {
    record.metadata = { ...record.metadata, storageWarning: "Remote database unavailable; saved to local demo storage." };
  }

  const store = await readLocalStore();
  const localRecord = { id: localId("history"), ...record };
  store.history = [localRecord, ...(store.history || [])].slice(0, 500);
  await writeLocalStore(store);
  return { record: localRecord, storage: "local-demo" };
}

export async function savePasswordAudit(audit, userId) {
  const record = {
    user_id: userId,
    score: audit.score,
    strength_label: audit.label,
    password_length: audit.length,
    entropy: audit.entropy,
    warning_count: audit.warnings.length,
    created_at: new Date().toISOString(),
  };

  try {
    const remote = await supabaseRequest("password_audits", { method: "POST", body: record });
    if (remote) return { record: remote[0] || record, storage: "postgresql" };
  } catch {
    // Fall back to local non-sensitive storage for event demos.
  }

  const store = await readLocalStore();
  const localRecord = { id: localId("audit"), ...record };
  store.passwordAudits = [localRecord, ...(store.passwordAudits || [])].slice(0, 500);
  await writeLocalStore(store);
  return { record: localRecord, storage: "local-demo" };
}

export async function getHistory(userId, { admin = false, limit = 20 } = {}) {
  const filter = admin ? "" : `&user_id=eq.${encodeURIComponent(userId)}`;
  try {
    const remote = await supabaseRequest("scan_history", { query: `?select=*${filter}&order=created_at.desc&limit=${limit}` });
    if (remote) return { records: remote, storage: "postgresql" };
  } catch {
    // Local fallback keeps the UI usable when the optional remote database is unavailable.
  }

  const store = await readLocalStore();
  const records = (store.history || [])
    .filter((record) => admin || record.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
  return { records, storage: "local-demo" };
}

export async function getPasswordAudits(userId, { admin = false, limit = 20 } = {}) {
  const filter = admin ? "" : `&user_id=eq.${encodeURIComponent(userId)}`;
  try {
    const remote = await supabaseRequest("password_audits", { query: `?select=*${filter}&order=created_at.desc&limit=${limit}` });
    if (remote) return { records: remote, storage: "postgresql" };
  } catch {
    // Local fallback keeps the UI usable when the optional remote database is unavailable.
  }

  const store = await readLocalStore();
  const records = (store.passwordAudits || [])
    .filter((record) => admin || record.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
  return { records, storage: "local-demo" };
}

export async function getPreferences(userId) {
  try {
    const remote = await supabaseRequest("app_preferences", { query: `?user_id=eq.${encodeURIComponent(userId)}&select=*` });
    if (remote) return { preferences: remote[0]?.preferences || {}, storage: "postgresql" };
  } catch {
    // Local fallback keeps settings usable during offline demos.
  }

  const store = await readLocalStore();
  return { preferences: store.preferences?.[userId] || {}, storage: "local-demo" };
}

export async function savePreferences(userId, preferences = {}) {
  const record = {
    user_id: userId,
    preferences,
    updated_at: new Date().toISOString(),
  };

  try {
    const remote = await supabaseRequest("app_preferences", {
      method: "POST",
      query: "?on_conflict=user_id",
      body: record,
      prefer: "resolution=merge-duplicates,return=representation",
    });
    if (remote) return { preferences: remote[0]?.preferences || preferences, storage: "postgresql" };
  } catch {
    // Local fallback keeps settings usable during offline demos.
  }

  const store = await readLocalStore();
  store.preferences = { ...(store.preferences || {}), [userId]: preferences };
  await writeLocalStore(store);
  return { preferences, storage: "local-demo" };
}

export async function listUsers({ limit = 50 } = {}) {
  try {
    const remote = await supabaseRequest("profiles", { query: `?select=id,name,email,role,status,created_at,updated_at&order=created_at.desc&limit=${limit}` });
    if (remote) return { records: remote.map(publicProfile), storage: "postgresql" };
  } catch {
    // Local fallback keeps admin views usable during offline demos.
  }

  const store = await readLocalStore();
  return {
    records: [...(store.users || [])]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)
      .map(publicProfile),
    storage: "local-demo",
  };
}

export async function getAdminStats() {
  const users = await listUsers({ limit: 1000 });
  const scans = await getHistory(null, { admin: true, limit: 1000 });
  const audits = await getPasswordAudits(null, { admin: true, limit: 1000 });
  const userLookup = new Map(users.records.map((user) => [user.id, user]));

  const riskCounts = scans.records.reduce((counts, record) => {
    const key = record.risk_level || "Unknown";
    return { ...counts, [key]: (counts[key] || 0) + 1 };
  }, { Low: 0, Medium: 0, High: 0 });

  const scansByType = scans.records.reduce((counts, record) => {
    const key = record.scan_type || record.type || "unknown";
    return { ...counts, [key]: (counts[key] || 0) + 1 };
  }, {});

  return {
    storage: getStorageMode(),
    totalUsers: users.records.length,
    recentUsers: users.records.slice(0, 5),
    totalScans: scans.records.length,
    scansByType,
    recentScans: scans.records.slice(0, 8).map((record) => {
      const owner = userLookup.get(record.user_id);
      return {
        ...record,
        owner_name: owner?.name || "Unassigned demo record",
        owner_email: owner?.email || null,
      };
    }),
    riskCounts,
    passwordAuditCount: audits.records.length,
  };
}
