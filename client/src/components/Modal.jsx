// Modal.jsx
// Reusable modal component for Memory Farm

import React from 'react'

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal
