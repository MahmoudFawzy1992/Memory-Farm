import { useState, useRef, useEffect } from 'react';

export default function HeadingBlock({ 
  block, 
  onChange, 
  placeholder = "Heading text...",
  autoFocus = false 
}) {
  const [content, setContent] = useState(
    block.content?.[0]?.text || ''
  );
  const [level, setLevel] = useState(block.props?.level || '1');
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    const updatedBlock = {
      ...block,
      content: [{ type: 'text', text: newContent }]
    };
    
    onChange(updatedBlock);
  };

  const handleLevelChange = (newLevel) => {
    setLevel(newLevel);
    
    const updatedBlock = {
      ...block,
      props: { ...block.props, level: newLevel }
    };
    
    onChange(updatedBlock);
  };

  const getHeadingSize = () => {
    switch (level) {
      case '1': return 'text-2xl';
      case '2': return 'text-xl';
      case '3': return 'text-lg';
      default: return 'text-xl';
    }
  };

  const getTextColor = () => {
    return block.props?.textColor || '#000000';
  };

  const getTextAlignment = () => {
    return block.props?.textAlignment || 'left';
  };

  return (
    <div className="w-full">
      {/* Heading level selector */}
      <div className="flex items-center gap-2 mb-2 px-4">
        <span className="text-xs text-gray-500 font-medium">Level:</span>
        {['1', '2', '3'].map((levelOption) => (
          <button
          type="button"
            key={levelOption}
            onClick={() => handleLevelChange(levelOption)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
              level === levelOption
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            H{levelOption}
          </button>
        ))}
      </div>

      {/* Heading input */}
      <input
        ref={inputRef}
        type="text"
        value={content}
        onChange={handleContentChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-transparent focus:outline-none focus:bg-gray-50 rounded-lg transition-all duration-200 font-semibold ${getHeadingSize()}`}
        style={{
          color: getTextColor(),
          textAlign: getTextAlignment()
        }}
      />
    </div>
  );
}