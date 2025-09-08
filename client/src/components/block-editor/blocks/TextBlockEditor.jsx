import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { injectRichTextStyles } from './TextEditorStyles';

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
    // Inject CSS styles for rich text formatting
    injectRichTextStyles();

    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus]);

  // Set initial content
  useEffect(() => {
    if (editorRef.current && !content) {
      editorRef.current.innerHTML = `<p style="color: #9CA3AF; font-style: italic;">${placeholder}</p>`;
    } else if (editorRef.current && content && editorRef.current.innerText !== content) {
      editorRef.current.innerText = content;
    }
  }, []);

  const cleanupHTML = () => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    let cursorPos = 0;
    if (range) {
      cursorPos = range.startOffset;
    }
    
    let html = editorRef.current.innerHTML;
    
    // Remove nested headings and paragraphs
    html = html.replace(/<(h[1-6])><p>|<p><(h[1-6])>/g, '<$1$2>');
    html = html.replace(/<\/(h[1-6])><\/p>|<\/p><\/(h[1-6])>/g, '</$1$2>');
    html = html.replace(/<(h[1-6])><(h[1-6])>/g, '<$2>');
    html = html.replace(/<\/(h[1-6])><\/(h[1-6])>/g, '</$1>');
    
    editorRef.current.innerHTML = html;
    
    if (range && editorRef.current.firstChild) {
      try {
        const newRange = document.createRange();
        newRange.setStart(editorRef.current.firstChild, Math.min(cursorPos, editorRef.current.firstChild.textContent.length));
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } catch (e) {
        // Ignore cursor restoration errors
      }
    }
  };

  const handleInput = (e) => {
    const newContent = e.target.innerText || '';
    onChange(newContent);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const executeCommand = (command, value = null) => {
    editorRef.current.focus();
    document.execCommand(command, false, value);
    
    setTimeout(() => {
      const newContent = editorRef.current.innerText || '';
      onChange(newContent);
    }, 10);
  };

  const handleFormat = (formatType, value = null) => {
    switch (formatType) {
      case 'bold':
        executeCommand('bold');
        break;
      case 'italic':
        executeCommand('italic');
        break;
      case 'underline':
        executeCommand('underline');
        break;
      case 'strikethrough':
        executeCommand('strikeThrough');
        break;
      case 'heading':
        executeCommand('formatBlock', '<div>');
        setTimeout(() => {
          if (value >= 1 && value <= 6) {
            executeCommand('formatBlock', `h${value}`);
          } else {
            executeCommand('formatBlock', 'p');
          }
          cleanupHTML();
        }, 10);
        break;
      case 'bulletList':
        executeCommand('formatBlock', '<div>');
        setTimeout(() => {
          executeCommand('insertUnorderedList');
          cleanupHTML();
        }, 10);
        break;
      case 'numberedList':
        executeCommand('formatBlock', '<div>');
        setTimeout(() => {
          executeCommand('insertOrderedList');
          cleanupHTML();
        }, 10);
        break;
      case 'textColor':
        executeCommand('foreColor', value);
        break;
      case 'backgroundColor':
        executeCommand('hiliteColor', value);
        break;
    }
  };

  const handleKeyDown = (e) => {
    if (editorRef.current && editorRef.current.innerHTML.includes('font-style: italic')) {
      editorRef.current.innerHTML = '<p><br></p>';
      const range = document.createRange();
      const sel = window.getSelection();
      range.setStart(editorRef.current.firstChild, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          handleFormat('bold');
          break;
        case 'i':
          e.preventDefault();
          handleFormat('italic');
          break;
        case 'u':
          e.preventDefault();
          handleFormat('underline');
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          if (e.altKey) {
            e.preventDefault();
            handleFormat('heading', parseInt(e.key));
          }
          break;
      }
      
      if (e.shiftKey && e.key === 'X') {
        e.preventDefault();
        handleFormat('strikethrough');
      }
    }
  };

  const handleFocus = (e) => {
    if (e.target.innerHTML.includes('font-style: italic')) {
      e.target.innerHTML = '<p><br></p>';
    }
    onFocus();
  };

  const handleBlur = (e) => {
    if (!e.target.innerText.trim()) {
      e.target.innerHTML = `<p style="color: #9CA3AF; font-style: italic;">${placeholder}</p>`;
    }
    onBlur();
  };

  useImperativeHandle(ref, () => ({
    handleFormat,
    focus: () => editorRef.current?.focus()
  }));

  return (
    <div
      ref={editorRef}
      contentEditable
      onInput={handleInput}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      suppressContentEditableWarning={true}
      className={`w-full p-4 bg-transparent focus:outline-none transition-all duration-200 rounded-lg border rich-text-editor ${
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