import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { injectRichTextStyles } from './TextEditorStyles';
import { createPlaceholderHTML } from '../../../utils/textFormatting';
import { handleFormat } from './textBlockEditor/editorCommands';
import { handleKeyboardShortcuts, clearPlaceholderOnKeyDown } from './textBlockEditor/keyboardHandlers';
import { handleInput, handlePaste, handleFocus, handleBlur } from './textBlockEditor/eventHandlers';

const TextBlockEditor = forwardRef(({
  content,
  onChange,
  onSelectionChange,
  onFocus,
  onBlur,
  placeholder,
  isFocused,
  autoFocus,
  textAlignment,
  textColor
}, ref) => {
  const editorRef = useRef(null);

  useEffect(() => {
    injectRichTextStyles();
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (editorRef.current && !content) {
      editorRef.current.innerHTML = createPlaceholderHTML(placeholder);
    } else if (editorRef.current && content && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  const handleInputEvent = (e) => {
    handleInput(e, onChange);
  };

  const handlePasteEvent = (e) => {
    handlePaste(e);
  };

  const handleKeyDown = (e) => {
    // Clear placeholder
    clearPlaceholderOnKeyDown(editorRef.current);
    
    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e, editorRef.current, onChange);
  };

  const handleFocusEvent = (e) => {
    handleFocus(e, onFocus);
  };

  const handleBlurEvent = (e) => {
    handleBlur(e, onBlur, placeholder);
  };

  const formatHandler = (formatType, value = null) => {
    handleFormat(editorRef.current, onChange, formatType, value);
  };

  useImperativeHandle(ref, () => ({
    handleFormat: formatHandler,
    focus: () => editorRef.current?.focus()
  }));

  return (
    <div
      ref={editorRef}
      contentEditable
      onInput={handleInputEvent}
      onPaste={handlePasteEvent}
      onKeyDown={handleKeyDown}
      onFocus={handleFocusEvent}
      onBlur={handleBlurEvent}
      suppressContentEditableWarning={true}
      className={`w-full p-4 bg-transparent focus:outline-none transition-all duration-200 rounded-lg border rich-text-editor prose prose-sm max-w-none ${
        isFocused ? 'bg-gray-50 border-purple-200' : 'border-transparent hover:border-gray-200'
      }`}
      style={{
        minHeight: '100px',
        textAlign: textAlignment,
        color: textColor,
        fontSize: '1rem',
        fontFamily: 'inherit',
        lineHeight: '1.6'
      }}
    />
  );
});

TextBlockEditor.displayName = 'TextBlockEditor';

export default TextBlockEditor;