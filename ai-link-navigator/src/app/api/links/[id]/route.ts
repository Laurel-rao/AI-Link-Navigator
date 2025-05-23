import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'
import { UpdateLinkRequest, ApiResponse } from '@/types'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }

    const body: UpdateLinkRequest = await request.json()
    const { title, url, description, order, groupId } = body

    // 查找要更新的链接
    const existingLink = await prisma.link.findUnique({
      where: { id: params.id }
    })

    if (!existingLink) {
      return NextResponse.json(
        { success: false, error: 'Link not found' } as ApiResponse,
        { status: 404 }
      )
    }

    // 如果要更新分组，检查分组是否存在
    if (groupId && groupId !== existingLink.groupId) {
      const existingGroup = await prisma.group.findUnique({
        where: { id: groupId }
      })

      if (!existingGroup) {
        return NextResponse.json(
          { success: false, error: 'Group not found' } as ApiResponse,
          { status: 400 }
        )
      }
    }

    // 准备更新数据
    const updateData: any = {}
    
    if (title !== undefined) updateData.title = title
    if (url !== undefined) updateData.url = url
    if (description !== undefined) updateData.description = description
    if (order !== undefined) updateData.order = order
    if (groupId !== undefined) updateData.groupId = groupId

    // 更新链接
    const updatedLink = await prisma.link.update({
      where: { id: params.id },
      data: updateData,
      include: {
        group: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedLink,
      message: 'Link updated successfully'
    } as ApiResponse)
  } catch (error) {
    console.error('Update link error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }

    // 查找要删除的链接
    const existingLink = await prisma.link.findUnique({
      where: { id: params.id }
    })

    if (!existingLink) {
      return NextResponse.json(
        { success: false, error: 'Link not found' } as ApiResponse,
        { status: 404 }
      )
    }

    // 删除链接
    await prisma.link.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Link deleted successfully'
    } as ApiResponse)
  } catch (error) {
    console.error('Delete link error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
} 