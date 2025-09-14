// client/src/components/block-viewer/BlockRenderer.jsx
import TextBlockViewer from './TextBlockViewer';
import ImageBlockViewer from './ImageBlockViewer';
import MoodBlockViewer from './MoodBlockViewer';
import ListBlockViewer from './ListBlockViewer';
import DividerBlockViewer from './DividerBlockViewer';

// Block component registry for viewer mode
const BLOCK_COMPONENTS = {
  paragraph: TextBlockViewer,
  checkList: ListBlockViewer,
  image: ImageBlockViewer,
  mood: MoodBlockViewer,
  divider: DividerBlockViewer
};

export default function BlockRenderer({ block, index, isFirstBlock = false, memoryColor = '#8B5CF6', onBlockUpdate }) {
  const BlockComponent = BLOCK_COMPONENTS[block.type];

  if (!BlockComponent) {
    console.warn(`Unknown block type in viewer: ${block.type}`);
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600 text-sm">
          Unknown content type: <code className="bg-red-100 px-1 rounded">{block.type}</code>
        </p>
      </div>
    );
  }

  return (
    <div 
      className={`block-viewer-item ${isFirstBlock ? 'first-block' : ''}`}
      data-block-type={block.type}
      data-block-index={index}
    >
      <BlockComponent
        block={block}
        index={index}
        isFirstBlock={isFirstBlock}
        memoryColor={memoryColor}
        onBlockUpdate={block.type === 'checkList' ? onBlockUpdate : undefined}
      />
    </div>
  );
}

// Export individual viewers for direct use
export {
  TextBlockViewer,
  ImageBlockViewer,
  MoodBlockViewer,
  ListBlockViewer,
  DividerBlockViewer,
  BLOCK_COMPONENTS
};