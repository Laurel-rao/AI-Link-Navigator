'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/lib/utils/api'
import { User, CreateUserRequest, Role } from '@/types'

interface UsersManagementProps {
  searchQuery: string
}

export function UsersManagement({ searchQuery }: UsersManagementProps) {
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    username: '',
    password: '',
    role: 'USER'
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
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-white">{user.username}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'ADMIN' ? '管理员' : '普通用户'}
                    </span>
                    <span className="text-slate-400 text-sm">
                      创建于 {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => deleteUserMutation.mutate(user.username)}
                  disabled={deleteUserMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredUsers.length === 0 && (
          <p className="text-slate-400 text-center py-4">
            {searchQuery ? '未找到匹配的用户。' : '暂无用户数据。'}
          </p>
        )}
      </div>
    </div>
  )
} 