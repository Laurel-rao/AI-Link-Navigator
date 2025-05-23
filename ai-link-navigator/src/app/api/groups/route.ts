import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'
import { CreateGroupRequest, ApiResponse } from '@/types'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }

    const groups = await prisma.group.findMany({
      include: {
        links: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: groups
    } as ApiResponse)
  } catch (error) {
    console.error('Get groups error:', error)
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

    const body: CreateGroupRequest = await request.json()
    const { id, title, description, order } = body

    if (!id || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' } as ApiResponse,
        { status: 400 }
      )
    }

    // 检查分组ID是否已存在
    const existingGroup = await prisma.group.findUnique({
      where: { id }
    })

    if (existingGroup) {
      return NextResponse.json(
        { success: false, error: 'Group ID already exists' } as ApiResponse,
        { status: 400 }
      )
    }

    // 创建分组
    const group = await prisma.group.create({
      data: {
        id,
        title,
        description,
        order: order || 0,
      },
      include: {
        links: true
      }
    })

    return NextResponse.json({
      success: true,
      data: group,
      message: 'Group created successfully'
    } as ApiResponse)
  } catch (error) {
    console.error('Create group error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
} 