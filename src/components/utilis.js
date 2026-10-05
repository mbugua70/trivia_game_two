import { getStoredUser } from "./api";

export async function requireAuth() {
  const user = getStoredUser();
  return Boolean(user && user.token);
}
