'use server'

import { cookies } from 'next/headers'

export async function setAuthCookie(token: string) {
  const cookieStore = cookies()
  
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'development',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })
}

export async function removeAuthCookie() {
  const cookieStore = cookies()
  
  cookieStore.delete('token')
}
