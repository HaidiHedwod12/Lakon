"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AdminGuardProps {
  children: React.ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is admin
    const adminStatus = localStorage.getItem("isAdmin")
    
    if (adminStatus === "true") {
      setIsAdmin(true)
    } else {
      // Redirect to login if not admin
      router.push("/login")
    }
    
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-slate-300">Memverifikasi akses...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect to login
  }

  return <>{children}</>
} 