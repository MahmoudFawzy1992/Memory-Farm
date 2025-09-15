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
    injectRichTextStyles();
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (editorRef.current && !content) {
      editorRef.current.innerHTML = `<p style="color: #9CA3AF; font-style: italic;">${placeholder}</p>`;
    } else if (editorRef.current && content && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  // Get current element and apply styles directly to it
  const applyStyleToCurrentElement = (styleProp, styleValue) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer;
    
    // Find the closest block element (p, h1-h6, etc.)
    while (element && element.nodeType !== Node.ELEMENT_NODE) {
      element = element.parentNode;
    }
    
    while (element && !['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV'].includes(element.tagName)) {
      element = element.parentNode;
    }
    
    if (element && element !== editorRef.current) {
      const currentStyle = element.getAttribute('style') || '';
      const styleObj = {};
      
      // Parse existing styles
      if (currentStyle) {
        currentStyle.split(';').forEach(rule => {
          if (rule.trim()) {
            const [prop, value] = rule.split(':').map(s => s.trim());
            if (prop && value) styleObj[prop] = value;
          }
        });
      }
      
      // Apply new style
      if (styleValue === null || styleValue === 'transparent' || styleValue === '') {
        delete styleObj[styleProp]; // Remove style
      } else {
        styleObj[styleProp] = styleValue;
      }
      
      // Rebuild style string
      const newStyle = Object.entries(styleObj)
        .map(([prop, value]) => `${prop}: ${value}`)
        .join('; ');
      
      if (newStyle) {
        element.setAttribute('style', newStyle);
      } else {
        element.removeAttribute('style');
      }
    }
  };

  const handleInput = (e) => {
    const newContent = e.target.innerHTML || '';
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
      const newContent = editorRef.current.innerHTML || '';
      onChange(newContent);
    }, 10);
  };

  const handleFormat = (formatType, value = null) => {
    editorRef.current.focus();
    
    switch (formatType) {
      case 'bold':
        executeCommand('bold');
        break;
      case 'italic':
        executeCommand('italic');
        break;
      case 'underline':
        // Apply underline to current element's style
        applyStyleToCurrentElement('text-decoration', 
          getCurrentTextDecoration().includes('underline') ? 
          getCurrentTextDecoration().replace('underline', '').trim() || 'none' : 
          (getCurrentTextDecoration() === 'none' ? 'underline' : getCurrentTextDecoration() + ' underline')
        );
        break;
      case 'strikethrough':
        // Apply strikethrough to current element's style
        applyStyleToCurrentElement('text-decoration', 
          getCurrentTextDecoration().includes('line-through') ? 
          getCurrentTextDecoration().replace('line-through', '').trim() || 'none' : 
          (getCurrentTextDecoration() === 'none' ? 'line-through' : getCurrentTextDecoration() + ' line-through')
        );
        break;
      case 'heading':
        executeCommand('formatBlock', '<div>');
        setTimeout(() => {
          if (value >= 1 && value <= 6) {
            executeCommand('formatBlock', `h${value}`);
          } else {
            executeCommand('formatBlock', 'p');
          }
        }, 10);
        break;
      case 'bulletList':
        executeCommand('insertUnorderedList');
        break;
      case 'numberedList':
        executeCommand('insertOrderedList');
        break;
      case 'textColor':
        applyStyleToCurrentElement('color', value);
        break;
      case 'backgroundColor':
        if (value === 'transparent' || !value) {
          applyStyleToCurrentElement('background-color', null);
        } else {
          applyStyleToCurrentElement('background-color', value);
        }
        break;
    }

    setTimeout(() => {
      const newContent = editorRef.current.innerHTML || '';
      onChange(newContent);
    }, 10);
  };

  // Helper function to get current text decoration
  const getCurrentTextDecoration = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return 'none';

    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer;
    
    while (element && element.nodeType !== Node.ELEMENT_NODE) {
      element = element.parentNode;
    }
    
    while (element && !['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV'].includes(element.tagName)) {
      element = element.parentNode;
    }
    
    if (element && element !== editorRef.current) {
      const style = element.getAttribute('style') || '';
      const match = style.match(/text-decoration:\s*([^;]+)/);
      return match ? match[1].trim() : 'none';
    }
    
    return 'none';
  };

  const handleKeyDown = (e) => {
    // Clear placeholder
    if (editorRef.current && editorRef.current.innerHTML.includes('font-style: italic')) {
      editorRef.current.innerHTML = '<p><br></p>';
      const range = document.createRange();
      const sel = window.getSelection();
      range.setStart(editorRef.current.firstChild, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // Handle keyboard shortcuts
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
        case 'z':
          if (e.shiftKey) {
            // Ctrl+Shift+Z or Cmd+Shift+Z = Redo
            e.preventDefault();
            document.execCommand('redo');
          } else {
            // Ctrl+Z or Cmd+Z = Undo
            e.preventDefault();
            document.execCommand('undo');
          }
          break;
        case 'y':
          // Ctrl+Y = Redo (Windows style)
          e.preventDefault();
          document.execCommand('redo');
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