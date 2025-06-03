import { useEffect, useState } from "react";
import GridWrapper from "../components/common/GridWrapper";
import CategoryCard from "../components/CategoryCard";
import SearchAndFilterBar from "../components/common/SearchAndFilterBar";
import CategoryForm from "../components/forms/CategoryForm";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categories";
import { useDisclosure } from "@mantine/hooks";
import { Modal } from "@mantine/core";
import ConfirmModal from "../components/modals/ConfirmModal";
import { useQueryParams } from "../hooks/useQueryParams";
import PaginationControls from "../components/common/PaginationControls";
import { toast } from "react-toastify";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [confirmOpened, setConfirmOpened] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const { getQueryParam } = useQueryParams();
  const searchQuery = getQueryParam("search") || "";
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    totalPages: 1,
  });

  const page = parseInt(getQueryParam("page") || "1");
  const pageSize = parseInt(getQueryParam("pageSize") || "12");
  const fetchCategories = () => {
    return getCategories({
      search: searchQuery,
      page,
      pageSize,
    })
      .then(({ data, pagination }) => {
        setCategories(data);
        setPagination(pagination);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err.message);
      });
  };
  useEffect(() => {
    fetchCategories();
  }, [searchQuery, page, pageSize]);

  const handleEdit = (category) => {
    setSelectedCategory(category);
    open();
  };

  const handleDelete = async (category) => {
    setCategoryToDelete(category);
    setConfirmOpened(true);
  };
  const handleCancelDelete = () => {
    setConfirmOpened(false);
    setCategoryToDelete(null);
  };
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete.id);
      toast.success("Category successfully deleted");
      fetchCategories();
      setConfirmOpened(false);
      setCategoryToDelete(null);
    } catch (err) {
      toast.eror("Something went wrong");
      console.error("Error deleting category:", err.message);
    }
  };
  const handleCategorySubmit = async (formData) => {
    try {
      if (selectedCategory) {
        const updated = await updateCategory(selectedCategory.id, {
          title: formData.title,
          description: formData.description,
        });
        toast.success("Category successfully updated");
        setCategories((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
      } else {
        await createCategory({
          title: formData.title,
          description: formData.description,
        });
        toast.success("Category successfully created");
        fetchCategories();
      }

      close();
      setSelectedCategory(null);
    } catch (err) {
      console.error("Error saving category:", err.message);
      toast.eror("Something went wrong");
    }
  };
  return (
    <div className="pb-10">
      <h2 className="text-2xl font-semibold mb-4">Categories</h2>
      <div className="flex flex-row gap-4 w-full">
        <a
          href="/products"
          className="bg-green-500 text-white px-4 py-1 h-[36px] rounded hover:bg-green-700 cursor-pointer"
        >
          Products
        </a>

        <SearchAndFilterBar searchKey="search">
          <button
            onClick={() => {
              setSelectedCategory(null);
              open();
            }}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            New
          </button>
        </SearchAndFilterBar>
      </div>
      <div className="mt-5 min-h-[70dvh] flex flex-col justify-between">
        <GridWrapper>
          {categories.length ? (
            categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <p>No categories found.</p>
          )}
        </GridWrapper>
        <PaginationControls
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalPages={pagination.totalPages}
        />
      </div>
      <Modal
        opened={opened}
        onClose={close}
        title={selectedCategory ? "Edit Category" : "New Category"}
        centered
        size="lg"
        lockScroll={true}
      >
        <CategoryForm
          initialValues={selectedCategory || {}}
          onSubmit={handleCategorySubmit}
          onCancel={close}
        />
      </Modal>
      <ConfirmModal
        opened={confirmOpened}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message={`Delete "${
          categoryToDelete?.title || ""
        }". This action cannot be undone.`}
      />
    </div>
  );
}
