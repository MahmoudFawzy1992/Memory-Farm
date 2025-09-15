import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import RichTextToolbar from './RichTextToolbar';
import TextBlockEditor from './TextBlockEditor';
import { stripMarkdown } from '../../../utils/richTextUtils';
import { sanitizeRichTextHTML } from '../../../utils/sanitization';

export default function TextBlock({ 
  block, 
  onChange, 
  placeholder = "Start typing... Use formatting options above",
  autoFocus = false 
}) {
  const [content, setContent] = useState(
    block.content?.[0]?.text || ''
  );
  const [isFocused, setIsFocused] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  
  const editorRef = useRef(null);

  // Extract pure text from HTML content for character counting
  const extractPlainText = (htmlContent) => {
    if (!htmlContent) return '';
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Get only the text content, which strips all HTML tags
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const handleContentChange = (newContent) => {
    // Sanitize HTML content before saving
    const sanitizedContent = sanitizeRichTextHTML(newContent);
    setContent(sanitizedContent);

    // Extract textColor from editor content if present
    let extractedTextColor = null;
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = sanitizedContent;
      const elementWithColor = tempDiv.querySelector('[style*="color"]');
      if (elementWithColor) {
        const style = elementWithColor.getAttribute('style');
        const match = style.match(/color:\s*([^;]+)/);
        if (match) {
          extractedTextColor = match[1].trim();
        }
      }
    } catch (e) {
      // ignore errors
    }

    const updatedBlock = {
      ...block,
      content: [{ type: 'text', text: sanitizedContent }],
      props: {
        ...block.props,
        textColor: extractedTextColor || block.props?.textColor || '#000000'
      }
    };

    onChange(updatedBlock);
  };

  const handleSelectionChange = (newSelection) => {
    setSelection(newSelection);
  };

  const handleFormat = (formatType, value = null) => {
    // Handle alignment changes
    if (['alignLeft', 'alignCenter'].includes(formatType)) {
      const alignment = formatType === 'alignCenter' ? 'center' : 'left';
      const updatedBlock = {
        ...block,
        props: { ...block.props, textAlignment: alignment }
      };
      onChange(updatedBlock);
      return;
    }

    // Delegate other formatting to the editor component
    if (editorRef.current?.handleFormat) {
      editorRef.current.handleFormat(formatType, value);
    }
  };

  const getTextAlignment = () => {
    return block.props?.textAlignment || 'left';
  };

  const getTextColor = () => {
    return block.props?.textColor || '#000000';
  };

  // Get pure text length for character counting (no HTML tags)
  const plainText = extractPlainText(content);
  const plainTextLength = plainText.length;

  return (
    <div className="w-full">
      {/* Always visible toolbar at the top */}
      <div className="border-b border-gray-200 mb-3 pb-3">
        <RichTextToolbar 
          onFormat={handleFormat}
          show={true}
        />
      </div>

      {/* WYSIWYG Editor */}
      <TextBlockEditor
        ref={editorRef}
        content={content}
        onChange={handleContentChange}
        onSelectionChange={handleSelectionChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        isFocused={isFocused}
        autoFocus={autoFocus}
        textAlignment={getTextAlignment()}
        textColor={getTextColor()}
      />

      {/* Character count - shows only plain text characters */}
      {plainTextLength > 50 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          className="text-xs text-gray-400 mt-2 px-4"
        >
          {plainTextLength} characters
        </motion.div>
      )}
    </div>
  );
}