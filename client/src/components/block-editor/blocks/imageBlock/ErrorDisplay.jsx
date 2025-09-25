export default function ErrorDisplay({ errors, onDismiss }) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <h4 className="text-red-800 font-medium mb-2">Upload Errors:</h4>
      <ul className="text-sm text-red-600 space-y-1">
        {errors.map((error, index) => (
          <li key={index}>• {error}</li>
        ))}
      </ul>
      <button
        onClick={onDismiss}
        className="mt-2 text-xs text-red-500 hover:text-red-700"
      >
        Dismiss
      </button>
    </div>
  );
}