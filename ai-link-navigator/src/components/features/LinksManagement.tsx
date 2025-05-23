'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groupApi, linkApi } from '@/lib/utils/api'
import { GroupWithLinks, CreateGroupRequest, CreateLinkRequest, UpdateGroupRequest, UpdateLinkRequest, Link } from '@/types'

interface LinksManagementProps {
  searchQuery: string
}

export function LinksManagement({ searchQuery }: LinksManagementProps) {
  const [showAddGroupForm, setShowAddGroupForm] = useState(false)
  const [showAddLinkForm, setShowAddLinkForm] = useState<string | null>(null)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editingLink, setEditingLink] = useState<string | null>(null)
  const [newGroup, setNewGroup] = useState<CreateGroupRequest>({
    id: '',
    title: '',
    description: '',
    order: 0
  })
  const [newLink, setNewLink] = useState<CreateLinkRequest>({
    id: '',
    title: '',
    url: '',
    description: '',
    order: 0,
    groupId: ''
  })
  const [editGroup, setEditGroup] = useState<UpdateGroupRequest>({
    title: '',
    description: '',
    order: 0
  })
  const [editLink, setEditLink] = useState<UpdateLinkRequest>({
    title: '',
    url: '',
    description: '',
    order: 0
  })

  const queryClient = useQueryClient()

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await groupApi.getGroups()
      return response.data.data as GroupWithLinks[]
    }
  })

  const createGroupMutation = useMutation({
    mutationFn: groupApi.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      setShowAddGroupForm(false)
      setNewGroup({ id: '', title: '', description: '', order: 0 })
    }
  })

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateGroupRequest }) => 
      groupApi.updateGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      setEditingGroup(null)
    }
  })

  const createLinkMutation = useMutation({
    mutationFn: linkApi.createLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      setShowAddLinkForm(null)
      setNewLink({ id: '', title: '', url: '', description: '', order: 0, groupId: '' })
    }
  })

  const updateLinkMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateLinkRequest }) => 
      linkApi.updateLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      setEditingLink(null)
    }
  })

  const deleteGroupMutation = useMutation({
    mutationFn: groupApi.deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    }
  })

  const deleteLinkMutation = useMutation({
    mutationFn: linkApi.deleteLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    }
  })

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault()
    createGroupMutation.mutate(newGroup)
  }

  const handleUpdateGroup = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingGroup) {
      updateGroupMutation.mutate({ id: editingGroup, data: editGroup })
    }
  }

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault()
    createLinkMutation.mutate(newLink)
  }

  const handleUpdateLink = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingLink) {
      updateLinkMutation.mutate({ id: editingLink, data: editLink })
    }
  }

  const startEditGroup = (group: GroupWithLinks) => {
    setEditingGroup(group.id)
    setEditGroup({
      title: group.title,
      description: group.description || '',
      order: group.order
    })
  }

  const startEditLink = (link: Link) => {
    setEditingLink(link.id)
    setEditLink({
      title: link.title,
      url: link.url,
      description: link.description || '',
      order: link.order
    })
  }

  const filteredGroups = groups.filter(group =>
    searchQuery === '' ||
    group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.links.some(link =>
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
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
        <h2 className="text-xl font-semibold">分组管理</h2>
        <button
          onClick={() => setShowAddGroupForm(true)}
          className="bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded text-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          添加分组
        </button>
      </div>

      {showAddGroupForm && (
        <div className="mb-6 p-4 bg-slate-700 rounded-lg">
          <h3 className="text-lg font-medium mb-4">添加新分组</h3>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">分组ID</label>
                <input
                  type="text"
                  value={newGroup.id}
                  onChange={(e) => setNewGroup({ ...newGroup, id: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">标题</label>
                <input
                  type="text"
                  value={newGroup.title}
                  onChange={(e) => setNewGroup({ ...newGroup, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">描述</label>
              <input
                type="text"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={createGroupMutation.isPending}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm"
              >
                {createGroupMutation.isPending ? '创建中...' : '创建分组'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddGroupForm(false)}
                className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded text-sm"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {filteredGroups.map((group) => (
          <div key={group.id} className="border border-slate-700 rounded-lg p-4">
            {editingGroup === group.id ? (
              // 编辑分组表单
              <div className="mb-4 p-3 bg-slate-600 rounded">
                <h4 className="text-md font-medium mb-3">编辑分组</h4>
                <form onSubmit={handleUpdateGroup} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">标题</label>
                      <input
                        type="text"
                        value={editGroup.title}
                        onChange={(e) => setEditGroup({ ...editGroup, title: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">排序</label>
                      <input
                        type="number"
                        value={editGroup.order}
                        onChange={(e) => setEditGroup({ ...editGroup, order: parseInt(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">描述</label>
                    <input
                      type="text"
                      value={editGroup.description}
                      onChange={(e) => setEditGroup({ ...editGroup, description: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={updateGroupMutation.isPending}
                      className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs"
                    >
                      {updateGroupMutation.isPending ? '保存中...' : '保存'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingGroup(null)}
                      className="bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded text-xs"
                    >
                      取消
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // 显示分组信息
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{group.title}</h3>
                  {group.description && (
                    <p className="text-slate-400 text-sm">{group.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditGroup(group)}
                    className="bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded text-xs"
                  >
                    编辑分组
                  </button>
                  <button
                    onClick={() => {
                      setNewLink({ ...newLink, groupId: group.id })
                      setShowAddLinkForm(group.id)
                    }}
                    className="bg-green-500 hover:bg-green-600 px-2 py-1 rounded text-xs"
                  >
                    添加链接
                  </button>
                  <button
                    onClick={() => deleteGroupMutation.mutate(group.id)}
                    className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs"
                  >
                    删除分组
                  </button>
                </div>
              </div>
            )}

            {showAddLinkForm === group.id && (
              <div className="mb-4 p-3 bg-slate-600 rounded">
                <h4 className="text-md font-medium mb-3">添加新链接</h4>
                <form onSubmit={handleCreateLink} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">链接ID</label>
                      <input
                        type="text"
                        value={newLink.id}
                        onChange={(e) => setNewLink({ ...newLink, id: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">标题</label>
                      <input
                        type="text"
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">URL</label>
                    <input
                      type="url"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">描述</label>
                    <input
                      type="text"
                      value={newLink.description}
                      onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={createLinkMutation.isPending}
                      className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs"
                    >
                      {createLinkMutation.isPending ? '创建中...' : '创建链接'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddLinkForm(null)}
                      className="bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded text-xs"
                    >
                      取消
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-2">
              {group.links.map((link) => (
                <div key={link.id} className="p-2 bg-slate-700 rounded">
                  {editingLink === link.id ? (
                    // 编辑链接表单
                    <div className="p-3 bg-slate-600 rounded">
                      <h5 className="text-sm font-medium mb-3">编辑链接</h5>
                      <form onSubmit={handleUpdateLink} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-slate-300 mb-1">标题</label>
                            <input
                              type="text"
                              value={editLink.title}
                              onChange={(e) => setEditLink({ ...editLink, title: e.target.value })}
                              className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-300 mb-1">排序</label>
                            <input
                              type="number"
                              value={editLink.order}
                              onChange={(e) => setEditLink({ ...editLink, order: parseInt(e.target.value) })}
                              className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">URL</label>
                          <input
                            type="url"
                            value={editLink.url}
                            onChange={(e) => setEditLink({ ...editLink, url: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">描述</label>
                          <input
                            type="text"
                            value={editLink.description}
                            onChange={(e) => setEditLink({ ...editLink, description: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            disabled={updateLinkMutation.isPending}
                            className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs"
                          >
                            {updateLinkMutation.isPending ? '保存中...' : '保存'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingLink(null)}
                            className="bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded text-xs"
                          >
                            取消
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    // 显示链接信息
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 font-medium"
                          >
                            {link.title}
                          </a>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        {link.description && (
                          <p className="text-slate-400 text-xs mt-1">{link.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => startEditLink(link)}
                          className="bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded text-xs"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => deleteLinkMutation.mutate(link.id)}
                          className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <p className="text-slate-400 text-center py-4">
          {searchQuery ? '未找到匹配的结果。' : '暂无分组数据。'}
        </p>
      )}
    </div>
  )
} 