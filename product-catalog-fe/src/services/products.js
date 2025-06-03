import { api } from "./api";

export async function getProducts({
  search = "",
  categories = [],
  page = 1,
  pageSize = 10,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (categories.length > 0) params.append("categoryId", categories.join(","));
  params.append("page", page);
  params.append("pageSize", pageSize);
  return api(`/products?${params.toString()}`);
}

export async function updateProduct(id, payload) {
  return api(`/products/${id}`, { method: "PUT", body: payload });
}

export async function deleteProducts(ids = []) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("ids must be a non-empty array");
  }

  return api(`/products`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });
}
