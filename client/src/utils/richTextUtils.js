// Enhanced rich text formatting utilities with WordPress-style capabilities

export const formatText = (text, format) => {
  const formatMap = {
    bold: { start: '**', end: '**' },
    italic: { start: '*', end: '*' },
    underline: { start: '__', end: '__' },
    code: { start: '`', end: '`' },
    strikethrough: { start: '~~', end: '~~' }
  };

  const { start, end } = formatMap[format] || { start: '', end: '' };
  return `${start}${text}${end}`;
};

export const parseMarkdown = (text) => {
  if (!text) return '';
  
  return text
    // Headings (H1-H6)
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 mt-4">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-3 mt-4">$1</h1>')
    .replace(/^#### (.*$)/gm, '<h4 class="text-base font-semibold mb-2 mt-3">$1</h4>')
    .replace(/^##### (.*$)/gm, '<h5 class="text-sm font-semibold mb-2 mt-3">$1</h5>')
    .replace(/^###### (.*$)/gm, '<h6 class="text-xs font-semibold mb-2 mt-3">$1</h6>')
    
    // Lists
    .replace(/^\* (.+)$/gm, '<li class="ml-4">• $1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>')
    
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Underline
    .replace(/__(.*?)__/g, '<u>$1</u>')
    
    // Strikethrough
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    
    // Code
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>')
    
    // Text colors
    .replace(/\{color:(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|\w+)\}(.*?)\{\/color\}/g, '<span style="color:$1">$2</span>')
    
    // Background colors
    .replace(/\{bg:(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|\w+)\}(.*?)\{\/bg\}/g, '<span style="background-color:$1; padding:2px 4px; border-radius:3px">$2</span>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="text-purple-600 hover:underline" target="_blank">$1</a>')
    
    // Line breaks
    .replace(/\n/g, '<br>');
};

export const stripMarkdown = (text) => {
  if (!text) return '';
  
  return text
    .replace(/^#{1,6} (.*)$/gm, '$1')
    .replace(/^\* (.*)$/gm, '$1')
    .replace(/^\d+\. (.*)$/gm, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\{color:[^}]+\}(.*?)\{\/color\}/g, '$1')
    .replace(/\{bg:[^}]+\}(.*?)\{\/bg\}/g, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
};

export const getActiveFormats = (text, selectionStart, selectionEnd) => {
  if (!text || selectionStart === selectionEnd) return {};
  
  const selectedText = text.substring(selectionStart, selectionEnd);
  const beforeText = text.substring(Math.max(0, selectionStart - 10), selectionStart);
  const afterText = text.substring(selectionEnd, Math.min(text.length, selectionEnd + 10));
  
  return {
    bold: /^\*\*.*\*\*$/.test(selectedText) || (beforeText.endsWith('**') && afterText.startsWith('**')),
    italic: /^\*.*\*$/.test(selectedText) && !selectedText.includes('**'),
    underline: /^__.*__$/.test(selectedText) || (beforeText.endsWith('__') && afterText.startsWith('__')),
    strikethrough: /^~~.*~~$/.test(selectedText) || (beforeText.endsWith('~~') && afterText.startsWith('~~')),
    code: /^`.*`$/.test(selectedText) || (beforeText.endsWith('`') && afterText.startsWith('`'))
  };
};

export const insertFormatting = (text, selectionStart, selectionEnd, format) => {
  const beforeText = text.substring(0, selectionStart);
  const selectedText = text.substring(selectionStart, selectionEnd);
  const afterText = text.substring(selectionEnd);
  
  const formatMap = {
    bold: { start: '**', end: '**' },
    italic: { start: '*', end: '*' },
    underline: { start: '__', end: '__' },
    strikethrough: { start: '~~', end: '~~' },
    code: { start: '`', end: '`' }
  };
  
  const { start, end } = formatMap[format] || { start: '', end: '' };
  
  // If text is already formatted, remove formatting
  if (selectedText.startsWith(start) && selectedText.endsWith(end)) {
    const unformattedText = selectedText.substring(start.length, selectedText.length - end.length);
    return {
      text: beforeText + unformattedText + afterText,
      newCursorPos: selectionStart + unformattedText.length
    };
  }
  
  // Add formatting
  const formattedText = selectedText || 'text';
  const newText = beforeText + start + formattedText + end + afterText;
  
  return {
    text: newText,
    newCursorPos: selectedText 
      ? selectionEnd + start.length + end.length
      : selectionStart + start.length + formattedText.length + end.length
  };
};

export const insertHeading = (text, selectionStart, selectionEnd, level) => {
  const beforeText = text.substring(0, selectionStart);
  const selectedText = text.substring(selectionStart, selectionEnd);
  const afterText = text.substring(selectionEnd);
  
  const headingPrefix = '#'.repeat(level) + ' ';
  const textToFormat = selectedText || 'Heading';
  
  // Check if we're at the start of a line or need to add a new line
  const needsNewlineBefore = beforeText.length > 0 && !beforeText.endsWith('\n');
  const needsNewlineAfter = afterText.length > 0 && !afterText.startsWith('\n');
  
  const formattedText = 
    (needsNewlineBefore ? '\n' : '') + 
    headingPrefix + textToFormat + 
    (needsNewlineAfter ? '\n' : '');
  
  return {
    text: beforeText + formattedText + afterText,
    newCursorPos: selectionStart + formattedText.length
  };
};

export const insertList = (text, selectionStart, selectionEnd, listType = 'bullet') => {
  const beforeText = text.substring(0, selectionStart);
  const selectedText = text.substring(selectionStart, selectionEnd);
  const afterText = text.substring(selectionEnd);
  
  const lines = selectedText ? selectedText.split('\n') : ['List item'];
  const listPrefix = listType === 'bullet' ? '* ' : '1. ';
  
  const formattedLines = lines.map((line, index) => {
    const prefix = listType === 'numbered' ? `${index + 1}. ` : '* ';
    return prefix + (line.trim() || `Item ${index + 1}`);
  });
  
  const needsNewlineBefore = beforeText.length > 0 && !beforeText.endsWith('\n');
  const needsNewlineAfter = afterText.length > 0 && !afterText.startsWith('\n');
  
  const formattedText = 
    (needsNewlineBefore ? '\n' : '') + 
    formattedLines.join('\n') + 
    (needsNewlineAfter ? '\n' : '');
  
  return {
    text: beforeText + formattedText + afterText,
    newCursorPos: selectionStart + formattedText.length
  };
};

export const insertTextColor = (text, selectionStart, selectionEnd, color) => {
  const beforeText = text.substring(0, selectionStart);
  const selectedText = text.substring(selectionStart, selectionEnd);
  const afterText = text.substring(selectionEnd);
  
  const textToColor = selectedText || 'colored text';
  const formattedText = `{color:${color}}${textToColor}{/color}`;
  
  return {
    text: beforeText + formattedText + afterText,
    newCursorPos: selectionStart + formattedText.length
  };
};

export const insertBackgroundColor = (text, selectionStart, selectionEnd, color) => {
  const beforeText = text.substring(0, selectionStart);
  const selectedText = text.substring(selectionStart, selectionEnd);
  const afterText = text.substring(selectionEnd);
  
  const textToHighlight = selectedText || 'highlighted text';
  const formattedText = `{bg:${color}}${textToHighlight}{/bg}`;
  
  return {
    text: beforeText + formattedText + afterText,
    newCursorPos: selectionStart + formattedText.length
  };
};

export const insertLink = (text, selectionStart, selectionEnd, url = '') => {
  const beforeText = text.substring(0, selectionStart);
  const selectedText = text.substring(selectionStart, selectionEnd);
  const afterText = text.substring(selectionEnd);
  
  const linkText = selectedText || 'link text';
  const linkUrl = url || 'https://';
  const linkMarkdown = `[${linkText}](${linkUrl})`;
  
  return {
    text: beforeText + linkMarkdown + afterText,
    newCursorPos: selectionStart + linkMarkdown.length
  };
};

// Predefined color palettes for text formatting
export const TEXT_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Dark Gray', value: '#374151' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' }
];

export const BACKGROUND_COLORS = [
  { name: 'None', value: 'transparent' },
  { name: 'Light Gray', value: '#F3F4F6' },
  { name: 'Light Red', value: '#FEF2F2' },
  { name: 'Light Orange', value: '#FFF7ED' },
  { name: 'Light Yellow', value: '#FEFCE8' },
  { name: 'Light Green', value: '#F0FDF4' },
  { name: 'Light Blue', value: '#EFF6FF' },
  { name: 'Light Purple', value: '#F5F3FF' },
  { name: 'Light Pink', value: '#FDF2F8' }
];