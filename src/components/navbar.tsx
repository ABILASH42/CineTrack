import Link from 'next/link'
import { Film, LayoutDashboard, Library, FolderHeart, BarChart3, Search, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  userEmail?: string | null
}

export default function Navbar({ userEmail }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-md group-hover:scale-105 transition-transform duration-200">
              <Film className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              CineTrack
            </span>
          </Link>

          {userEmail && (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800/60 text-zinc-300 hover:text-white transition-colors">
                <LayoutDashboard className="h-4 w-4 text-amber-500" />
                Dashboard
              </Link>
              <Link href="/search" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800/60 text-zinc-300 hover:text-white transition-colors">
                <Search className="h-4 w-4 text-rose-500" />
                Discover
              </Link>
              <Link href="/library" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800/60 text-zinc-300 hover:text-white transition-colors">
                <Library className="h-4 w-4 text-purple-500" />
                My Library
              </Link>
              <Link href="/collections" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800/60 text-zinc-300 hover:text-white transition-colors">
                <FolderHeart className="h-4 w-4 text-blue-500" />
                Collections
              </Link>
              <Link href="/stats" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800/60 text-zinc-300 hover:text-white transition-colors">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                Analytics
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {userEmail ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs font-medium text-zinc-400 max-w-[150px] truncate">
                {userEmail}
              </span>
              <form action="/auth/signout" method="post">
                <Button variant="ghost" size="sm" type="submit" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white shadow-md">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
