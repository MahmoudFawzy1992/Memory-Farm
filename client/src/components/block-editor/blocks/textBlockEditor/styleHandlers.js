import { parseStyleString, styleObjectToString, getClosestBlockElement } from '../../../../utils/textFormatting';

/**
 * Applies style to the current selected element
 * @param {HTMLElement} editorRef - Editor reference
 * @param {string} styleProp - CSS property name
 * @param {string|null} styleValue - CSS property value (null to remove)
 */
export const applyStyleToCurrentElement = (editorRef, styleProp, styleValue) => {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const element = getClosestBlockElement(range, editorRef);
  
  if (element) {
    const currentStyle = element.getAttribute('style') || '';
    const styleObj = parseStyleString(currentStyle);
    
    // Apply new style
    if (styleValue === null || styleValue === 'transparent' || styleValue === '') {
      delete styleObj[styleProp]; // Remove style
    } else {
      styleObj[styleProp] = styleValue;
    }
    
    // Rebuild style string
    const newStyle = styleObjectToString(styleObj);
    
    if (newStyle) {
      element.setAttribute('style', newStyle);
    } else {
      element.removeAttribute('style');
    }
  }
};

/**
 * Gets current text decoration value from selected element
 * @param {HTMLElement} editorRef - Editor reference
 * @returns {string} - Current text decoration value
 */
export const getCurrentTextDecoration = (editorRef) => {
  const selection = window.getSelection();
  if (!selection.rangeCount) return 'none';

  const range = selection.getRangeAt(0);
  const element = getClosestBlockElement(range, editorRef);
  
  if (element) {
    const style = element.getAttribute('style') || '';
    const match = style.match(/text-decoration:\s*([^;]+)/);
    return match ? match[1].trim() : 'none';
  }
  
  return 'none';
};

/**
 * Handles underline text decoration toggle
 * @param {HTMLElement} editorRef - Editor reference
 */
export const handleUnderlineDecoration = (editorRef) => {
  const currentDecoration = getCurrentTextDecoration(editorRef);
  const newDecoration = currentDecoration.includes('underline') ? 
    currentDecoration.replace('underline', '').trim() || 'none' : 
    (currentDecoration === 'none' ? 'underline' : currentDecoration + ' underline');
  
  applyStyleToCurrentElement(editorRef, 'text-decoration', newDecoration);
};

/**
 * Handles strikethrough text decoration toggle
 * @param {HTMLElement} editorRef - Editor reference
 */
export const handleStrikethroughDecoration = (editorRef) => {
  const currentDecoration = getCurrentTextDecoration(editorRef);
  const newDecoration = currentDecoration.includes('line-through') ? 
    currentDecoration.replace('line-through', '').trim() || 'none' : 
    (currentDecoration === 'none' ? 'line-through' : currentDecoration + ' line-through');
  
  applyStyleToCurrentElement(editorRef, 'text-decoration', newDecoration);
};