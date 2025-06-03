import { api } from "./api";

export async function getCategories({
  search = "",
  categories = [],
  page = 1,
  pageSize = 12,
  all = false,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (categories.length > 0) params.append("categoryId", categories.join(","));
  params.append("page", page);
  params.append("pageSize", pageSize);
  params.append("all", all);
  return api(`/categories?${params.toString()}`);
}

export async function createCategory(payload) {
  return api("/categories", {
    method: "POST",
    body: payload,
  });
}

export async function updateCategory(id, payload) {
  return api(`/categories/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteCategory(id) {
  return api(`/categories/${id}`, {
    method: "DELETE",
  });
}
