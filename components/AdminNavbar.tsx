"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LakonLogo } from "@/components/logo"
import {
  BarChart3,
  Map,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  TrendingUp
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AdminNavbarProps {
  onLogout?: () => void
}

export default function AdminNavbar({ onLogout }: AdminNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      description: "Ringkasan data dan statistik"
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: TrendingUp,
      description: "Analisis mendalam data kecelakaan"
    },
    {
      name: "Map",
      href: "/map",
      icon: Map,
      description: "Peta interaktif dan visualisasi"
    },
    {
      name: "Report",
      href: "/report",
      icon: FileText,
      description: "Laporan dan dokumentasi"
    },
    {
      name: "Admin",
      href: "/admin",
      icon: Settings,
      description: "Manajemen data dan pengaturan"
    }
  ]

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      // Default logout behavior
      if (typeof window !== 'undefined') {
        localStorage.removeItem("isAdmin")
        window.location.href = "/login"
      }
    }
  }

  const isActive = (href: string) => {
    return pathname === href
  }

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  return (
    <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-start space-x-3">
              <div className="relative -top-1">
                <LakonLogo size={36} />
              </div>
              <div>
                <span className="text-xl font-bold text-white">LAKON Admin</span>
                <p className="text-xs text-slate-400 -mt-1">Laporan Kecelakaan Online</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={`relative group ${
                      isActive(item.href)
                        ? "bg-amber-500 text-slate-900 hover:bg-amber-600"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    } transition-all duration-200`}
                  >
                    {/* Active indicator background */}
                    {isActive(item.href) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-amber-500 rounded-md -z-10"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    
                    {/* Content with higher z-index */}
                    <div className="relative z-10 flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </div>
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Logout Button */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="hidden md:flex text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              className="mobile-menu-container md:hidden text-slate-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mobile-menu-container md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-800"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        isActive(item.href)
                          ? "bg-amber-500 text-slate-900"
                          : "text-slate-300 hover:text-white hover:bg-slate-800"
                      }`}
                      onClick={(e) => {
                        e.preventDefault()
                        setIsMobileMenuOpen(false)
                        // Use router for navigation
                        setTimeout(() => {
                          router.push(item.href)
                        }, 150)
                      }}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs opacity-70">{item.description}</div>
                      </div>
                    </Button>
                  </Link>
                )
              })}
              
              {/* Mobile Logout */}
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  setIsMobileMenuOpen(false)
                  // Delay logout to ensure menu closes first
                  setTimeout(() => {
                    handleLogout()
                  }, 150)
                }}
                variant="outline"
                className="w-full justify-start text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
} 