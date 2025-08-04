// NotFound.jsx
// Displays a 404 error message when a user visits an unknown route

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function NotFound() {
  return (
    <motion.div
      className="min-h-[60vh] flex flex-col justify-center items-center text-center p-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-6xl font-bold text-purple-600 mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-6">Oops! We couldn't find that page.</p>
      <Link
        to="/"
        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
      >
        🏡 Go Back Home
      </Link>
    </motion.div>
  )
}

export default NotFound
