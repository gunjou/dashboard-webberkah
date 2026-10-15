const TOKEN_KEY = "token";

export const getValidDashboardToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("JWT tidak valid");

    // Decode payload JWT (base64url)
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");

    const payload = JSON.parse(
      atob(payloadBase64.padEnd(Math.ceil(payloadBase64.length / 4) * 4, "=")),
    );

    const now = Math.floor(Date.now() / 1000);

    if (
      !payload.exp ||
      payload.exp <= now ||
      payload.account_type !== "dashboard"
    ) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }

    return {
      token,
      expiresAt: payload.exp * 1000,
    };
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
};

export const clearDashboardToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};
