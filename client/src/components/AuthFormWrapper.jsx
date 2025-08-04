// src/components/AuthFormWrapper.jsx
function AuthFormWrapper({ title, onSubmit, children, message = "" }) {
  return (
    <div className="max-w-sm mx-auto mt-20 px-4">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>

      {message && (
        <p className="mb-2 text-sm text-red-600 bg-red-100 px-2 py-1 rounded">
          {message}
        </p>
      )}

      <form className="space-y-4" onSubmit={onSubmit}>
        {children}
      </form>
    </div>
  );
}

export default AuthFormWrapper;
