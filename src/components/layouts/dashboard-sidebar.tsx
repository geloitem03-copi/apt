'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
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
  User,
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const navItems = role === 'landlord' ? landlordNav : role === 'tenant' ? tenantNav : adminNav

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="min-h-screen flex">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0F172A] flex items-center justify-between px-4 z-50">
        <h1 className="text-lg font-bold text-white">RentalApp</h1>
        <button onClick={() => setMobileMenuOpen(true)} className="text-white p-2">
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Desktop */}
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

      {/* Mobile Sidebar - Slide out */}
      <aside className={cn(
        "md:hidden fixed top-0 left-0 h-full w-64 bg-[#0F172A] z-50 transition-transform duration-300",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">RentalApp</h1>
            <p className="text-sm text-slate-400 capitalize">{role} Portal</p>
          </div>
          <button onClick={closeMobileMenu} className="text-slate-400 p-1">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu}
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
            onClick={() => {
              handleSignOut()
              closeMobileMenu()
            }}
          >
            <LogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 bg-[#F8FAFC] pt-20 md:pt-6 md:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}