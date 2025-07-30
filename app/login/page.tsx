"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LakonLogo } from "@/components/logo"
import { ArrowLeft, Eye, EyeOff, Lock, User, Shield, AlertCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate login process
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (formData.username === "admin" && formData.password === "admin") {
      // Set admin session
      localStorage.setItem("isAdmin", "true")
      router.push("/dashboard")
    } else {
      setError("Username atau password salah")
    }
    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    if (error) setError("")
  }

  const handleBackToHome = () => {
    setIsNavigating(true)
    try {
      router.push("/")
      // Reset navigation state after 3 seconds if navigation fails
      setTimeout(() => {
        setIsNavigating(false)
      }, 3000)
    } catch (error) {
      // Fallback to window.location if router fails
      if (typeof window !== 'undefined') {
        window.location.href = "/"
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Back to Home Button */}
      <motion.div
        className="absolute top-6 left-6 z-50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link href="/" className="block">
          <Button
            className="text-slate-300 hover:text-amber-400 hover:bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 transition-all duration-200 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-amber-500/50 focus:outline-none bg-transparent cursor-pointer"
            onClick={handleBackToHome}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleBackToHome()
              }
            }}
            disabled={isNavigating}
            aria-label="Kembali ke halaman beranda"
            tabIndex={0}
            style={{ pointerEvents: 'auto' }}
          >
            {isNavigating ? (
              <motion.div
                className="w-4 h-4 border-2 border-slate-300/30 border-t-slate-300 rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            ) : (
              <ArrowLeft className="w-4 h-4 mr-2" />
            )}
            {isNavigating ? "Mengalihkan..." : "Kembali ke Beranda"}
          </Button>
        </Link>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo and Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex justify-center mb-8 mt-6">
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                className="relative"
              >
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
                <LakonLogo size={80} className="relative" />
              </motion.div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Masuk ke LAKON</h1>
            <p className="text-slate-400">Portal Dinas Perhubungan Surakarta</p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-white flex items-center justify-center">
                  <Shield className="w-5 h-5 mr-2 text-amber-400" />
                  Login Petugas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        name="username"
                        type="text"
                        placeholder="Masukkan username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-500 focus:ring-amber-500/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-500 focus:ring-amber-500/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {/* Login Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold py-3 shadow-lg shadow-amber-500/25"
                    >
                      {isLoading ? (
                        <motion.div
                          className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        />
                      ) : (
                        "Masuk"
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Demo Credentials */}
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-xs text-slate-400 text-center mb-2">Demo Credentials:</p>
                  <div className="text-xs text-slate-500 text-center space-y-1">
                    <div>
                      Username: <span className="text-amber-400">admin</span>
                    </div>
                    <div>
                      Password: <span className="text-amber-400">admin</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="text-slate-500 text-sm">© 2024 LAKON - Dinas Perhubungan Surakarta</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
