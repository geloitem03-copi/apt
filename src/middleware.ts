import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protected landlord routes
  if (pathname.startsWith('/landlord')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Protected tenant routes
  if (pathname.startsWith('/tenant')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // If logged in and trying to access login, redirect to dashboard
  if (pathname === '/login' && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || user.user_metadata?.role
    if (role === 'landlord') {
      return NextResponse.redirect(new URL('/landlord', request.url))
    } else {
      return NextResponse.redirect(new URL('/tenant', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/landlord/:path*', '/tenant/:path*', '/login'],
}
