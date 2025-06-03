import { IconPencil, IconTrash } from "@tabler/icons-react";

export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between gap-2">
      <div>
        <h3 className="text-xl font-semibold">{product.title}</h3>
        <p className="text-gray-600 text-sm mb-2">{product.description}</p>
        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
          {product.category?.title}
        </span>
      </div>
      <div className="flex justify-between items-center pt-4">
        <span className="text-lg font-bold text-primary">
          €{product.price.toFixed(2)}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="text-blue-600 hover:text-blue-800"
          >
            <IconPencil size={20} />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="text-red-600 hover:text-red-800"
          >
            <IconTrash size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
