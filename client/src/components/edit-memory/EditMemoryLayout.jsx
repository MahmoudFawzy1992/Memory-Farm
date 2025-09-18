import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import ColorSelect from '../ColorPicker';
import EditMemoryBlockEditor from './EditMemoryBlockEditor';

/**
 * Full-screen layout for editing memories
 * Similar to NewMemoryLayout but focused on editing existing content
 */
export default function EditMemoryLayout({
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
  errors = {}
}) {
  return (
    <div className="space-y-8">
      {/* Memory Title - Full width row */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">✏️</span>
          <h2 className="text-xl font-semibold text-gray-800">Edit Memory Title</h2>
        </div>
        
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Memory Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your memory a meaningful title..."
          disabled={isSubmitting}
          className={`w-full px-4 py-3 text-lg font-medium border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 ${
            errors.title ? 'border-red-500 ring-red-200' : ''
          }`}
          maxLength={100}
        />
        {errors.title && (
          <p className="text-red-600 text-sm mt-1">{errors.title}</p>
        )}
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            Update the title to better reflect your memory
          </p>
          <span className="text-xs text-gray-400">
            {title.length}/100
          </span>
        </div>
      </div>

      {/* Three column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Settings & Date */}
        <div className="lg:col-span-3 space-y-6">
          {/* Privacy Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">🔒</span>
              <h3 className="text-sm font-medium text-gray-700">Privacy Settings</h3>
            </div>
            
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative mt-1">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  disabled={isSubmitting}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  isPublic ? 'bg-purple-600' : 'bg-gray-300'
                } ${isSubmitting ? 'opacity-50' : ''}`}>
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
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">📅</span>
              <h3 className="text-sm font-medium text-gray-700">Memory Date</h3>
            </div>
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              When did this happen? *
            </label>
            <DatePicker
              selected={memoryDate}
              onChange={setMemoryDate}
              dateFormat="MMMM d, yyyy"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                errors.memoryDate ? 'border-red-500' : ''
              }`}
              maxDate={new Date()}
              placeholderText="When did this memory happen?"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
            {errors.memoryDate && (
              <p className="text-red-600 text-sm mt-1">{errors.memoryDate}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Adjust the date if needed to reflect when this actually happened
            </p>
          </div>

          {/* Edit History Info */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">📝</span>
              <h3 className="text-sm font-medium text-amber-800">Editing Mode</h3>
            </div>
            <div className="text-sm text-amber-700 space-y-2">
              <p>• You're editing an existing memory</p>
              <p>• All changes are saved when you click "Update"</p>
              <p>• Your original creation date is preserved</p>
            </div>
          </div>
        </div>

        {/* Center Column - Block Editor Area */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">📝</span>
              <h3 className="text-lg font-semibold text-gray-800">Edit Content</h3>
            </div>
            
            <EditMemoryBlockEditor
              blocks={blocks}
              onChange={onBlocksChange}
              placeholder="Edit your memory content..."
              disabled={isSubmitting}
              errors={errors}
            />
          </div>
        </div>

        {/* Right Column - Color & Info */}
        <div className="lg:col-span-3 space-y-6">
          {/* Color Picker */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">🎨</span>
              <h3 className="text-sm font-medium text-gray-700">Memory Color</h3>
            </div>
            
            <ColorSelect
              color={color}
              setColor={setColor}
              error={errors.color}
              label=""
            />
            <p className="text-xs text-gray-500 mt-2">
              Choose a color that represents this memory's mood
            </p>
          </div>

          {/* Memory Info */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">ℹ️</span>
              <h3 className="text-sm font-medium text-gray-700">Memory Details</h3>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span>Status:</span>
                <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                  isPublic 
                    ? 'text-green-700 bg-green-100' 
                    : 'text-purple-700 bg-purple-100'
                }`}>
                  {isPublic ? '🌍 Public' : '🔒 Private'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Date:</span>
                <span className="font-medium">
                  {memoryDate ? memoryDate.toLocaleDateString() : 'Not set'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Blocks:</span>
                <span className="font-medium text-purple-600">
                  {blocks.length} block{blocks.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Emotion:</span>
                <span className="font-medium text-purple-600">
                  From Mood Block
                </span>
              </div>
            </div>
          </div>

          {/* Helpful Tips */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">💡</span>
              <h3 className="text-sm font-medium text-blue-800">Quick Tips</h3>
            </div>
            
            <div className="text-sm text-blue-700 space-y-2">
              <p>• Click "Save Draft" to save without finishing</p>
              <p>• Your changes aren't visible until you update</p>
              <p>• Use Ctrl+Z to undo recent changes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}