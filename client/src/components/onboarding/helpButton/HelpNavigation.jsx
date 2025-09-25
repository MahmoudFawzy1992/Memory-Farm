import { HELP_SECTIONS } from '../../../constants/helpFaqData';

/**
 * Navigation component for help sidebar sections
 */
export default function HelpNavigation({ activeSection, onSectionChange }) {
  return (
    <nav className="p-4">
      <div className="space-y-1">
        {HELP_SECTIONS.map((section) => (
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