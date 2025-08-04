// /src/context/NotificationContext.jsx
import { createContext, useContext, useState } from 'react'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [message, setMessage] = useState(null)
  const [type, setType] = useState('success')

  const showNotification = (msg, type = 'success') => {
    setMessage(msg)
    setType(type)
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {message && (
        <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-md text-white shadow-lg transition-all duration-300
          ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
          {message}
        </div>
      )}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  return useContext(NotificationContext)
}
