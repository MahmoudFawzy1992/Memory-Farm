# Fix Rich Text Display in TextBlockViewer

## Tasks

- [x] Modify server/middleware/sanitization.js to allow safe HTML tags for memory content
- [x] Change TextBlockEditor to save innerHTML instead of innerText
- [x] Update TextBlockViewer to display HTML directly without markdown parsing
- [x] Add client-side HTML sanitization before sending to server
- [x] Test rich text formatting in ViewMemory page
- [x] Verify no XSS vulnerabilities introduced
- [x] Fix heading and list styling issues

## Files to Edit

- server/middleware/sanitization.js
- client/src/components/block-editor/blocks/TextBlockEditor.jsx
- client/src/components/block-viewer/TextBlockViewer.jsx
- client/src/components/block-editor/blocks/TextBlock.jsx
