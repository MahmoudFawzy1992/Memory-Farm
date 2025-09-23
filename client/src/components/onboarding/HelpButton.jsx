import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

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
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleHelp}
              className="fixed inset-0 bg-black bg-opacity-25 z-30"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-40 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Help & FAQ</h2>
                  <button
                    onClick={toggleHelp}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Find answers to common questions
                </p>
              </div>

              {/* Navigation */}
              <div className="border-b border-gray-200">
                <HelpNavigation 
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                />
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {!isContactFormOpen ? (
                  <HelpContent 
                    activeSection={activeSection}
                    onContactClick={() => setIsContactFormOpen(true)}
                  />
                ) : (
                  <ContactForm onBack={() => setIsContactFormOpen(false)} />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function HelpNavigation({ activeSection, onSectionChange }) {
  const sections = [
    { id: 'getting-started', label: '🚀 Getting Started', icon: '🚀' },
    { id: 'creating-memories', label: '📝 Creating Memories', icon: '📝' },
    { id: 'insights', label: '💡 Insights', icon: '💡' },
    { id: 'discover', label: '🌍 Discover', icon: '🌍' },
    { id: 'account', label: '⚙️ Account', icon: '⚙️' }
  ];

  return (
    <nav className="p-4">
      <div className="space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              activeSection === section.id
                ? 'bg-purple-100 text-purple-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">{section.icon}</span>
            {section.label.replace(/^.+\s/, '')}
          </button>
        ))}
      </div>
    </nav>
  );
}

function HelpContent({ activeSection, onContactClick }) {
  const faqData = {
    'getting-started': [
      {
        q: 'How do I create my first memory?',
        a: 'Click the "New Memory" button, add a title, select your emotion, choose a color, and start writing! The mood tracker block is automatically added to capture your feelings.'
      },
      {
        q: 'What are insights and how do they work?',
        a: 'Insights are personalized discoveries about your emotional patterns and writing habits. They appear automatically as you create memories, helping you understand your emotional journey.'
      },
      {
        q: 'Can I make my memories private?',
        a: 'Yes! By default, memories are private. You can toggle the privacy setting when creating or editing a memory to make it public and visible in the Discover feed.'
      }
    ],
    'creating-memories': [
      {
        q: 'What content blocks can I add to memories?',
        a: 'You can add text blocks, images, todo lists, headings, mood trackers, and dividers. Use the floating + button to access all available block types.'
      },
      {
        q: 'How do I add images to my memories?',
        a: 'Click the + button and select the image block. You can upload up to 10 images per block and 20 images total per memory. Each image should be under 1MB.'
      },
      {
        q: 'Can I edit memories after creating them?',
        a: 'Yes! Click on any memory card and use the edit button to modify the title, content, emotion, color, or privacy settings.'
      },
      {
        q: 'What emotions can I choose from?',
        a: 'Memory Farm includes 50+ emotions organized into families like Joy, Sadness, Anger, Fear, Surprise, Calm, Nostalgia, and Love. Just start typing to search!'
      }
    ],
    'insights': [
      {
        q: 'When will I receive my first insight?',
        a: 'You\'ll get your first insight after creating your first memory, then receive new insights every 5 memories. Insights celebrate milestones and reveal emotional patterns.'
      },
      {
        q: 'What types of insights will I see?',
        a: 'You\'ll discover your dominant emotions, writing patterns, consistency streaks, emotional diversity, and personalized encouragement based on your unique journey.'
      },
      {
        q: 'Where can I view my past insights?',
        a: 'All your insights are saved on your Dashboard page as cards. You can mark them as favorites and review your personal discoveries anytime.'
      }
    ],
    'discover': [
      {
        q: 'What is the Discover page?',
        a: 'Discover shows public memories shared by the Memory Farm community. Browse inspiring stories, explore different emotions, and connect with others\' experiences.'
      },
      {
        q: 'How do I make my memory visible in Discover?',
        a: 'When creating or editing a memory, toggle the privacy setting to "Public". Only you control what you share with the community.'
      },
      {
        q: 'Can I follow other users?',
        a: 'Yes! Visit any user\'s profile to follow them and see their public memories. You can also view your followers and following list.'
      }
    ],
    'account': [
      {
        q: 'How do I change my profile information?',
        a: 'Go to Settings from the profile menu. You can update your display name, bio, location, and privacy preferences.'
      },
      {
        q: 'Can I export my memories?',
        a: 'Memory export features are coming soon! For now, you can copy content from individual memories.'
      },
      {
        q: 'How do I delete my account?',
        a: 'In Settings, scroll to the bottom and click "Delete Account". This action is permanent and cannot be undone.'
      }
    ]
  };

  const currentFAQ = faqData[activeSection] || [];

  return (
    <div className="p-6">
      <div className="space-y-6">
        {currentFAQ.map((item, index) => (
          <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
            <h3 className="font-medium text-gray-900 mb-2 text-sm">
              {item.q}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {item.a}
            </p>
          </div>
        ))}
      </div>

      {/* Contact section */}
      <div className="mt-8 p-4 bg-purple-50 rounded-xl border border-purple-200">
        <h3 className="font-medium text-purple-900 mb-2">
          Still need help?
        </h3>
        <p className="text-sm text-purple-700 mb-3">
          Can't find what you're looking for? Send us a message and we'll help you out!
        </p>
        <button
          onClick={onContactClick}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          📧 Contact Support
        </button>
      </div>
    </div>
  );
}

function ContactForm({ onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // For now, just show success message
      // In production, this would send to your support system
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Message sent! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
      onBack();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-medium text-gray-900">Contact Support</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            placeholder="Your full name"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            placeholder="your@email.com"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
            placeholder="Tell us how we can help you..."
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Sending...
            </span>
          ) : (
            'Send Message'
          )}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-600">
          💡 <strong>Tip:</strong> Include as much detail as possible to help us assist you better!
        </p>
      </div>
    </div>
  );
}