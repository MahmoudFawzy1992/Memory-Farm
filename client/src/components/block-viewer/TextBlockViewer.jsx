import { useEffect } from 'react';
import { sanitizeRichTextHTML } from '../../utils/sanitization';
import { injectRichTextStyles } from '../block-editor/blocks/TextEditorStyles';

export default function TextBlockViewer({ block, memoryColor = '#8B5CF6' }) {
  useEffect(() => {
    injectRichTextStyles();
  }, []);

  if (!block.content || !Array.isArray(block.content)) {
    return null;
  }

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

  const textAlignment = block.props?.textAlignment || 'left';
  const backgroundColor = block.props?.backgroundColor || 'transparent';
  const safeHtmlContent = sanitizeRichTextHTML(htmlContent);

  if (!safeHtmlContent.trim()) {
    return null;
  }

  return (
    <div className="text-block-viewer mb-6" style={{ backgroundColor }}>
      <div
        className="prose prose-sm max-w-none rich-text-content"
        style={{ textAlign: textAlignment }}
        dangerouslySetInnerHTML={{ __html: safeHtmlContent }}
      />
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .text-block-viewer .rich-text-content {
            line-height: 1.6;
            word-wrap: break-word;
          }
          
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
          
          .text-block-viewer p {
            margin: 0.5rem 0 !important;
            line-height: 1.6 !important;
            color: inherit;
          }
          
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
          
          .text-block-viewer span[style*="color"] {
            /* Preserve inline color styles */
          }
          .text-block-viewer span[style*="text-decoration"] {
            /* Preserve inline text-decoration styles */
          }
          .text-block-viewer span[style*="background-color"] {
            /* Preserve inline background-color styles */
          }
          
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
        `
      }} />
    </div>
  );
}