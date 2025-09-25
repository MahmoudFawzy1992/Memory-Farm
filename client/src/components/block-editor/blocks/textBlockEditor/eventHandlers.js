import { createPlaceholderHTML, isPlaceholderContent } from '../../../../utils/textFormatting';

/**
 * Handles editor input events
 * @param {Event} e - Input event
 * @param {Function} onChange - Change handler
 */
export const handleInput = (e, onChange) => {
  const newContent = e.target.innerHTML || '';
  onChange(newContent);
};

/**
 * Handles paste events with plain text
 * @param {ClipboardEvent} e - Paste event
 */
export const handlePaste = (e) => {
  e.preventDefault();
  const text = e.clipboardData.getData('text/plain');
  document.execCommand('insertText', false, text);
};

/**
 * Handles editor focus events
 * @param {FocusEvent} e - Focus event
 * @param {Function} onFocus - Focus handler
 */
export const handleFocus = (e, onFocus) => {
  if (isPlaceholderContent(e.target.innerHTML)) {
    e.target.innerHTML = '<p><br></p>';
  }
  onFocus();
};

/**
 * Handles editor blur events
 * @param {FocusEvent} e - Blur event
 * @param {Function} onBlur - Blur handler
 * @param {string} placeholder - Placeholder text
 */
export const handleBlur = (e, onBlur, placeholder) => {
  if (!e.target.innerText.trim()) {
    e.target.innerHTML = createPlaceholderHTML(placeholder);
  }
  onBlur();
};