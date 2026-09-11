import crypto from "node:crypto";

const SESSION_BYTES = 32;
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 7);
export const sessionCookieName = "cyberops_session";

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function validatePasswordPolicy(password) {
  const errors = [];
  if (typeof password !== "string" || password.length < 12) errors.push("Password must be at least 12 characters.");
  if (!/[a-z]/.test(password)) errors.push("Password must include a lowercase letter.");
  if (!/[A-Z]/.test(password)) errors.push("Password must include an uppercase letter.");
  if (!/\d/.test(password)) errors.push("Password must include a number.");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("Password must include a symbol.");
  if (password.length > 128) errors.push("Password must be 128 characters or fewer.");
  return errors;
}

export async function hashPassword(password, salt = crypto.randomBytes(16).toString("base64")) {
  const key = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });

  return {
    password_hash: key.toString("base64"),
    password_salt: salt,
    password_params: "scrypt:N=16384,r=8,p=1,keylen=64",
  };
}

export async function verifyPassword(password, credential) {
  if (!credential?.password_hash || !credential?.password_salt) return false;
  const hashed = await hashPassword(password, credential.password_salt);
  const expected = Buffer.from(credential.password_hash, "base64");
  const actual = Buffer.from(hashed.password_hash, "base64");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export function createSessionToken() {
  return crypto.randomBytes(SESSION_BYTES).toString("base64url");
}

export function hashSessionToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function sessionExpiryIso() {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

export function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [name, ...value] = part.split("=");
        return [decodeURIComponent(name), decodeURIComponent(value.join("="))];
      }),
  );
}

export function buildSessionCookie(token) {
  const secure = process.env.AUTH_COOKIE_SECURE === "true" ? "; Secure" : "";
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  return `${sessionCookieName}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

export function buildLogoutCookie() {
  const secure = process.env.AUTH_COOKIE_SECURE === "true" ? "; Secure" : "";
  return `${sessionCookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`;
}

export function publicUser(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    status: profile.status || "active",
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}
