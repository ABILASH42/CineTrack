'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, BookmarkCheck, Library, Search, User, LogOut } from 'lucide-react';
import { useLibrary } from '@/lib/context/LibraryContext';

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useLibrary();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Discover', href: '/', icon: Compass },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'My Watchlist', href: '/library', icon: BookmarkCheck },
    { name: 'Collections', href: '/collections', icon: Library },
  ];

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        isScrolled
          ? 'bg-slate-950/85 backdrop-blur-xl border-b border-white/10 shadow-2xl py-0'
          : 'bg-gradient-to-b from-slate-950/80 via-slate-950/30 to-transparent border-b-0 border-transparent shadow-none py-1.5 sm:py-2'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-rose-600 via-rose-500 to-amber-500 p-[1.5px] shadow-lg shadow-rose-600/25 group-hover:shadow-rose-600/40 group-hover:scale-105 transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[10.5px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-amber-500/10 group-hover:opacity-100 transition-opacity" />
              <svg className="w-5 h-5 text-rose-500 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="2 2" />
                <path d="M3 15H21" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="2 2" />
                <polygon points="10,8 16,12 10,16" fill="#F59E0B" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-black text-lg sm:text-xl tracking-tight text-white flex items-center gap-0.5 drop-shadow-md">
              CINE<span className="text-rose-500 font-black">TRACK</span>
            </span>
            <span className="hidden xs:block text-[9px] tracking-[0.2em] uppercase font-bold text-slate-400 -mt-0.5">
              CINEMA LOG
            </span>
          </div>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className={`hidden md:flex items-center gap-1 border rounded-full p-1.5 transition-all backdrop-blur-xl ${
          isScrolled ? 'bg-white/5 border-white/10' : 'bg-black/50 border-white/15 shadow-xl'
        }`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 lg:px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-600/30 font-bold'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Auth Profile Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/library"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-slate-200 text-xs font-semibold hover:border-rose-500/50 active:scale-95 transition-all backdrop-blur-xl ${
                  isScrolled ? 'bg-slate-900 border-white/10' : 'bg-black/50 border-white/15 shadow-lg'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold text-xs">
                  {profile?.username ? profile.username[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline font-bold text-slate-100 max-w-[100px] truncate">
                  {profile?.username || user.email?.split('@')[0]}
                </span>
              </Link>

              <button
                onClick={() => signOut()}
                className="p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-white/10 active:scale-95 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-600/30 active:scale-95 transition-transform"
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-xl text-[10px] sm:text-xs font-medium transition-all ${
                isActive
                  ? 'text-rose-400 font-bold bg-rose-500/10'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-rose-500' : 'text-slate-400'}`} />
              <span className="truncate max-w-[70px]">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
