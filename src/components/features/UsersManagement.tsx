'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/lib/utils/api'
import { User, CreateUserRequest, UpdateUserRequest, Role } from '@/types'
import { HighlightText } from '@/components/ui/HighlightText'

interface UsersManagementProps {
  searchQuery: string
}

export function UsersManagement({ searchQuery }: UsersManagementProps) {
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    username: '',
    password: '',
    role: 'USER'
  })
  const [editUser, setEditUser] = useState<UpdateUserRequest>({
    role: 'USER',
    password: ''
  })

  const queryClient = useQueryClient()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userApi.getUsers()
      return response.data.data as User[]
    }
  })

  const createUserMutation = useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowAddUserForm(false)
      setNewUser({ username: '', password: '', role: 'USER' })
    }
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ username, data }: { username: string, data: UpdateUserRequest }) => 
      userApi.updateUser(username, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setEditingUser(null)
      setShowPasswordField(false)
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    createUserMutation.mutate(newUser)
  }

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingUser) {
      // 如果密码为空，从请求中移除密码字段
      const updateData: UpdateUserRequest = {
        role: editUser.role
      }
      
      if (showPasswordField && editUser.password && editUser.password.trim() !== '') {
        updateData.password = editUser.password
      }
      
      updateUserMutation.mutate({ username: editingUser, data: updateData })
    }
  }

  const startEditUser = (user: User) => {
    setEditingUser(user.username)
    setEditUser({
      role: user.role,
      password: ''
    })
    setShowPasswordField(false)
  }

  const filteredUsers = users.filter(user =>
    searchQuery === '' ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">用户账户管理</h2>
        <button
          onClick={() => setShowAddUserForm(true)}
          className="bg-purple-500 hover:bg-purple-600 px-3 py-1.5 rounded text-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          添加用户
        </button>
      </div>

      {showAddUserForm && (
        <div className="mb-8 p-4 bg-slate-700 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-blue-400">添加新用户</h3>
            <button
              onClick={() => setShowAddUserForm(false)}
              className="text-slate-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300">用户名</label>
              <input
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                required
                className="mt-1 w-full bg-slate-800 border-slate-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300">密码</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                className="mt-1 w-full bg-slate-800 border-slate-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300">角色</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                className="mt-1 w-full bg-slate-800 border-slate-600 rounded px-3 py-2 text-white"
              >
                <option value="USER">普通用户 (User)</option>
                <option value="ADMIN">管理员 (Admin)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={createUserMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm"
            >
              {createUserMutation.isPending ? '创建中...' : '创建用户'}
            </button>
            {createUserMutation.error && (
              <p className="text-red-400 text-sm mt-2">
                {createUserMutation.error.message}
              </p>
            )}
          </form>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium mb-3 text-blue-400">现有用户列表</h3>
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4 bg-slate-700 rounded-lg">
              {editingUser === user.username ? (
                // 编辑用户表单
                <div className="p-3 bg-slate-600 rounded">
                  <h4 className="text-lg font-medium mb-3 text-blue-400">
                    编辑用户: 
                    <HighlightText 
                      text={user.username} 
                      searchQuery={searchQuery}
                      className="ml-2 text-lg font-medium" 
                    />
                  </h4>
                  <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">角色</label>
                      <select
                        value={editUser.role}
                        onChange={(e) => setEditUser({ ...editUser, role: e.target.value as Role })}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
                      >
                        <option value="USER">普通用户 (User)</option>
                        <option value="ADMIN">管理员 (Admin)</option>
                      </select>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm text-slate-300">密码</label>
                        <button
                          type="button"
                          onClick={() => setShowPasswordField(!showPasswordField)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          {showPasswordField ? '取消修改密码' : '修改密码'}
                        </button>
                      </div>
                      {showPasswordField && (
                        <div className="space-y-2">
                          <input
                            type="password"
                            value={editUser.password}
                            onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                            placeholder="输入新密码（留空表示不修改）"
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
                          />
                          <p className="text-xs text-slate-400">
                            ⚠️ 管理员权限：修改密码将影响用户登录，请谨慎操作
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={updateUserMutation.isPending}
                        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-sm"
                      >
                        {updateUserMutation.isPending ? '保存中...' : '保存'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUser(null)
                          setShowPasswordField(false)
                        }}
                        className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded text-sm"
                      >
                        取消
                      </button>
                    </div>
                  </form>
                  {updateUserMutation.error && (
                    <p className="text-red-400 text-sm mt-2">
                      {updateUserMutation.error.message}
                    </p>
                  )}
                </div>
              ) : (
                // 显示用户信息 - 使用高亮和更大字体
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">
                        <HighlightText 
                          text={user.username} 
                          searchQuery={searchQuery}
                          className="text-lg font-bold" 
                        />
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          <HighlightText 
                            text={user.role === 'ADMIN' ? '管理员' : '普通用户'} 
                            searchQuery={searchQuery}
                            className="text-sm font-medium" 
                          />
                        </span>
                        <span className="text-slate-400 text-sm">
                          创建于 {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEditUser(user)}
                      className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      编辑
                    </button>
                    <button
                      onClick={() => deleteUserMutation.mutate(user.username)}
                      disabled={deleteUserMutation.isPending}
                      className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      删除
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {filteredUsers.length === 0 && (
          <p className="text-slate-400 text-center py-4 text-lg">
            {searchQuery ? (
              <>
                未找到匹配 &quot;
                <span className="bg-yellow-300 text-yellow-900 px-1 rounded font-semibold">
                  {searchQuery}
                </span>
                &quot; 的用户。
              </>
            ) : (
              '暂无用户数据。'
            )}
          </p>
        )}
      </div>

      {/* 安全提示 */}
      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
        <div className="flex items-start space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-yellow-500 font-medium text-sm">安全提示</h4>
            <p className="text-yellow-400 text-xs mt-1">
              • 只有管理员可以编辑用户信息和密码<br/>
              • 修改密码后，该用户需要使用新密码重新登录<br/>
              • 删除用户操作不可撤销，请谨慎操作
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 