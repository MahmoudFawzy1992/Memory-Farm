import { FAQ_DATA } from '../../../constants/helpFaqData';

/**
 * Help content component displaying FAQ for selected section
 */
export default function HelpContent({ activeSection, onContactClick }) {
  const currentFAQ = FAQ_DATA[activeSection] || [];

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