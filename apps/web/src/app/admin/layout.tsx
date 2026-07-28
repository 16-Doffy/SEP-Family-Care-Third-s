/**
 * Layout bảo vệ khu vực admin — chỉ cho phép người dùng có role SYSTEM_ADMIN truy cập.
 * Tất cả người dùng khác sẽ bị chuyển hướng về /dashboard.
 */
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { AdminTopBar } from '@/components/layout/AdminTopBar'
import { MobileAdminNav } from '@/components/layout/MobileAdminNav'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'SYSTEM_ADMIN')) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
  if (!user || user.role !== 'SYSTEM_ADMIN') return null

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 overflow-y-auto">
        <AdminTopBar />
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
      <MobileAdminNav />
    </div>
  )
}

