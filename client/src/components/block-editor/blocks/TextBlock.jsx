import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import RichTextToolbar from './RichTextToolbar';
import TextBlockEditor from './TextBlockEditor';
import { stripMarkdown } from '../../../utils/richTextUtils';

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

  const handleContentChange = (newContent) => {
    setContent(newContent);
    
    const updatedBlock = {
      ...block,
      content: [{ type: 'text', text: newContent }]
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

  const plainTextLength = stripMarkdown(content).length;

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

      {/* Character count */}
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