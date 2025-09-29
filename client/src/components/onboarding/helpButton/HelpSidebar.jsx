import { motion, AnimatePresence } from 'framer-motion';
import HelpNavigation from './HelpNavigation';
import HelpContent from './HelpContent';
import ContactForm from './ContactForm';

/**
 * Help sidebar component containing navigation and content
 */
export default function HelpSidebar({ 
  isOpen, 
  onClose, 
  activeSection, 
  onSectionChange, 
  isContactFormOpen, 
  onContactClick, 
  onContactBack 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-25 z-30"
          />

          {/* Sidebar - Responsive width: full on mobile, fixed on desktop */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-40 flex flex-col pt-16"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Help & FAQ</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close help sidebar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Find answers to common questions
              </p>
            </div>

            {/* Navigation */}
            <div className="border-b border-gray-200">
              <HelpNavigation 
                activeSection={activeSection}
                onSectionChange={onSectionChange}
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {!isContactFormOpen ? (
                <HelpContent 
                  activeSection={activeSection}
                  onContactClick={onContactClick}
                />
              ) : (
                <ContactForm onBack={onContactBack} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}