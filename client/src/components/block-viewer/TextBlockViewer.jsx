import { useEffect } from 'react';
import { sanitizeRichTextHTML } from '../../utils/sanitization';
import { injectRichTextStyles } from '../block-editor/blocks/TextEditorStyles';

export default function TextBlockViewer({ block, memoryColor = '#8B5CF6' }) {
  // Ensure styles are injected for the viewer
  useEffect(() => {
    injectRichTextStyles();
  }, []);

  if (!block.content || !Array.isArray(block.content)) {
    return null;
  }

  // Extract HTML content from block structure
  const htmlContent = block.content
    .map(item => {
      if (typeof item === 'string') {
        return item;
      }
      if (item && typeof item === 'object' && item.text) {
        return item.text;
      }
      return '';
    })
    .join('');

  if (!htmlContent.trim()) {
    return null;
  }

  // Get text styling from block props
  const textAlignment = block.props?.textAlignment || 'left';
  const backgroundColor = block.props?.backgroundColor || 'transparent';

  // Sanitize the HTML content to ensure security while preserving formatting
  const safeHtmlContent = sanitizeRichTextHTML(htmlContent);

  // If sanitization removed everything, show nothing
  if (!safeHtmlContent.trim()) {
    return null;
  }

  return (
    <div className="text-block-viewer mb-6" style={{ backgroundColor }}>
      <div
        className="prose prose-sm max-w-none rich-text-content"
        style={{
          textAlign: textAlignment
          // REMOVED: color: textColor - this was overriding inline text colors
        }}
        dangerouslySetInnerHTML={{ __html: safeHtmlContent }}
      />
      
      {/* Enhanced styles to ensure all formatting works */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Base typography styles */
          .text-block-viewer .rich-text-content {
            line-height: 1.6;
            word-wrap: break-word;
          }
          
          /* Heading styles with proper hierarchy */
          .text-block-viewer h1 {
            font-size: 2rem !important;
            font-weight: bold !important;
            margin: 1rem 0 0.5rem 0 !important;
            line-height: 1.2 !important;
            color: inherit;
          }
          .text-block-viewer h2 {
            font-size: 1.75rem !important;
            font-weight: bold !important;
            margin: 0.875rem 0 0.5rem 0 !important;
            line-height: 1.3 !important;
            color: inherit;
          }
          .text-block-viewer h3 {
            font-size: 1.5rem !important;
            font-weight: 600 !important;
            margin: 0.75rem 0 0.5rem 0 !important;
            line-height: 1.3 !important;
            color: inherit;
          }
          .text-block-viewer h4 {
            font-size: 1.25rem !important;
            font-weight: 600 !important;
            margin: 0.625rem 0 0.375rem 0 !important;
            line-height: 1.4 !important;
            color: inherit;
          }
          .text-block-viewer h5 {
            font-size: 1.125rem !important;
            font-weight: 600 !important;
            margin: 0.5rem 0 0.375rem 0 !important;
            line-height: 1.4 !important;
            color: inherit;
          }
          .text-block-viewer h6 {
            font-size: 1rem !important;
            font-weight: 600 !important;
            margin: 0.5rem 0 0.25rem 0 !important;
            line-height: 1.5 !important;
            color: inherit;
          }
          
          /* Paragraph styles */
          .text-block-viewer p {
            margin: 0.5rem 0 !important;
            line-height: 1.6 !important;
            color: inherit;
          }
          
          /* Text formatting styles */
          .text-block-viewer strong,
          .text-block-viewer b {
            font-weight: bold !important;
          }
          .text-block-viewer em,
          .text-block-viewer i {
            font-style: italic !important;
          }
          .text-block-viewer u {
            text-decoration: underline !important;
          }
          .text-block-viewer del,
          .text-block-viewer strike {
            text-decoration: line-through !important;
          }
          
          /* Legacy font tag support for contentEditable */
          .text-block-viewer font[color] {
            /* Color will be applied via the color attribute */
          }
          
          /* List styles */
          .text-block-viewer ul {
            list-style-type: disc !important;
            margin: 0.5rem 0 !important;
            padding-left: 1.5rem !important;
          }
          .text-block-viewer ol {
            list-style-type: decimal !important;
            margin: 0.5rem 0 !important;
            padding-left: 1.5rem !important;
          }
          .text-block-viewer li {
            margin: 0.25rem 0 !important;
            line-height: 1.5 !important;
            color: inherit;
          }
          
          /* Code styling */
          .text-block-viewer code {
            background-color: #f3f4f6 !important;
            padding: 0.125rem 0.25rem !important;
            border-radius: 0.25rem !important;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
            font-size: 0.875em !important;
          }
          
          /* Link styles */
          .text-block-viewer a {
            color: #8b5cf6 !important;
            text-decoration: underline !important;
          }
          .text-block-viewer a:hover {
            color: #7c3aed !important;
          }
          
          /* Preserve inline styles for colors and backgrounds */
          .text-block-viewer [style*="color"] {
            /* Don't override inline color styles */
          }
          .text-block-viewer [style*="background-color"] {
            /* Don't override inline background-color styles */
          }
          
          /* Blockquote styles */
          .text-block-viewer blockquote {
            border-left: 4px solid #e5e7eb !important;
            padding-left: 1rem !important;
            margin: 1rem 0 !important;
            font-style: italic !important;
            color: #6b7280 !important;
          }
          
          /* Remove unwanted div spacing */
          .text-block-viewer div {
            margin: 0 !important;
          }
          
          /* Fix nested list styling */
          .text-block-viewer div > ul,
          .text-block-viewer div > ol {
            margin: 0.5rem 0 !important;
          }
          
          /* Ensure line breaks are respected */
          .text-block-viewer br {
            line-height: 1.6 !important;
          }
        `
      }} />
    </div>
  );
}