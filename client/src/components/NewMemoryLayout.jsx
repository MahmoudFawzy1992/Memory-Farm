import BlockEditor from '../components/block-editor/BlockEditor';
import DatePicker from 'react-datepicker';
import ColorSelect from '../components/ColorPicker';

export default function NewMemoryLayout({
  title,
  setTitle,
  color,
  setColor,
  isPublic,
  setIsPublic,
  memoryDate,
  setMemoryDate,
  blocks,
  onBlocksChange,
  isSubmitting,
  errors
}) {
  return (
    <div className="space-y-6">
      {/* Three column layout */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Privacy & Date */}
          <div className="lg:col-span-3 space-y-6">
            {/* Privacy Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Privacy Settings</h3>
              
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative mt-1">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only"
                    disabled={isSubmitting}
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                    isPublic ? 'bg-purple-600' : 'bg-gray-300'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 mt-1 ${
                      isPublic ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {isPublic ? 'Public Memory' : 'Private Memory'}
                    </span>
                    <span className="text-lg">
                      {isPublic ? '🌍' : '🔒'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {isPublic 
                      ? 'Visible to everyone in the community discover feed'
                      : 'Only visible to you in your personal dashboard'
                    }
                  </p>
                </div>
              </label>
            </div>

            {/* Memory Date */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Memory Date *
              </label>
              <div className="memory-date">
                <DatePicker
                  selected={memoryDate}
                  onChange={setMemoryDate}
                  dateFormat="MMMM d, yyyy"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.memoryDate ? 'border-red-500' : ''
                  }`}
                  maxDate={new Date()}
                  placeholderText="When did this memory happen?"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  disabled={isSubmitting}
                />
              </div>
              {errors.memoryDate && (
                <p className="text-red-600 text-sm mt-1">{errors.memoryDate}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                When did this memory or moment happen?
              </p>
            </div>
          </div>

          {/* Center Column - Block Editor */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span>📝</span>
                      Memory Content
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Express yourself with rich content blocks
                    </p>
                  </div>
                  
                  {blocks.length > 1 && (
                    <div className="text-sm text-gray-500">
                      {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <BlockEditor
                  blocks={blocks}
                  onChange={onBlocksChange}
                  placeholder="Your mood tracker is ready - add more content blocks to tell your story..."
                  maxBlocks={8}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Color & Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Color Picker */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="color-picker">
                <ColorSelect
                  color={color}
                  setColor={setColor}
                  error={errors.color}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Choose a color that represents this memory
              </p>
            </div>

            {/* Memory Info */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Memory Info</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${isPublic ? 'text-green-600' : 'text-purple-600'}`}>
                    {isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">
                    {memoryDate ? memoryDate.toLocaleDateString() : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Emotion:</span>
                  <span className="font-medium text-purple-600">
                    From Mood Block
                  </span>
                </div>
              </div>
            </div>

            {/* Tutorial Helper */}
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
              <h4 className="text-sm font-medium text-purple-900 mb-2">
                💡 Pro Tips
              </h4>
              <ul className="text-xs text-purple-700 space-y-1">
                <li>• Use the mood block to track your emotions</li>
                <li>• Add images to make memories more vivid</li>
                <li>• Create todo lists for future goals</li>
                <li>• Rich content helps generate better insights</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}