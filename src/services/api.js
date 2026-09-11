const REQUEST_TIMEOUT_MS = 8_000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(path, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json() : null;

    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.error || "Unable to complete the request. Please try again.");
    }

    return payload?.data ?? payload;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The request timed out. Please try again.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function getDashboard() {
  return request("/api/dashboard");
}

export function getCurrentUser() {
  return request("/api/auth/me");
}

export function registerAccount({ name, email, password, confirmPassword }) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });
}

export function loginAccount({ email, password }) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logoutAccount() {
  return request("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function getHistory() {
  return request("/api/history");
}

export function analyzePassword(password) {
  return request("/api/password/analyze", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function generatePassword(length = 20) {
  return request("/api/password/generate", {
    method: "POST",
    body: JSON.stringify({ length }),
  });
}

export function getPasswordAudits() {
  return request("/api/password/audits");
}

export function analyzeUrl(url) {
  return request("/api/url/analyze", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export function getPreferences() {
  return request("/api/settings/preferences");
}

export function savePreferences(preferences) {
  return request("/api/settings/preferences", {
    method: "POST",
    body: JSON.stringify({ preferences }),
  });
}

export function getAdminStats() {
  return request("/api/admin/stats");
}

export function getAdminUsers() {
  return request("/api/admin/users");
}

export function getAdminActivity() {
  return request("/api/admin/activity");
}
