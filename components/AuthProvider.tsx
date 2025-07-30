"use client"

import { useEffect, useState } from "react"
import AdminNavbar from "./AdminNavbar"
import UserNavbar from "./UserNavbar"

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdmin")
    setIsAdmin(adminStatus === "true")
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {isAdmin ? <AdminNavbar /> : <UserNavbar />}
      {children}
    </>
  )
} 