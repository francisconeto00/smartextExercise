import { api } from "./api";

export async function getProducts({ search = "", categories = [] } = {}) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (categories.length > 0) params.append("categoryId", categories.join(","));
  return api(`/products?${params.toString()}`);
}

export async function updateProduct(id, payload) {
  return api(`/products/${id}`, { method: "PUT", body: payload });
}
