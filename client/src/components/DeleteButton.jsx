function DeleteButton({ onDelete }) {
  return (
    <button
      onClick={onDelete}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Delete
    </button>
  )
}

export default DeleteButton
