import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'
import { SiteSettings, ApiResponse } from '@/types'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }

    const settings = await prisma.setting.findMany()
    
    // 转换为键值对格式
    const settingsObject: SiteSettings = {}
    settings.forEach(setting => {
      settingsObject[setting.key as keyof SiteSettings] = setting.value || undefined
    })

    return NextResponse.json({
      success: true,
      data: settingsObject
    } as ApiResponse)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }

    const body: SiteSettings = await request.json()

    // 更新或创建设置
    const updatePromises = Object.entries(body).map(async ([key, value]) => {
      if (value !== undefined) {
        return prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { 
            key, 
            value,
            description: getSettingDescription(key)
          }
        })
      }
    })

    await Promise.all(updatePromises.filter(Boolean))

    // 获取更新后的设置
    const updatedSettings = await prisma.setting.findMany()
    const settingsObject: SiteSettings = {}
    updatedSettings.forEach(setting => {
      settingsObject[setting.key as keyof SiteSettings] = setting.value || undefined
    })

    return NextResponse.json({
      success: true,
      data: settingsObject,
      message: 'Settings updated successfully'
    } as ApiResponse)
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    site_title: '网站标题（显示在浏览器标签页）',
    site_heading: '网站主标题（显示在页面顶部）',
    site_subheading: '网站副标题（显示在主标题下方）'
  }
  return descriptions[key] || ''
} 