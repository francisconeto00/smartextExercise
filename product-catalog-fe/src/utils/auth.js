import { api } from "../services/api";

export function redirectToLogin() {
  if (window.location.pathname !== "/") {
    window.location.href = "/";
  }
}

export async function checkAuth() {
  try {
    await api("/auth/check");
    return true;
  } catch (e) {
    console.log("error", e);
    return false;
  }
}
