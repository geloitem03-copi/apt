'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState('Verifying...')

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setStatus('Error: ' + error.message)
        return
      }

      if (session) {
        setStatus('Email verified! Redirecting...')
        router.push('/login')
      } else {
        setStatus('Verification failed. Please try again.')
      }
    }

    handleEmailConfirmation()
  }, [supabase, router])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <p>{status}</p>
    </div>
  )
}
