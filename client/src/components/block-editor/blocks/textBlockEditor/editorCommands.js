import { 
  applyStyleToCurrentElement, 
  handleUnderlineDecoration, 
  handleStrikethroughDecoration 
} from './styleHandlers';

/**
 * Executes a basic document command
 * @param {HTMLElement} editorRef - Editor reference
 * @param {Function} onChange - Change handler
 * @param {string} command - Command to execute
 * @param {*} value - Command value
 */
export const executeCommand = (editorRef, onChange, command, value = null) => {
  editorRef.focus();
  document.execCommand(command, false, value);

  setTimeout(() => {
    const newContent = editorRef.innerHTML || '';
    onChange(newContent);
  }, 10);
};

/**
 * Handles text formatting operations
 * @param {HTMLElement} editorRef - Editor reference
 * @param {Function} onChange - Change handler
 * @param {string} formatType - Type of formatting
 * @param {*} value - Format value
 */
export const handleFormat = (editorRef, onChange, formatType, value = null) => {
  editorRef.focus();
  
  switch (formatType) {
    case 'bold':
      executeCommand(editorRef, onChange, 'bold');
      break;
    case 'italic':
      executeCommand(editorRef, onChange, 'italic');
      break;
    case 'underline':
      handleUnderlineDecoration(editorRef);
      break;
    case 'strikethrough':
      handleStrikethroughDecoration(editorRef);
      break;
    case 'heading':
      executeCommand(editorRef, onChange, 'formatBlock', '<div>');
      setTimeout(() => {
        if (value >= 1 && value <= 6) {
          executeCommand(editorRef, onChange, 'formatBlock', `h${value}`);
        } else {
          executeCommand(editorRef, onChange, 'formatBlock', 'p');
        }
      }, 10);
      break;
    case 'bulletList':
      executeCommand(editorRef, onChange, 'insertUnorderedList');
      break;
    case 'numberedList':
      executeCommand(editorRef, onChange, 'insertOrderedList');
      break;
    case 'textColor':
      applyStyleToCurrentElement(editorRef, 'color', value);
      break;
    case 'backgroundColor':
      if (value === 'transparent' || !value) {
        applyStyleToCurrentElement(editorRef, 'background-color', null);
      } else {
        applyStyleToCurrentElement(editorRef, 'background-color', value);
      }
      break;
  }

  setTimeout(() => {
    const newContent = editorRef.innerHTML || '';
    onChange(newContent);
  }, 10);
};