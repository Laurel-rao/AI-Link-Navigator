'use client'

import React from 'react'

interface HighlightTextProps {
  text: string
  searchQuery: string
  className?: string
  highlightClassName?: string
}

export function HighlightText({ 
  text, 
  searchQuery, 
  className = '', 
  highlightClassName = 'bg-yellow-300 text-yellow-900 px-1 rounded font-semibold' 
}: HighlightTextProps) {
  if (!searchQuery || !text) {
    return <span className={className}>{text}</span>
  }

  // 转换为小写进行匹配，但保留原始大小写
  const lowerText = text.toLowerCase()
  const lowerQuery = searchQuery.toLowerCase()
  
  if (!lowerText.includes(lowerQuery)) {
    return <span className={className}>{text}</span>
  }

  const parts: React.JSX.Element[] = []
  let lastIndex = 0
  
  // 找到所有匹配的位置
  let index = lowerText.indexOf(lowerQuery, lastIndex)
  let keyIndex = 0
  
  while (index !== -1) {
    // 添加匹配前的文本
    if (index > lastIndex) {
      parts.push(
        <span key={`normal-${keyIndex++}`}>
          {text.slice(lastIndex, index)}
        </span>
      )
    }
    
    // 添加高亮的匹配文本
    parts.push(
      <span key={`highlight-${keyIndex++}`} className={highlightClassName}>
        {text.slice(index, index + searchQuery.length)}
      </span>
    )
    
    lastIndex = index + searchQuery.length
    index = lowerText.indexOf(lowerQuery, lastIndex)
  }
  
  // 添加剩余的文本
  if (lastIndex < text.length) {
    parts.push(
      <span key={`normal-${keyIndex++}`}>
        {text.slice(lastIndex)}
      </span>
    )
  }

  return <span className={className}>{parts}</span>
} 