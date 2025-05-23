import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'
import { UpdateGroupRequest, ApiResponse } from '@/types'

interface UpdateData {
  title?: string
  description?: string | null
  order?: number
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }

    const body: UpdateGroupRequest = await request.json()
    const { title, description, order } = body

    // 查找要更新的分组
    const existingGroup = await prisma.group.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingGroup) {
      return NextResponse.json(
        { success: false, error: 'Group not found' } as ApiResponse,
        { status: 404 }
      )
    }

    // 准备更新数据
    const updateData: UpdateData = {}
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (order !== undefined) updateData.order = order

    // 更新分组
    const updatedGroup = await prisma.group.update({
      where: { id: resolvedParams.id },
      data: updateData,
      include: {
        links: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedGroup,
      message: 'Group updated successfully'
    } as ApiResponse)
  } catch (error) {
    console.error('Update group error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }

    // 查找要删除的分组
    const existingGroup = await prisma.group.findUnique({
      where: { id: resolvedParams.id },
      include: {
        links: true
      }
    })

    if (!existingGroup) {
      return NextResponse.json(
        { success: false, error: 'Group not found' } as ApiResponse,
        { status: 404 }
      )
    }

    // 删除分组（Prisma会自动级联删除相关链接）
    await prisma.group.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully'
    } as ApiResponse)
  } catch (error) {
    console.error('Delete group error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
} 