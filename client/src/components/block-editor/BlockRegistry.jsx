import TextBlock from './blocks/TextBlock';
import HeadingBlock from './blocks/HeadingBlock';
import ListBlock from './blocks/ListBlock';
import ImageBlock from './blocks/ImageBlock';
import MoodBlock from './blocks/MoodBlock';
import DividerBlock from './blocks/DividerBlock';

// Registry mapping block types to their components
const BLOCK_COMPONENTS = {
  paragraph: TextBlock,
  checkList: ListBlock,
  image: ImageBlock,
  mood: MoodBlock,
  divider: DividerBlock
};

// Component that renders the appropriate block based on type
export default function BlockRenderer({ 
  block, 
  onChange, 
  autoFocus = false,
  ...props 
}) {
  const BlockComponent = BLOCK_COMPONENTS[block.type];

  if (!BlockComponent) {
    console.warn(`Unknown block type: ${block.type}`);
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600 text-sm">
          Unknown block type: <code>{block.type}</code>
        </p>
      </div>
    );
  }

  return (
    <BlockComponent
      block={block}
      onChange={onChange}
      autoFocus={autoFocus}
      {...props}
    />
  );
}

// Export block components for direct use
export {
  TextBlock,
  HeadingBlock,
  ListBlock,
  ImageBlock,
  MoodBlock,
  DividerBlock,
  BLOCK_COMPONENTS
};