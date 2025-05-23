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
  // 基本站点信息
  site_title?: string
  site_heading?: string
  site_subheading?: string
  
  // 导航栏文字
  nav_welcome_text?: string
  nav_admin_button?: string
  nav_logout_button?: string
  
  // 登录页面文字
  login_title?: string
  login_subtitle?: string
  login_username_placeholder?: string
  login_password_placeholder?: string
  login_submit_button?: string
  login_error_invalid?: string
  login_error_network?: string
  login_dev_notice_title?: string
  login_dev_admin_label?: string
  login_dev_user_label?: string
  login_copyright?: string
  
  // 退出登录页面文字
  signout_title?: string
  signout_subtitle?: string
  signout_description?: string
  signout_confirm_button?: string
  signout_cancel_button?: string
  signout_warning?: string
  signout_loading_text?: string
  signout_copyright?: string
  
  // 主页文字
  home_section_title?: string
  
  // 管理后台文字
  admin_title?: string
  admin_preview_button?: string
  admin_logout_button?: string
  
  // 通用文字
  loading_text?: string
  error_text?: string
  success_text?: string
  cancel_text?: string
  confirm_text?: string
  save_text?: string
  edit_text?: string
  delete_text?: string
  add_text?: string
} 