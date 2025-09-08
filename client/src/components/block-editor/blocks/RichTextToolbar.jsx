import { useState } from 'react';
import { motion } from 'framer-motion';
import ColorPickerDropdown from './ColorPickerDropdown';
import HeadingSelector from './HeadingSelector';
import { TEXT_COLORS } from '../../../utils/richTextUtils';

export default function RichTextToolbar({ 
  onFormat, 
  activeFormats = {},
  show = false 
}) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const formatButtons = [
    {
      id: 'bold',
      icon: 'B',
      label: 'Bold',
      shortcut: 'Cmd+B',
      isActive: activeFormats.bold
    },
    {
      id: 'italic',
      icon: 'I',
      label: 'Italic', 
      shortcut: 'Cmd+I',
      isActive: activeFormats.italic
    },
    {
      id: 'underline',
      icon: 'U',
      label: 'Underline',
      shortcut: 'Cmd+U', 
      isActive: activeFormats.underline
    },
    {
      id: 'strikethrough',
      icon: 'S',
      label: 'Strikethrough',
      shortcut: 'Cmd+Shift+X',
      isActive: activeFormats.strikethrough
    }
  ];

  const handleDropdownToggle = (dropdownName, isOpen) => {
    setOpenDropdown(isOpen ? dropdownName : null);
  };

  const handleTextColorSelect = (color) => {
    onFormat('textColor', color);
  };

  const handleBackgroundColorSelect = (color) => {
    onFormat('backgroundColor', color);
  };

  const handleHeadingSelect = (level) => {
    onFormat('heading', level);
  };

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm flex-wrap"
    >
      {/* Heading selector */}
      <HeadingSelector
        onSelect={handleHeadingSelect}
        isOpen={openDropdown === 'heading'}
        onToggle={(isOpen) => handleDropdownToggle('heading', isOpen)}
      />

      <div className="w-px h-6 bg-gray-200" />

      {/* Basic formatting buttons */}
      {formatButtons.map((button) => (
        <button
          type="button"
          key={button.id}
          onClick={() => onFormat(button.id)}
          className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold transition-colors ${
            button.isActive
              ? 'bg-purple-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={`${button.label} (${button.shortcut})`}
        >
          <span style={{ 
            fontFamily: button.id === 'strikethrough' ? 'inherit' : 'serif',
            textDecoration: button.id === 'strikethrough' ? 'line-through' : 'none'
          }}>
            {button.icon}
          </span>
        </button>
      ))}

      <div className="w-px h-6 bg-gray-200" />

      {/* Color pickers */}
      <ColorPickerDropdown
        colors={TEXT_COLORS}
        onSelect={handleTextColorSelect}
        isOpen={openDropdown === 'textColor'}
        onToggle={(isOpen) => handleDropdownToggle('textColor', isOpen)}
        title="Text color"
      />

      <ColorPickerDropdown
        colors={TEXT_COLORS}
        onSelect={handleBackgroundColorSelect}
        isOpen={openDropdown === 'backgroundColor'}
        onToggle={(isOpen) => handleDropdownToggle('backgroundColor', isOpen)}
        title="Highlight color"
      />

      <div className="w-px h-6 bg-gray-200" />

      {/* List buttons */}
      <button
        type="button"
        onClick={() => onFormat('bulletList')}
        className="w-8 h-8 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100"
        title="Bullet list"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => onFormat('numberedList')}
        className="w-8 h-8 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100"
        title="Numbered list"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-200" />

      {/* Alignment */}
      <button
        type="button"
        onClick={() => onFormat('alignLeft')}
        className="w-8 h-8 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100"
        title="Align left"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      </button>
      
      <button
        type="button"
        onClick={() => onFormat('alignCenter')}
        className="w-8 h-8 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100"
        title="Align center"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 12h8m-8 6h16" />
        </svg>
      </button>
    </motion.div>
  );
}