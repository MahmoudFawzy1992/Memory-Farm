export default function MemoryControls({
  isPublic,
  onEdit,
  onDelete,
  onToggleVisibility,
}) {
  return (
    <div className="mt-4 flex justify-between items-center">
      <button
        onClick={onToggleVisibility}
        className={`text-xs px-3 py-1 rounded ${
          isPublic ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {isPublic ? "🌍 Public" : "🔒 Private"}
      </button>

      <div className="flex gap-3">
        <button
          onClick={onEdit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
