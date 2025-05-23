import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// 从原始数据文件导入数据
const initialData = {
  "ai_tools": {
    "title": "AI 工具",
    "description": "各种AI辅助工具和应用",
    "links": {
      "chatgpt": { "title": "ChatGPT", "url": "https://chat.openai.com/", "description": "OpenAI推出的AI对话工具" },
      "claude": { "title": "Claude", "url": "https://claude.ai/", "description": "Anthropic的AI助手" },
      "gemini": { "title": "Gemini", "url": "https://gemini.google.com/", "description": "Google的AI助手" },
      "midjourney": { "title": "Midjourney", "url": "https://www.midjourney.com/", "description": "AI图像生成工具" },
      "stable_diffusion": { "title": "Stable Diffusion", "url": "https://stablediffusionweb.com/", "description": "开源AI图像生成" }
    }
  },
  "ai_programming": {
    "title": "AI 编程",
    "description": "编程相关的AI工具",
    "links": {
      "github_copilot": { "title": "GitHub Copilot", "url": "https://github.com/features/copilot", "description": "AI代码补全助手" },
      "cursor": { "title": "Cursor", "url": "https://cursor.sh/", "description": "AI驱动的代码编辑器" },
      "codeium": { "title": "Codeium", "url": "https://codeium.com/", "description": "免费的AI代码助手" },
      "tabnine": { "title": "Tabnine", "url": "https://www.tabnine.com/", "description": "AI代码补全工具" }
    }
  },
  "ai_research": {
    "title": "AI 研究",
    "description": "AI研究相关资源",
    "links": {
      "arxiv": { "title": "arXiv", "url": "https://arxiv.org/", "description": "学术论文预印本" },
      "papers_with_code": { "title": "Papers with Code", "url": "https://paperswithcode.com/", "description": "机器学习论文与代码" },
      "huggingface": { "title": "Hugging Face", "url": "https://huggingface.co/", "description": "AI模型和数据集平台" },
      "google_scholar": { "title": "Google Scholar", "url": "https://scholar.google.com/", "description": "学术搜索引擎" }
    }
  }
}

async function main() {
  console.log('开始初始化数据库...')

  // 创建默认管理员用户
  const adminPassword = await hash('admin123', 12)
  
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  console.log('✅ 创建默认管理员用户: admin / admin123')

  // 创建普通用户
  const userPassword = await hash('user123', 12)
  
  await prisma.user.upsert({
    where: { username: 'user' },
    update: {},
    create: {
      username: 'user',
      password: userPassword,
      role: 'USER',
    },
  })

  console.log('✅ 创建默认普通用户: user / user123')

  // 创建基本设置
  const settings = [
    { key: 'site_title', value: 'AI-Link-Navigator - 智能导航站', description: '网站标题（显示在浏览器标签页）' },
    { key: 'site_heading', value: 'AI资源导航', description: '网站主标题（显示在页面顶部）' },
    { key: 'site_subheading', value: '前沿AI工具与资源的精选集合', description: '网站副标题（显示在主标题下方）' }
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  console.log('✅ 创建基本网站设置')

  // 创建分组和链接
  let order = 0
  for (const [groupId, groupData] of Object.entries(initialData)) {
    // 创建分组
    await prisma.group.upsert({
      where: { id: groupId },
      update: {
        title: groupData.title,
        description: groupData.description,
        order: order++,
      },
      create: {
        id: groupId,
        title: groupData.title,
        description: groupData.description,
        order: order - 1,
      },
    })

    // 创建链接
    let linkOrder = 0
    for (const [linkId, linkData] of Object.entries(groupData.links)) {
      await prisma.link.upsert({
        where: { id: linkId },
        update: {
          title: linkData.title,
          url: linkData.url,
          description: linkData.description,
          order: linkOrder++,
          groupId: groupId,
        },
        create: {
          id: linkId,
          title: linkData.title,
          url: linkData.url,
          description: linkData.description,
          order: linkOrder - 1,
          groupId: groupId,
        },
      })
    }

    console.log(`✅ 创建分组 "${groupData.title}" 和 ${Object.keys(groupData.links).length} 个链接`)
  }

  console.log('🎉 数据库初始化完成!')
  console.log('\n📝 登录信息:')
  console.log('  管理员: admin / admin123')
  console.log('  普通用户: user / user123')
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 