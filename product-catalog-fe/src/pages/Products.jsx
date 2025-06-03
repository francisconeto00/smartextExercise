import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  getProducts,
  updateProduct,
  deleteProducts,
  createProduct,
} from "../services/products";
import { getCategories } from "../services/categories";
import SearchAndFilterBar from "../components/common/SearchAndFilterBar";
import ProductCard from "../components/common/ProductCard";
import GridWrapper from "../components/common/GridWrapper";
import { useQueryParams } from "../hooks/useQueryParams";
import ProductForm from "../components/forms/ProductForm";
import { useDisclosure } from "@mantine/hooks";
import { Modal } from "@mantine/core";
import ConfirmModal from "../components/modals/ConfirmModal";
import PaginationControls from "../components/common/PaginationControls";
import { toast } from "react-toastify";

export default function Products() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const location = useLocation();
  const { getQueryParam } = useQueryParams();
  const searchQuery = getQueryParam("search") || "";
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    totalPages: 1,
  });

  const [confirmOpened, setConfirmOpened] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const selectedCategories = useMemo(() => {
    const raw = getQueryParam("categories");
    return raw ? raw.split(",") : [];
  }, [location.search]);

  const page = parseInt(getQueryParam("page") || "1");
  const pageSize = parseInt(getQueryParam("pageSize") || "12");

  useEffect(() => {
    getCategories({ all: true })
      .then(({ data }) => {
        // Map categories to { value, label }
        const mapped = data.map((c) => ({
          value: String(c.id),
          label: c.title,
        }));
        setCategories(mapped);
      })
      .catch((err) => {
        console.log(err.message || "Error fetching categories");
      });
  }, []);
  const fetchProducts = () => {
    return getProducts({
      search: searchQuery,
      categories: selectedCategories,
      page,
      pageSize,
    })
      .then(({ data, pagination }) => {
        setProducts(data);
        setPagination(pagination);
      })
      .catch((err) => {
        console.log(err.message || "Error fetching products");
      });
  };
  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategories, page, pageSize]);

  const handleEdit = (product) => {
    setSelectedProduct(product);
    open();
  };

  const handleEditSubmit = async (formData) => {
    if (!selectedProduct) {
      try {
        await createProduct({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          categoryId: formData.categoryId,
        });
        fetchProducts();
        toast.success("Product successfully created");
        close();
      } catch (error) {
        console.error("Error saving Product:", error.message);
        toast.eror("Something went wrong");
      }
    } else {
      try {
        const updated = await updateProduct(selectedProduct.id, {
          title: formData.title,
          description: formData.description,
          price: formData.price,
          categoryId: formData.categoryId,
        });
        toast.success("Product successfully updated");
        const matchedCategory = categories.find(
          (c) => c.value === String(formData.categoryId)
        );

        const enrichedProduct = {
          ...updated,
          category: {
            id: formData.categoryId,
            title: matchedCategory?.label || "Category not found",
          },
        };

        setProducts((prev) =>
          prev.map((p) => (p.id === enrichedProduct.id ? enrichedProduct : p))
        );

        close();
      } catch (error) {
        console.error("Error saving Product:", error.message);
        toast.eror("Something went wrong");
      }
    }
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setConfirmOpened(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProducts([productToDelete.id]);

      await fetchProducts();
      toast.success("Product successfully deleted");
      setConfirmOpened(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error.message);
      toast.eror("Something went wrong");
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpened(false);
    setProductToDelete(null);
  };

  return (
    <div className="pb-10">
      <h2 className="text-2xl font-semibold mb-4">Products</h2>
      <div className="flex flex-row gap-4 w-full">
        <a
          href="/categories"
          className="bg-orange-500 text-white px-4 py-1 h-[36px] rounded hover:bg-orange-700"
        >
          Categories
        </a>
        <SearchAndFilterBar
          searchKey="search"
          filterKey="categories"
          filterOptions={categories}
        >
          <button
            onClick={() => {
              setSelectedProduct(null);
              open();
            }}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            New
          </button>
        </SearchAndFilterBar>
      </div>
      <div className="mt-5 min-h-[80dvh] flex flex-col justify-between">
        <GridWrapper>
          {products.length ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <p>No products found.</p>
          )}
        </GridWrapper>
        <PaginationControls
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalPages={pagination.totalPages}
        />
      </div>

      <ConfirmModal
        opened={confirmOpened}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message={`Delete "${
          productToDelete?.title || ""
        }". This action cannot be undone.`}
      />
      <Modal
        opened={opened}
        onClose={close}
        title={selectedProduct ? "Edit Product" : "New Product"}
        centered
        size="lg"
        lockScroll={true}
      >
        <ProductForm
          initialValues={selectedProduct || {}}
          categories={categories}
          onSubmit={(formData) => {
            handleEditSubmit(formData);
          }}
          onCancel={close}
        />
      </Modal>
    </div>
  );
}
