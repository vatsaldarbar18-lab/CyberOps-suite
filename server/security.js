import crypto from "node:crypto";

const COMMON_PASSWORD_PARTS = [
  "password",
  "admin",
  "welcome",
  "qwerty",
  "letmein",
  "cyberops",
  "college",
  "student",
  "demo",
  "123456",
];

const SENSITIVE_QUERY_KEYS = ["token", "key", "secret", "password", "passwd", "auth", "session"];

function hasSequentialRun(value) {
  const normalized = value.toLowerCase();
  const sequences = ["abcdefghijklmnopqrstuvwxyz", "qwertyuiop", "asdfghjkl", "zxcvbnm", "0123456789"];
  return sequences.some((sequence) => {
    for (let index = 0; index <= sequence.length - 4; index += 1) {
      if (normalized.includes(sequence.slice(index, index + 4))) return true;
    }
    return false;
  });
}

function estimateCharsetSize(password) {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/\d/.test(password)) size += 10;
  if (/[^A-Za-z0-9]/.test(password)) size += 32;
  return Math.max(size, 1);
}

export function analyzePassword(password) {
  const warnings = [];
  const recommendations = [];
  const length = password.length;
  const charsetSize = estimateCharsetSize(password);
  const entropy = Number((length * Math.log2(charsetSize)).toFixed(1));

  let score = 0;
  score += Math.min(32, length * 2);
  score += /[a-z]/.test(password) ? 12 : 0;
  score += /[A-Z]/.test(password) ? 12 : 0;
  score += /\d/.test(password) ? 12 : 0;
  score += /[^A-Za-z0-9]/.test(password) ? 14 : 0;
  score += length >= 16 ? 12 : 0;
  score += entropy >= 80 ? 6 : 0;

  if (length < 12) {
    score -= 20;
    warnings.push("Password is shorter than the recommended 12 characters.");
    recommendations.push("Use at least 14 to 16 characters for important accounts.");
  }
  if (!/[a-z]/.test(password)) recommendations.push("Add lowercase letters.");
  if (!/[A-Z]/.test(password)) recommendations.push("Add uppercase letters.");
  if (!/\d/.test(password)) recommendations.push("Add numbers.");
  if (!/[^A-Za-z0-9]/.test(password)) recommendations.push("Add symbols.");
  if (/(.)\1{2,}/.test(password)) {
    score -= 14;
    warnings.push("Password contains repeated characters.");
    recommendations.push("Avoid repeated characters and predictable padding.");
  }
  if (hasSequentialRun(password)) {
    score -= 16;
    warnings.push("Password contains a keyboard or numeric sequence.");
    recommendations.push("Avoid keyboard walks and simple number sequences.");
  }
  if (COMMON_PASSWORD_PARTS.some((part) => password.toLowerCase().includes(part))) {
    score -= 22;
    warnings.push("Password contains a common word or demo term.");
    recommendations.push("Avoid common words, event names, team names, and demo labels.");
  }

  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
  const label =
    normalizedScore >= 90 ? "Excellent" :
    normalizedScore >= 75 ? "Strong" :
    normalizedScore >= 55 ? "Fair" :
    normalizedScore >= 35 ? "Weak" :
    "Very weak";

  return {
    score: normalizedScore,
    label,
    entropy,
    length,
    warnings,
    recommendations: recommendations.length ? recommendations : ["This password follows the checked local policy signals."],
  };
}

export function generatePassword(options = {}) {
  const length = Math.max(16, Math.min(Number(options.length) || 20, 64));
  const groups = [
    "abcdefghijkmnopqrstuvwxyz",
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "23456789",
    "!@#$%^&*()-_=+[]{}",
  ];
  const allCharacters = groups.join("");
  const required = groups.map((group) => group[crypto.randomInt(group.length)]);
  const remaining = Array.from({ length: length - required.length }, () => allCharacters[crypto.randomInt(allCharacters.length)]);
  return [...required, ...remaining]
    .sort(() => crypto.randomInt(3) - 1)
    .join("");
}

function isPrivateHostname(hostname) {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    /^10\./.test(hostname) ||
    /^127\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

export function analyzeUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    const error = new Error("Enter a valid URL including https:// or http://.");
    error.statusCode = 400;
    throw error;
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    const error = new Error("Only http:// and https:// URLs can be reviewed.");
    error.statusCode = 400;
    throw error;
  }

  const findings = [];
  const recommendations = [];
  let score = 10;

  if (parsed.protocol === "http:") {
    score += 35;
    findings.push({ level: "High", message: "URL uses unencrypted HTTP." });
    recommendations.push("Prefer HTTPS for pages that collect or display any sensitive information.");
  } else {
    findings.push({ level: "Low", message: "URL uses HTTPS syntax." });
  }

  if (parsed.username || parsed.password) {
    score += 30;
    findings.push({ level: "High", message: "Credentials appear in the URL authority section." });
    recommendations.push("Never place usernames, passwords, or tokens directly in URLs.");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname.includes("xn--")) {
    score += 18;
    findings.push({ level: "Medium", message: "Hostname uses punycode, which can be abused for lookalike domains." });
    recommendations.push("Verify the intended domain spelling before sharing this URL.");
  }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    score += 16;
    findings.push({ level: "Medium", message: "URL uses an IPv4 address instead of a named domain." });
    recommendations.push("Use named domains with managed certificates where possible.");
  }
  if (isPrivateHostname(hostname)) {
    score += 12;
    findings.push({ level: "Medium", message: "URL points to a local or private address." });
    recommendations.push("Keep private addresses out of public reports and screenshots.");
  }
  if (parsed.port && !["80", "443"].includes(parsed.port)) {
    score += 8;
    findings.push({ level: "Low", message: `URL uses non-standard port ${parsed.port}.` });
    recommendations.push("Confirm that the exposed port is intentional and documented.");
  }

  const sensitiveParams = [...parsed.searchParams.keys()].filter((key) => SENSITIVE_QUERY_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive)));
  if (sensitiveParams.length) {
    score += 28;
    findings.push({ level: "High", message: "Query string appears to contain sensitive parameter names." });
    recommendations.push("Move secrets out of URLs because URLs are commonly logged and shared.");
  }

  const subdomainDepth = hostname.split(".").filter(Boolean).length;
  if (subdomainDepth > 4) {
    score += 8;
    findings.push({ level: "Low", message: "Hostname has an unusually deep subdomain structure." });
  }

  if (rawUrl.length > 180) {
    score += 8;
    findings.push({ level: "Low", message: "URL is long enough to hide important details." });
  }

  const normalizedScore = Math.max(0, Math.min(100, score));
  const hasHighFinding = findings.some((finding) => finding.level === "High");
  const hasMediumFinding = findings.some((finding) => finding.level === "Medium");
  const riskLevel = hasHighFinding || normalizedScore >= 70 ? "High" : hasMediumFinding || normalizedScore >= 40 ? "Medium" : "Low";
  const safeTarget = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;

  return {
    target: safeTarget,
    hostname,
    riskLevel,
    score: normalizedScore,
    findings,
    recommendations: recommendations.length ? recommendations : ["No high-risk URL syntax issues were found by this local review."],
    note: "This review validates URL syntax and configuration signals only. It does not contact the target or scan infrastructure.",
  };
}
