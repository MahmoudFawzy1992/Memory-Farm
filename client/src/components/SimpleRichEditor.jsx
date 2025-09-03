import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SimpleRichEditor({
  value = '',
  onChange,
  placeholder = "Start writing your memory...",
  className = "",
  error
}) {
  const [content, setContent] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setContent(value);
  }, [value]);

  // Auto-resize textarea
  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(200, textareaRef.current.scrollHeight) + 'px';
    }
  };

  useEffect(() => {
    autoResize();
  }, [content]);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange?.(newContent);
    autoResize();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Convert simple markdown-like syntax to styled content
  const formatContent = (text) => {
    // This is a simple preview - in production you might want a full markdown parser
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-2">$1</h2>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .split('\n')
      .map(line => line.trim() ? `<p class="mb-2">${line}</p>` : '<br>')
      .join('');
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`relative border-2 rounded-xl transition-all duration-200 ${
        error ? 'border-red-500' : 
        isFocused ? 'border-purple-500 shadow-lg' : 'border-gray-300'
      }`}>
        {/* Editor */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full p-6 bg-transparent resize-none focus:outline-none text-gray-900 leading-relaxed ${
            content ? 'min-h-[200px]' : 'h-[200px]'
          }`}
          style={{ minHeight: '200px' }}
        />

        {/* Floating toolbar when focused */}
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-6 bg-gray-800 text-white rounded-lg px-3 py-2 text-xs"
          >
            <p className="mb-1">Formatting tips:</p>
            <p>**bold** *italic* # heading - bullet</p>
          </motion.div>
        )}

        {/* Character count */}
        {content && (
          <div className="absolute bottom-2 right-4 text-xs text-gray-400">
            {content.length} characters
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}

      {/* Preview (optional - could be toggled) */}
      {content && (
        <details className="mt-4">
          <summary className="text-sm text-gray-600 cursor-pointer hover:text-purple-600">
            Preview formatted content
          </summary>
          <div 
            className="mt-2 p-4 bg-gray-50 rounded-lg prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formatContent(content) }}
          />
        </details>
      )}
    </div>
  );
}