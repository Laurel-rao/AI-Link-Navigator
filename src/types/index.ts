export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

export interface User {
  id: string
  email: string
  name: string | null
  role: 'USER' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}

export interface Resource {
  id: string
  title: string
  url: string
  description: string | null
  category: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
} 