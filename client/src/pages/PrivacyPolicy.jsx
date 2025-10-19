import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "Introduction",
      content: "Memory Farm is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our service."
    },
    {
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, write memories, or contact us. This includes your name, email address, and the content you create."
    },
    {
      title: "How We Use Your Information",
      content: "We use your information to provide, maintain, and improve our services, send you technical notices and support messages, and respond to your comments and questions."
    },
    {
      title: "Data Security",
      content: "Your memories and personal data are stored securely. We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction."
    },
    {
      title: "Your Memories Are Private",
      content: "Your memories are private by default. Only you can see your memories unless you explicitly choose to make them public. We will never sell your personal data or memories to third parties."
    },
    {
      title: "AI and Data Processing",
      content: "Our AI analyzes your memories to provide insights and patterns. This processing happens securely, and the insights generated are visible only to you. We do not use your personal memories to train AI models for other users."
    },
    {
      title: "Data Retention",
      content: "We retain your account information for as long as your account is active. You can delete your memories at any time, and you can do a complete account deletion through your settings."
    },
    {
      title: "Contact Us",
      content: "If you have any questions about this Privacy Policy or our practices, please contact us through the help button in your account or email us at mahmoud.fawzy1992.2@gmail.com"
    }
  ];

  return (
    <motion.div 
      className="max-w-4xl mx-auto px-4 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-12">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-teal-600 hover:text-blue-600 transition-colors mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600 mb-4">
          Privacy Policy
        </h1>
        <p className="text-gray-600">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Core Promise */}
      <motion.div 
        className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-8 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start gap-4">
          <div className="text-3xl">🔒</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Our Core Privacy Promise</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Your memories are yours.</strong> We believe in absolute privacy for your personal thoughts and reflections. 
              We will never sell, share, or expose your personal data or memories to third parties. 
              Your journey of self-discovery remains completely private unless you explicitly choose to share specific memories publicly.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Policy Sections */}
      <div className="space-y-8">
        {sections.map((section, index) => (
          <motion.section
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-teal-600">▸</span>
              {section.title}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {section.content}
            </p>
          </motion.section>
        ))}
      </div>

      {/* Summary Box */}
      <motion.div 
        className="mt-12 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-2xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-2xl font-bold mb-4">In Simple Terms</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>We only collect what's necessary to provide our service</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>Your memories stay private unless you choose otherwise</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>We never sell your data</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>You can delete your data anytime</span>
          </li>
        </ul>
      </motion.div>

      {/* Footer Actions */}
      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">
          Have questions about your privacy?
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          Login to Contact Support
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
}