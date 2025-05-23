import NextAuth from 'next-auth'
import { UserSession } from './index'

declare module 'next-auth' {
  interface Session {
    user: UserSession
  }

  interface User {
    id: string
    username: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    role: string
  }
} 