// ConfirmDeleteModal.jsx
import React from 'react'
import Modal from './Modal'

function ConfirmDeleteModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Are you sure you want to delete this memory?
      </h3>
      <div className="flex justify-end gap-4">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
        >
          Yes, delete
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDeleteModal