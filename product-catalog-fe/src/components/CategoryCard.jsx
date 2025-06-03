import { FaPencilAlt, FaTrash } from "react-icons/fa";

export default function CategoryCard({ category, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between gap-2">
      <div>
        <h3 className="text-xl font-semibold">{category.title}</h3>
        <p className="text-sm text-gray-500"> {category.description}</p>
      </div>
      <div className="flex justify-end items-center pt-4 gap-4">
        <button
          onClick={() => onEdit(category)}
          className="text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          <FaPencilAlt size={20} />
        </button>
        <button
          onClick={() => onDelete(category)}
          className="text-red-600 hover:text-red-800 cursor-pointer"
        >
          <FaTrash size={20} />
        </button>
      </div>
    </div>
  );
}
