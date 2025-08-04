export default function DeleteAccountModal({ onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
        <h2 className="text-xl font-bold mb-4 text-red-600">Delete Account</h2>
        <p className="text-sm mb-6">
          Are you sure you want to delete your account? This action is permanent
          and cannot be undone.
        </p>

        <div className="flex justify-between">
          <button
            className="bg-gray-200 px-4 py-2 rounded text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded text-sm"
            onClick={onConfirm}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
