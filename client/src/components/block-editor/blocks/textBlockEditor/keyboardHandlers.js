import { handleFormat } from './editorCommands';

/**
 * Handles keyboard shortcut events
 * @param {KeyboardEvent} e - Keyboard event
 * @param {HTMLElement} editorRef - Editor reference
 * @param {Function} onChange - Change handler
 */
export const handleKeyboardShortcuts = (e, editorRef, onChange) => {
  if (e.metaKey || e.ctrlKey) {
    switch (e.key) {
      case 'b':
        e.preventDefault();
        handleFormat(editorRef, onChange, 'bold');
        break;
      case 'i':
        e.preventDefault();
        handleFormat(editorRef, onChange, 'italic');
        break;
      case 'u':
        e.preventDefault();
        handleFormat(editorRef, onChange, 'underline');
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
          handleFormat(editorRef, onChange, 'heading', parseInt(e.key));
        }
        break;
    }
    
    if (e.shiftKey && e.key === 'X') {
      e.preventDefault();
      handleFormat(editorRef, onChange, 'strikethrough');
    }
  }
};

/**
 * Clears placeholder content when typing starts
 * @param {HTMLElement} editorRef - Editor reference
 */
export const clearPlaceholderOnKeyDown = (editorRef) => {
  if (editorRef && editorRef.innerHTML.includes('font-style: italic')) {
    editorRef.innerHTML = '<p><br></p>';
    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(editorRef.firstChild, 0);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
};