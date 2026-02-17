'use client'

import Link from 'next/link'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="font-display text-2xl font-bold text-foreground">
              HelpeR
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#workflow" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </Link>
            <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Testimonials
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            )}

            <div className="hidden md:flex gap-2">
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden pb-4 space-y-2">
            <Link
              href="#features"
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#workflow"
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary"
              onClick={() => setIsOpen(false)}
            >
              How it Works
            </Link>
            <Link
              href="#testimonials"
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary"
              onClick={() => setIsOpen(false)}
            >
              Testimonials
            </Link>
            <div className="pt-4 space-y-2 border-t border-border">
              <Link
                href="/sign-in"
                className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="block px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
