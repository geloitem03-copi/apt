'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon?: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'landlord' | 'tenant' | 'admin'
}

const landlordNav: NavItem[] = [
  { href: '/landlord', label: 'Dashboard' },
  { href: '/landlord/properties', label: 'Properties' },
  { href: '/landlord/units', label: 'Units' },
  { href: '/landlord/tenants', label: 'Tenants' },
  { href: '/landlord/inquiries', label: 'Inquiries' },
  { href: '/landlord/payments', label: 'Payments' },
]

const tenantNav: NavItem[] = [
  { href: '/tenant', label: 'Dashboard' },
  { href: '/tenant/rent', label: 'My Rent' },
  { href: '/tenant/bills', label: 'Bills' },
  { href: '/tenant/payments', label: 'My Payments' },
]

const adminNav: NavItem[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/properties', label: 'Properties' },
]

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  const navItems = role === 'landlord' ? landlordNav : role === 'tenant' ? tenantNav : adminNav

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">RentalApp</h1>
          <p className="text-sm text-muted-foreground capitalize">{role} Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-3 py-2 rounded-md text-sm font-medium',
                pathname === item.href
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-50">
        {children}
      </main>
    </div>
  )
}