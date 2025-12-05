'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import Button from './Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-[9999] transition-all duration-300',
        isScrolled
          ? 'bg-white/90 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <span className="text-3xl transition-transform duration-300 group-hover:scale-110 inline-block">
                🎬
              </span>
              <div className="absolute -inset-1 bg-blue-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className={cn(
              'text-xl font-bold transition-colors duration-300',
              isScrolled ? 'text-gray-800' : 'text-white'
            )}>
              EduToon
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  href={user.role === 'creator' ? '/creator' : '/dashboard'}
                  className={cn(
                    'font-medium transition-colors duration-300',
                    isScrolled ? 'text-gray-600 hover:text-blue-600' : 'text-white/80 hover:text-white'
                  )}
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => {
                      window.location.href = '/profile';
                    }}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity p-2 rounded-lg relative z-[9999]"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        window.location.href = '/profile';
                      }
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold hover:shadow-lg hover:scale-110 transition-all">
                      {(user.full_name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <span className={cn(
                      'font-medium hidden sm:inline',
                      isScrolled ? 'text-gray-800' : 'text-white'
                    )}>
                      {user.full_name || user.email}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    'font-medium transition-colors duration-300',
                    isScrolled ? 'text-gray-600 hover:text-blue-600' : 'text-white/80 hover:text-white'
                  )}
                >
                  Masuk
                </Link>
                <Link href="/register">
                  <Button size="sm">Daftar Gratis</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              'md:hidden p-2 rounded-lg transition-colors',
              isScrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            )}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          isMobileMenuOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="py-4 space-y-3 bg-white/95 backdrop-blur-lg rounded-2xl mb-4 px-4">
            {user ? (
              <>
                <Link
                  href={user.role === 'creator' ? '/creator' : '/dashboard'}
                  className="block text-gray-600 hover:text-blue-600 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="block text-gray-600 hover:text-blue-600 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-gray-600 hover:text-red-600 font-medium py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-gray-600 hover:text-blue-600 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="w-full">Daftar Gratis</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
