// Utility for injecting rich text editor styles
export const injectRichTextStyles = () => {
  const styleId = 'rich-text-editor-styles';
  
  if (document.getElementById(styleId)) {
    return; // Styles already injected
  }

  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = `
    .rich-text-editor h1 {
      font-size: 2rem;
      font-weight: bold;
      margin: 0.5rem 0;
      line-height: 1.2;
      color: #1f2937;
    }
    .rich-text-editor h2 {
      font-size: 1.75rem;
      font-weight: bold;
      margin: 0.5rem 0;
      line-height: 1.3;
      color: #1f2937;
    }
    .rich-text-editor h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0.5rem 0;
      line-height: 1.3;
      color: #1f2937;
    }
    .rich-text-editor h4 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0.5rem 0;
      line-height: 1.4;
      color: #1f2937;
    }
    .rich-text-editor h5 {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0.5rem 0;
      line-height: 1.4;
      color: #1f2937;
    }
    .rich-text-editor h6 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0.5rem 0;
      line-height: 1.5;
      color: #1f2937;
    }
    .rich-text-editor ul {
      list-style-type: disc;
      list-style-position: inside;
      margin: 0.5rem 0;
      padding-left: 1rem;
    }
    .rich-text-editor ol {
      list-style-type: decimal;
      list-style-position: inside;
      margin: 0.5rem 0;
      padding-left: 1rem;
    }
    .rich-text-editor li {
      margin: 0.25rem 0;
      line-height: 1.5;
    }
    .rich-text-editor p {
      margin: 0.5rem 0;
      line-height: 1.6;
    }
    .rich-text-editor strong {
      font-weight: bold;
    }
    .rich-text-editor em {
      font-style: italic;
    }
    .rich-text-editor u {
      text-decoration: underline;
    }
  `;
  
  document.head.appendChild(styleElement);
};