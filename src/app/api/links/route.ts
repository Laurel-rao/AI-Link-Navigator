import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'
import { CreateLinkRequest, ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }

    const body: CreateLinkRequest = await request.json()
    const { id, title, url, description, order, groupId } = body

    if (!id || !title || !url || !groupId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' } as ApiResponse,
        { status: 400 }
      )
    }

    // 检查链接ID是否已存在
    const existingLink = await prisma.link.findUnique({
      where: { id }
    })

    if (existingLink) {
      return NextResponse.json(
        { success: false, error: 'Link ID already exists' } as ApiResponse,
        { status: 400 }
      )
    }

    // 检查分组是否存在
    const existingGroup = await prisma.group.findUnique({
      where: { id: groupId }
    })

    if (!existingGroup) {
      return NextResponse.json(
        { success: false, error: 'Group not found' } as ApiResponse,
        { status: 400 }
      )
    }

    // 创建链接
    const link = await prisma.link.create({
      data: {
        id,
        title,
        url,
        description,
        order: order || 0,
        groupId,
      },
      include: {
        group: true
      }
    })

    return NextResponse.json({
      success: true,
      data: link,
      message: 'Link created successfully'
    } as ApiResponse)
  } catch (error) {
    console.error('Create link error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
} 