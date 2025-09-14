// client/src/components/block-viewer/DividerBlockViewer.jsx
export default function DividerBlockViewer({ block, memoryColor = '#8B5CF6', onBlockUpdate }) {
  const style = block.props?.style || 'line';
  const color = block.props?.color || '#E5E7EB';

  const renderDivider = () => {
    const baseClasses = "w-full flex items-center justify-center py-6";
    
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
      
      case 'wave':
        return (
          <div className={baseClasses}>
            <div className="flex items-center gap-1 text-lg" style={{ color }}>
              <span>〜</span>
              <span>〜</span>
              <span>〜</span>
              <span>〜</span>
              <span>〜</span>
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
    <div className="divider-block-viewer my-4" aria-hidden="true">
      {renderDivider()}
    </div>
  );
}