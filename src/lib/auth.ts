'use client'

import { createClient } from '@/lib/supabase'
import { UserRole } from '@/types/database'

export async function signUp(email: string, password: string, name: string, role: UserRole) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        name,
        role,
      },
    },
  })

  if (error) {
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      throw new Error('Too many signup attempts. Please: (1) Wait 1 hour, or (2) Go to /login if you already registered')
    }
    if (error.message.includes('User already registered')) {
      throw new Error('User already exists. Go to /login instead')
    }
    throw error
  }
  return { user: data.user, session: data.session }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) return null
  return user
}

export async function getUserProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}