import { useState, useEffect } from 'react'

const useAsyncEffect = (promise: () => Promise<void>, deps = []) => {
  const [error, setError] = useState(null)
  const [response, setResponse] = useState(null)
  useEffect(() => {
    promise()
      .then(setResponse)
      .catch(setError)
  }, deps)

  return { error, response }
}

export default useAsyncEffect