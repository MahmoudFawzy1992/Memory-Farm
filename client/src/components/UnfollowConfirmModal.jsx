export default function UnfollowConfirmModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center shadow-xl">
        <h2 className="text-xl font-bold text-red-600 mb-4">Unfollow User</h2>
        <p className="text-sm mb-6">
          Are you sure you want to unfollow this user? You won’t see their private memories anymore.
        </p>

        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded text-sm"
          >
            Yes, Unfollow
          </button>
        </div>
      </div>
    </div>
  );
}
