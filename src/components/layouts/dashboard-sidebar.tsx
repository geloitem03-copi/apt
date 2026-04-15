'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Building2, 
  DoorOpen, 
  Users, 
  MessageSquare, 
  Wallet,
  Home,
  Receipt,
  LogOut,
  User
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'landlord' | 'tenant' | 'admin'
  userName?: string
}

const landlordNav: NavItem[] = [
  { href: '/landlord', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/landlord/properties', label: 'Properties', icon: <Building2 size={20} /> },
  { href: '/landlord/units', label: 'Units', icon: <DoorOpen size={20} /> },
  { href: '/landlord/tenants', label: 'Tenants', icon: <Users size={20} /> },
  { href: '/landlord/inquiries', label: 'Inquiries', icon: <MessageSquare size={20} /> },
  { href: '/landlord/payments', label: 'Payments', icon: <Wallet size={20} /> },
]

const tenantNav: NavItem[] = [
  { href: '/tenant', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/tenant/rent', label: 'My Rent', icon: <Home size={20} /> },
  { href: '/tenant/bills', label: 'Bills', icon: <Receipt size={20} /> },
  { href: '/tenant/payments', label: 'My Payments', icon: <Wallet size={20} /> },
]

const adminNav: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/admin/users', label: 'Users', icon: <User size={20} /> },
  { href: '/admin/properties', label: 'Properties', icon: <Building2 size={20} /> },
]

export function DashboardLayout({ children, role, userName }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  const navItems = role === 'landlord' ? landlordNav : role === 'tenant' ? tenantNav : adminNav

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Dark Theme */}
      <aside className="w-64 bg-[#0F172A] hidden md:flex flex-col fixed h-screen">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">RentalApp</h1>
          <p className="text-sm text-slate-400 capitalize">{role} Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-[#4F46E5] text-white'
                  : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          {userName && (
            <p className="text-xs text-slate-400 mb-2">Welcome, {userName}</p>
          )}
          <Button 
            variant="ghost" 
            className="w-full text-slate-300 hover:text-white hover:bg-[#1E293B]" 
            onClick={handleSignOut}
          >
            <LogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-[#F8FAFC] ml-64">
        {children}
      </main>
    </div>
  )
}