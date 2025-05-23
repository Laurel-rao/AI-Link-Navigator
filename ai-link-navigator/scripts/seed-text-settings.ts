import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始添加默认文字设置...')

  const defaultSettings = [
    // 基本站点信息
    { key: 'site_title', value: 'AI-Link-Navigator', description: '网站标题，显示在浏览器标签页' },
    { key: 'site_heading', value: 'AI资源导航', description: '网站主标题，显示在首页' },
    { key: 'site_subheading', value: '前沿AI工具与资源的精选集合', description: '网站副标题，显示在主标题下方' },
    
    // 导航栏文字
    { key: 'nav_welcome_text', value: '欢迎回来', description: '导航栏的欢迎用户文字' },
    { key: 'nav_admin_button', value: '管理后台', description: '管理后台按钮文字' },
    { key: 'nav_logout_button', value: '退出登录', description: '退出登录按钮文字' },
    
    // 登录页面文字
    { key: 'login_title', value: 'AI导航系统', description: '登录页面主标题' },
    { key: 'login_subtitle', value: '智能资源导航平台', description: '登录页面副标题' },
    { key: 'login_username_placeholder', value: '请输入用户名', description: '用户名输入框占位符' },
    { key: 'login_password_placeholder', value: '请输入密码', description: '密码输入框占位符' },
    { key: 'login_submit_button', value: '立即登录', description: '登录按钮文字' },
    { key: 'login_error_invalid', value: '用户名或密码错误', description: '登录错误提示' },
    { key: 'login_error_network', value: '登录过程中发生错误，请稍后重试', description: '网络错误提示' },
    { key: 'login_dev_notice_title', value: '开发环境 - 测试账号', description: '开发环境提示标题' },
    { key: 'login_dev_admin_label', value: '管理员', description: '测试管理员账号标签' },
    { key: 'login_dev_user_label', value: '用户', description: '测试用户账号标签' },
    { key: 'login_copyright', value: '© 2024 AI-Link-Navigator. 现代化智能导航平台', description: '登录页版权信息' },
    
    // 退出登录页面文字
    { key: 'signout_title', value: '退出确认', description: '退出登录确认页面标题' },
    { key: 'signout_subtitle', value: '您确定要退出登录吗？', description: '退出登录确认页面副标题' },
    { key: 'signout_description', value: '退出后您需要重新登录才能访问系统', description: '退出登录说明文字' },
    { key: 'signout_confirm_button', value: '确认退出', description: '确认退出按钮文字' },
    { key: 'signout_cancel_button', value: '取消', description: '取消退出按钮文字' },
    { key: 'signout_warning', value: '退出后所有未保存的数据将丢失', description: '退出警告信息' },
    { key: 'signout_loading_text', value: '正在退出...', description: '正在退出时显示的文字' },
    { key: 'signout_copyright', value: '© 2024 AI-Link-Navigator. 安全退出系统', description: '退出页版权信息' },
    
    // 主页文字
    { key: 'home_section_title', value: '资源分类', description: '主页资源分类部分标题' },
    
    // 管理后台文字
    { key: 'admin_title', value: 'AI导航管理后台', description: '管理后台页面标题' },
    { key: 'admin_preview_button', value: '预览网站', description: '预览网站按钮文字' },
    { key: 'admin_logout_button', value: '退出登录', description: '管理后台退出登录按钮文字' },
    
    // 通用文字
    { key: 'loading_text', value: '加载中...', description: '页面加载时显示的文字' },
    { key: 'error_text', value: '发生错误', description: '一般错误提示文字' },
    { key: 'success_text', value: '操作成功', description: '操作成功提示文字' },
    { key: 'cancel_text', value: '取消', description: '取消按钮文字' },
    { key: 'confirm_text', value: '确认', description: '确认按钮文字' },
    { key: 'save_text', value: '保存', description: '保存按钮文字' },
    { key: 'edit_text', value: '编辑', description: '编辑按钮文字' },
    { key: 'delete_text', value: '删除', description: '删除按钮文字' },
    { key: 'add_text', value: '添加', description: '添加按钮文字' }
  ]

  let addedCount = 0
  let updatedCount = 0

  for (const setting of defaultSettings) {
    try {
      const existingSetting = await prisma.setting.findUnique({
        where: { key: setting.key }
      })

      if (existingSetting) {
        // 如果设置已存在，只更新描述，保留现有值
        await prisma.setting.update({
          where: { key: setting.key },
          data: { description: setting.description }
        })
        updatedCount++
        console.log(`✓ 更新设置描述: ${setting.key}`)
      } else {
        // 如果设置不存在，创建新设置
        await prisma.setting.create({
          data: setting
        })
        addedCount++
        console.log(`✓ 新增设置: ${setting.key} = ${setting.value}`)
      }
    } catch (error) {
      console.error(`✗ 处理设置 ${setting.key} 时出错:`, error)
    }
  }

  console.log(`\n完成！`)
  console.log(`新增设置: ${addedCount} 个`)
  console.log(`更新描述: ${updatedCount} 个`)
  console.log(`总计处理: ${addedCount + updatedCount} 个设置项`)
}

main()
  .catch((e) => {
    console.error('脚本执行出错:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 