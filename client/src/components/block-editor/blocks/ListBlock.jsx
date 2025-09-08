import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ListBlock({ 
  block, 
  onChange,
  autoFocus = false 
}) {
  const [items, setItems] = useState(block.content || []);
  const [listType, setListType] = useState(block.type || 'bulletList');
  const lastInputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && items.length === 0) {
      addNewItem();
    }
  }, [autoFocus]);

  const addNewItem = (index = -1) => {
    const newItem = {
      id: Date.now() + Math.random(),
      text: '',
      checked: listType === 'checkList' ? false : undefined
    };

    let newItems;
    if (index === -1) {
      newItems = [...items, newItem];
    } else {
      newItems = [...items];
      newItems.splice(index + 1, 0, newItem);
    }

    updateItems(newItems);
    
    // Focus the new item after state update
    setTimeout(() => {
      const newInput = document.querySelector(`input[data-id="${newItem.id}"]`);
      if (newInput) newInput.focus();
    }, 100);
  };

  const updateItem = (itemId, updates) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    updateItems(newItems);
  };

  const removeItem = (itemId) => {
    if (items.length <= 1) return; // Keep at least one item
    const newItems = items.filter(item => item.id !== itemId);
    updateItems(newItems);
  };

  const updateItems = (newItems) => {
    setItems(newItems);
    const updatedBlock = {
      ...block,
      content: newItems,
      type: listType
    };
    onChange(updatedBlock);
  };

  const handleKeyDown = (e, itemId, index) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNewItem(index);
    } else if (e.key === 'Backspace' && e.target.value === '' && items.length > 1) {
      e.preventDefault();
      removeItem(itemId);
      // Focus previous item
      if (index > 0) {
        const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  const getListIcon = (item, index) => {
    switch (listType) {
    //   case 'bulletList':
    //     return <span className="text-purple-600 font-bold">•</span>;
    //   case 'numberedList':
    //     return <span className="text-purple-600 font-medium text-sm">{index + 1}.</span>;
      case 'checkList':
        return (
          <button
          type="button"
            onClick={() => updateItem(item.id, { checked: !item.checked })}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              item.checked
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-purple-400'
            }`}
          >
            {item.checked && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        );
      default:
        return <span className="text-purple-600">•</span>;
    }
  };

  const getCompletedCount = () => {
    if (listType !== 'checkList') return null;
    const completed = items.filter(item => item.checked).length;
    return { completed, total: items.length };
  };

  return (
    <div className="w-full p-4">
      {/* List type selector */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-600 font-medium">List type:</span>
        {[
        //   { type: 'bulletList', icon: '•', label: 'Bullets' },
        //   { type: 'numberedList', icon: '1.', label: 'Numbers' },
          { type: 'checkList', icon: '✓', label: 'Todo List' }
        ].map(({ type, icon, label }) => (
          <button
          type="button"
            key={type}
            onClick={() => setListType(type)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              listType === type
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Progress indicator for checklists */}
      {listType === 'checkList' && getCompletedCount() && (
        <div className="mb-3 text-sm text-gray-600">
          {getCompletedCount().completed} of {getCompletedCount().total} completed
          {getCompletedCount().completed === getCompletedCount().total && getCompletedCount().total > 0 && (
            <span className="ml-2 text-green-600 font-medium">✨ All done!</span>
          )}
        </div>
      )}

      {/* List items */}
      <div className="space-y-2">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3"
            >
              {/* List icon/checkbox */}
              <div className="flex-shrink-0 w-6 flex justify-center">
                {getListIcon(item, index)}
              </div>

              {/* List item input */}
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateItem(item.id, { text: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, item.id, index)}
                placeholder={
                  listType === 'checkList' 
                    ? "Add a task..." 
                    : "Add list item..."
                }
                data-id={item.id}
                data-index={index}
                className={`flex-1 px-3 py-2 bg-transparent focus:outline-none focus:bg-gray-50 rounded-lg transition-all duration-200 ${
                  item.checked ? 'line-through text-gray-500' : ''
                }`}
              />

              {/* Remove item button */}
              {items.length > 1 && (
                <button
                type="button"
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 text-gray-400 hover:text-red-500 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add item button */}
      <button
      type="button"
        onClick={() => addNewItem()}
        className="mt-3 text-sm text-purple-600 hover:text-purple-800 flex items-center gap-2 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add {listType === 'checkList' ? 'task' : 'item'}
      </button>
    </div>
  );
}