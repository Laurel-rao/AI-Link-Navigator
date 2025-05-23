import { User, Group, Link, Setting, Role } from '@prisma/client'

// 导出Prisma类型
export type { User, Group, Link, Setting, Role }

// 扩展类型定义
export interface GroupWithLinks extends Group {
  links: Link[]
}

export interface UserSession {
  id: string
  username: string
  role: Role
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface LoginRequest {
  username: string
  password: string
  captcha?: string
}

export interface CreateUserRequest {
  username: string
  password: string
  role: Role
}

export interface UpdateUserRequest {
  username?: string
  password?: string
  role?: Role
}

export interface CreateGroupRequest {
  id: string
  title: string
  description?: string
  order?: number
}

export interface UpdateGroupRequest {
  title?: string
  description?: string
  order?: number
}

export interface CreateLinkRequest {
  id: string
  title: string
  url: string
  description?: string
  order?: number
  groupId: string
}

export interface UpdateLinkRequest {
  title?: string
  url?: string
  description?: string
  order?: number
  groupId?: string
}

export interface SiteSettings {
  site_title?: string
  site_heading?: string
  site_subheading?: string
} 