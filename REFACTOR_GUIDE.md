# AI-Link-Navigator 重构指南

## 项目概述

AI-Link-Navigator 是一个基于 Python Flask 的 Web 应用程序，用于管理和导航 AI 相关资源。本文档旨在指导开发者使用现代技术栈重新实现该系统。

## 系统架构

### 当前技术栈
- 后端：Python + Flask
- 前端：HTML + JavaScript
- 数据存储：PostgreSQL

### 目标技术栈
- 包管理器：pnpm
- 构建工具：Vite
- 框架：Next.js 13+ (App Router)
- 样式：TailwindCSS
- 图标：CDN icon
- 数据库：PostgreSQL
- 语言：TypeScript
- ORM：Prisma

### 核心文件结构
```
src/
├── app/                 # Next.js 13+ App Router
│   ├── api/            # API 路由
│   ├── (auth)/        # 认证相关页面
│   └── (dashboard)/   # 应用页面
├── components/         # React 组件
│   ├── ui/            # 通用UI组件
│   └── features/      # 业务组件
├── lib/               # 工具函数
│   ├── prisma/        # 数据库客户端
│   ├── auth/          # 认证相关
│   └── utils/         # 通用工具
├── hooks/             # 自定义 Hooks
├── types/             # TypeScript 类型定义
└── styles/            # 全局样式
```

## 技术栈详细说明

### 1. 核心依赖
```json
{
  "dependencies": {
    "next": "^13.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "typescript": "^5.x",
    "@prisma/client": "^5.x",
    "tailwindcss": "^3.x",
    "zustand": "^4.x",
    "@tanstack/react-query": "^4.x",
    "next-auth": "^4.x",
    "axios": "^1.x"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/node": "^18.x",
    "prisma": "^5.x",
    "@typescript-eslint/parser": "^5.x",
    "@typescript-eslint/eslint-plugin": "^5.x",
    "eslint": "^8.x",
    "prettier": "^2.x"
  }
}
```

### 2. TypeScript 配置
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3. Prisma 数据库模型
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

### 4. API 路由实现
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { NextAuth } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      // 实现认证逻辑
    })
  ]
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### 5. 状态管理
```typescript
// src/store/useStore.ts
import create from 'zustand'

interface StoreState {
  count: number
  increment: () => void
}

export const useStore = create<StoreState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))
```

### 6. 组件实现
```typescript
// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

## 开发工具配置

### 1. ESLint 配置
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### 2. Prettier 配置
```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### 3. VS Code 设置
```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## 部署配置

### 1. Docker 配置
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### 2. 环境变量
```env
# .env.example
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## 迁移步骤

1. 环境搭建
```bash
# 初始化项目
pnpm create next-app --typescript
cd your-project

# 安装依赖
pnpm add @prisma/client next-auth @tanstack/react-query zustand
pnpm add -D prisma typescript @types/react @types/node

# 初始化 Prisma
npx prisma init
```

2. 数据库迁移
```bash
# 创建迁移
npx prisma migrate dev --name init

# 生成 Prisma Client
npx prisma generate
```

3. 开发流程
- 实现数据模型
- 创建 API 路由
- 开发前端组件
- 实现状态管理
- 添加认证逻辑

4. 测试
- 单元测试
- 集成测试
- E2E 测试

5. 部署
- 构建 Docker 镜像
- 配置 CI/CD
- 部署到生产环境

## 性能优化

1. 前端优化
- 实现组件懒加载
- 使用 Next.js Image 组件
- 实现路由预加载
- 使用静态生成 (SSG)

2. 后端优化
- 实现数据库索引
- 添加缓存层
- 优化 API 响应

## 安全考虑

1. 认证与授权
- 使用 NextAuth.js
- 实现 RBAC
- 密码加密存储

2. 数据安全
- 输入验证
- SQL 注入防护
- XSS 防护
- CSRF 防护

## 监控和日志

1. 错误监控
- 集成 Sentry
- 实现错误边界
- 添加性能监控

2. 日志记录
- 实现请求日志
- 记录错误日志
- 添加审计日志

## 时间估算

1. 环境搭建：2-3天
2. 数据库迁移：3-4天
3. 核心功能开发：2-3周
4. 测试和优化：1-2周
5. 部署上线：2-3天

总计：4-6周（根据团队规模和经验可能有所变化） 