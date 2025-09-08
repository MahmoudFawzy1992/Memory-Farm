import { useState } from 'react';

export default function DividerBlock({ 
  block, 
  onChange 
}) {
  const [style, setStyle] = useState(block.props?.style || 'line');
  const [color, setColor] = useState(block.props?.color || '#E5E7EB');

  const updateBlock = (updates) => {
    const updatedBlock = {
      ...block,
      props: { ...block.props, ...updates }
    };
    onChange(updatedBlock);
  };

  const handleStyleChange = (newStyle) => {
    setStyle(newStyle);
    updateBlock({ style: newStyle });
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    updateBlock({ color: newColor });
  };

  const dividerStyles = [
    { id: 'line', name: 'Line', preview: '━━━━━━━━━━' },
    { id: 'dashed', name: 'Dashed', preview: '╌╌╌╌╌╌╌╌╌╌' },
    { id: 'dotted', name: 'Dotted', preview: '••••••••••' },
    { id: 'double', name: 'Double', preview: '══════════' },
    { id: 'stars', name: 'Stars', preview: '✦ ✦ ✦ ✦ ✦' }
  ];

  const colorOptions = [
    { name: 'Light Gray', value: '#E5E7EB' },
    { name: 'Gray', value: '#9CA3AF' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Pink', value: '#EC4899' }
  ];

  const renderDivider = () => {
    const baseClasses = "w-full flex items-center justify-center py-4";
    
    switch (style) {
      case 'line':
        return (
          <div className={baseClasses}>
            <div 
              className="w-full h-px" 
              style={{ backgroundColor: color }}
            />
          </div>
        );
      
      case 'dashed':
        return (
          <div className={baseClasses}>
            <div 
              className="w-full h-px border-t-2 border-dashed" 
              style={{ borderColor: color }}
            />
          </div>
        );
      
      case 'dotted':
        return (
          <div className={baseClasses}>
            <div className="flex gap-2">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        );
      
      case 'double':
        return (
          <div className={baseClasses}>
            <div className="w-full space-y-1">
              <div className="w-full h-px" style={{ backgroundColor: color }} />
              <div className="w-full h-px" style={{ backgroundColor: color }} />
            </div>
          </div>
        );
      
      case 'stars':
        return (
          <div className={baseClasses}>
            <div className="flex items-center gap-4 text-lg" style={{ color }}>
              <span>✦</span>
              <span>✦</span>
              <span>✦</span>
            </div>
          </div>
        );
      
      default:
        return (
          <div className={baseClasses}>
            <div 
              className="w-full h-px" 
              style={{ backgroundColor: color }}
            />
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="p-4 bg-gray-50 rounded-t-xl border-b border-gray-200">
        <div className="flex flex-col gap-4">
          {/* Style selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Divider Style
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {dividerStyles.map((dividerStyle) => (
                <button
                type="button"
                  key={dividerStyle.id}
                  onClick={() => handleStyleChange(dividerStyle.id)}
                  className={`p-3 rounded-lg border-2 transition-colors text-center ${
                    style === dividerStyle.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xs font-medium text-gray-700 mb-1">
                    {dividerStyle.name}
                  </div>
                  <div className="text-sm text-gray-400 font-mono">
                    {dividerStyle.preview}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((colorOption) => (
                <button
                type="button"
                  key={colorOption.value}
                  onClick={() => handleColorChange(colorOption.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === colorOption.value
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Divider Preview */}
      <div className="bg-white rounded-b-xl">
        {renderDivider()}
      </div>
    </div>
  );
}