import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'
import { UpdateUserRequest, ApiResponse, Role } from '@/types'

interface UpdateData {
  username?: string
  password?: string
  role?: Role
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
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

    const body: UpdateUserRequest = await request.json()
    const { username: newUsername, password, role } = body

    // 查找要更新的用户
    const existingUser = await prisma.user.findUnique({
      where: { username: resolvedParams.username }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' } as ApiResponse,
        { status: 404 }
      )
    }

    // 如果要更新用户名，检查新用户名是否已存在
    if (newUsername && newUsername !== resolvedParams.username) {
      const userWithNewUsername = await prisma.user.findUnique({
        where: { username: newUsername }
      })

      if (userWithNewUsername) {
        return NextResponse.json(
          { success: false, error: 'Username already exists' } as ApiResponse,
          { status: 400 }
        )
      }
    }

    // 准备更新数据
    const updateData: UpdateData = {}
    
    if (newUsername) updateData.username = newUsername
    if (role) updateData.role = role
    if (password) updateData.password = await hash(password, 12)

    // 更新用户
    const updatedUser = await prisma.user.update({
      where: { username: resolvedParams.username },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    } as ApiResponse)
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
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

    // 不允许删除自己
    if (session.user.username === resolvedParams.username) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' } as ApiResponse,
        { status: 400 }
      )
    }

    // 查找要删除的用户
    const existingUser = await prisma.user.findUnique({
      where: { username: resolvedParams.username }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' } as ApiResponse,
        { status: 404 }
      )
    }

    // 删除用户
    await prisma.user.delete({
      where: { username: resolvedParams.username }
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    } as ApiResponse)
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
} 