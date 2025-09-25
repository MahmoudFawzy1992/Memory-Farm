import { useState } from 'react';
import { motion } from 'framer-motion';
import HelpSidebar from './helpButton/HelpSidebar';

export default function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('getting-started');
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  const toggleHelp = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActiveSection('getting-started');
      setIsContactFormOpen(false);
    }
  };

  const handleContactClick = () => {
    setIsContactFormOpen(true);
  };

  const handleContactBack = () => {
    setIsContactFormOpen(false);
  };

  return (
    <>
      {/* Help Button */}
      <motion.button
        onClick={toggleHelp}
        className={`fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full shadow-lg transition-all duration-200 ${
          isOpen 
            ? 'bg-purple-600 text-white' 
            : 'bg-white text-purple-600 hover:bg-purple-50'
        } border-2 border-purple-200 hover:border-purple-400`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Help & FAQ"
      >
        <div className="flex items-center justify-center">
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
      </motion.button>

      {/* Help Sidebar */}
      <HelpSidebar
        isOpen={isOpen}
        onClose={toggleHelp}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isContactFormOpen={isContactFormOpen}
        onContactClick={handleContactClick}
        onContactBack={handleContactBack}
      />
    </>
  );
}