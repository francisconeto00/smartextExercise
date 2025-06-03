import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getProducts, updateProduct } from "../services/products";
import { getCategories } from "../services/categories";
import SearchAndFilterBar from "../components/common/SearchAndFilterBar";
import ProductCard from "../components/common/ProductCard";
import GridWrapper from "../components/common/GridWrapper";
import { useQueryParams } from "../hooks/useQueryParams";
import ProductForm from "../components/forms/ProductForm";
import { useDisclosure } from "@mantine/hooks";
import { Modal } from "@mantine/core";
import ConfirmModal from "../components/modals/ConfirmModal";

export default function Products() {
const [categories, setCategories] = useState([]);
const [products, setProducts] = useState([]);
const location = useLocation();
const { getQueryParam } = useQueryParams();
const searchQuery = getQueryParam("search") || "";
const [opened, { open, close }] = useDisclosure(false);
const [selectedProduct, setSelectedProduct] = useState(null);

const [confirmOpened, setConfirmOpened] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

const selectedCategories = useMemo(() => {
  const raw = getQueryParam("categories");
  return raw ? raw.split(",") : [];
}, [location.search]);

  useEffect(() => {
    getCategories()
      .then((data) => {
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
  
  useEffect(() => {
    getProducts({ search: searchQuery, categories: selectedCategories })
      .then(setProducts)
      .catch((err) => {
        console.log(err.message || "Error fetching products");
      });
  }, [searchQuery, selectedCategories]);

   const handleEdit = (product) => {
    setSelectedProduct(product);
    open();
  };
  const handleEditSubmit = async (formData) => {
    if (!selectedProduct) return;

    try {
      const updated = await updateProduct(selectedProduct.id, {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        categoryId: formData.categoryId,
      });

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
    }
  };

   const handleDelete = (product) => {
    setProductToDelete(product);
    setConfirmOpened(true);
  };

    const handleConfirmDelete = () => {
    if (productToDelete) {
      console.log("Product to delete id:", productToDelete.id);
     
    }
    setConfirmOpened(false);
    setProductToDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpened(false);
    setProductToDelete(null);
  };
  
  return (
    <div>
       <SearchAndFilterBar
        searchKey="search"
        filterKey="categories"
        filterOptions={categories}
      />

      <div className="mt-5">
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
        <Modal
        opened={opened}
        onClose={close}
        title="Editar Produto"
        centered
        size="lg"
        lockScroll={false} 
      >
        {selectedProduct && (
          <ProductForm
            initialValues={selectedProduct}
            categories={categories}
            onSubmit={handleEditSubmit}
            onCancel={close}
          />
        )}
      </Modal>

       <ConfirmModal
          opened={confirmOpened}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          message={`Delete "${productToDelete?.title || ""}". This action cannot be undone.`}
        />
      </div>
    </div>
  )
}
