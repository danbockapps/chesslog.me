'use server'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {createServerClient} from '../lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = createServerClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const {error} = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.log('Error logging in:', error.code, error.status, error.message)
    if (error.status === 400) redirect('/login?error=400')
    else redirect('/error') // I don't know when this would ever happen
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = createServerClient()
  const {error} = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error.message)
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
