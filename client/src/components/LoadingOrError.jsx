function LoadingOrError({ loading, memory }) {
  if (loading) {
    return <div className="text-center text-gray-500">Loading memory...</div>
  }

  if (!memory) {
    return <div className="text-center text-red-500">Memory not found.</div>
  }

  return null
}

export default LoadingOrError
