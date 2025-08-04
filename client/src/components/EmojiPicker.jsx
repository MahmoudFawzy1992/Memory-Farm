import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { useState } from 'react'

function EmojiPicker({ emoji, setEmoji }) {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="flex flex-col w-1/2">
      <label className="text-sm text-gray-700 mb-1">Choose an Emoji</label>
      <div
        className="cursor-pointer text-2xl border p-2 rounded w-fit hover:bg-purple-50"
        onClick={() => setShowPicker(!showPicker)}
      >
        {emoji}
      </div>
      {showPicker && (
        <div className="z-10 mt-2">
          <Picker
            data={data}
            onEmojiSelect={(e) => {
              setEmoji(e.native)
              setShowPicker(false)
            }}
            theme="light"
          />
        </div>
      )}
    </div>
  )
}

export default EmojiPicker
