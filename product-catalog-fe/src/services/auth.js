import { api } from "./api";

export async function login(username, password) {
  return api("/login", { method: "POST", body: { username, password } });
}

export async function register(username, password) {
  return api("/register", { method: "POST", body: { username, password } });
}
