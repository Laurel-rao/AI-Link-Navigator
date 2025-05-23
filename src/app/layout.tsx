import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/lib/utils/providers";
import { prisma } from '@/lib/prisma/client'
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

async function getSiteTitle(): Promise<string> {
  try {
    const titleSetting = await prisma.setting.findUnique({
      where: { key: 'site_title' }
    })
    return titleSetting?.value || 'AI-Link-Navigator'
  } catch (error) {
    console.error('Error fetching site title:', error)
    return 'AI-Link-Navigator'
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const title = await getSiteTitle()
  
  return {
    title,
    description: "现代化AI资源导航平台",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
