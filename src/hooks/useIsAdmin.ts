import { useState, useEffect } from 'react'
import { isAdmin as checkAdmin } from '../services/supabase/client'

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdmin().then(setIsAdmin).finally(() => setLoading(false))
  }, [])

  return { isAdmin, loading }
}
