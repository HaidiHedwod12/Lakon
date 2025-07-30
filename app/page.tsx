"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"
import { LakonLogo } from "@/components/logo"
import { ClientOnly } from "@/components/ui/client-only"
import {
  MapPin,
  BarChart3,
  Users,
  Shield,
  ArrowRight,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Construction,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

import { overallStats, getAccidentTrend } from "@/lib/dummy-data"
import { formatNumber } from "@/lib/utils"
import { useFirebase } from "@/hooks/useFirebase"

export default function HomePage() {
  const [selectedModal, setSelectedModal] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Fetch real-time data from Firebase
  const { data: accidents, loading: accidentsLoading } = useFirebase("accidents")
  const { data: blackspots, loading: blackspotsLoading } = useFirebase("blackspots")
  const { data: reports, loading: reportsLoading } = useFirebase("reports")
  const { data: infrastructure, loading: infrastructureLoading } = useFirebase("infrastructure")
  const { data: facilities, loading: facilitiesLoading } = useFirebase("facilities")

  useEffect(() => {
    setIsClient(true)
  }, [])

  const scrollToStats = () => {
    const statsSection = document.getElementById("stats-section")
    if (statsSection) {
      statsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const stats = [
    {
      id: "accidents",
      title: "Kecelakaan Tercatat",
      value: accidents ? accidents.length.toString() : "0",
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      description: "Total kecelakaan lalu lintas yang tercatat dalam sistem LAKON",
      details: {
        fatal: accidents ? accidents.filter((acc: any) => acc.jenis === "Fatal").length : 0,
        injury: accidents ? accidents.filter((acc: any) => acc.jenis === "Luka-luka").length : 0,
        damage: accidents ? accidents.filter((acc: any) => acc.jenis === "Kerusakan").length : 0,
        thisMonth: accidents ? Math.floor(accidents.length * 0.3) : 0,
        lastMonth: accidents ? Math.floor(accidents.length * 0.25) : 0,
      },
    },
    {
      id: "blackspots",
      title: "Titik Blackspot",
      value: blackspots ? blackspots.length.toString() : "0",
      icon: MapPin,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      description: "Titik rawan kecelakaan yang memerlukan perhatian khusus",
      details: {
        blackspot: blackspots ? blackspots.filter((spot: any) => spot.jenis === "Blackspot").length : 0,
        potential: blackspots ? blackspots.filter((spot: any) => spot.jenis === "Potential Blackspot").length : 0,
        total: blackspots ? blackspots.length : 0,
      },
    },
    {
      id: "reports",
      title: "Total Laporan",
      value: reports ? reports.length.toString() : "0",
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      description: "Total laporan masyarakat yang diterima",
      details: {
        diterima: reports ? reports.filter((report: any) => report.status === "Diterima").length : 0,
        peninjauan: reports ? reports.filter((report: any) => report.status === "Dalam Peninjauan").length : 0,
        ditindaklanjuti: reports ? reports.filter((report: any) => report.status === "Ditindaklanjuti").length : 0,
        selesai: reports ? reports.filter((report: any) => report.status === "Selesai").length : 0,
        total: reports ? reports.length : 0,
      },
    },
    {
      id: "infrastructure",
      title: "Total Infrastruktur",
      value: infrastructure ? infrastructure.length.toString() : "0",
      icon: Construction,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      description: "Total infrastruktur yang terdaftar dalam sistem",
      details: {
        trafficLights: infrastructure ? infrastructure.filter((infra: any) => infra.jenis === "Lampu Lalu Lintas").length : 0,
        signs: infrastructure ? infrastructure.filter((infra: any) => infra.jenis === "Rambu Lalu Lintas").length : 0,
        roads: infrastructure ? infrastructure.filter((infra: any) => infra.jenis === "Jalan").length : 0,
        lighting: infrastructure ? infrastructure.filter((infra: any) => infra.jenis === "Penerangan Jalan").length : 0,
      },
    },
    {
      id: "facilities",
      title: "Total Fasilitas Umum",
      value: facilities ? facilities.length.toString() : "0",
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      description: "Total fasilitas umum yang terdaftar dalam sistem",
      details: {
        hospitals: facilities ? facilities.filter((facility: any) => facility.jenis === "Rumah Sakit").length : 0,
        schools: facilities ? facilities.filter((facility: any) => facility.jenis === "Sekolah").length : 0,
        markets: facilities ? facilities.filter((facility: any) => facility.jenis === "Pasar").length : 0,
        others: facilities ? facilities.filter((facility: any) => !["Rumah Sakit", "Sekolah", "Pasar"].includes(facility.jenis)).length : 0,
      },
    },
  ]

  const features = [
    {
      id: "map",
      title: "Peta Interaktif",
      description: "Visualisasi data kecelakaan dan infrastruktur dalam peta real-time",
      icon: MapPin,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      href: "/map",
    },
    {
      id: "analytics",
      title: "Analisis Data",
      description: "Analisis komprehensif data kecelakaan dan tren lalu lintas",
      icon: BarChart3,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      href: "/analytics",
    },
    {
      id: "reports",
      title: "Laporan Masyarakat",
      description: "Platform pelaporan masalah infrastruktur oleh masyarakat",
      icon: Users,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      href: "/report",
    },
    {
      id: "dashboard",
      title: "Dashboard Analisis",
      description: "Ringkasan data kecelakaan dan rekomendasi tindakan",
      icon: Shield,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      href: "/dashboard",
    },
  ]

  const openModal = (modalId: string) => {
    setSelectedModal(modalId)
  }

  const closeModal = () => {
    setSelectedModal(null)
  }

  const renderModalContent = (stat: any) => {
    switch (stat.id) {
      case "accidents":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{stat.details.fatal}</div>
                <div className="text-slate-300 text-sm">Kecelakaan Fatal</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-400">{stat.details.injury}</div>
                <div className="text-slate-300 text-sm">Luka-luka</div>
              </div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{stat.details.damage}</div>
              <div className="text-slate-300 text-sm">Kerusakan Material</div>
            </div>
            <div className="border-t border-slate-600 pt-4">
              <h4 className="text-white font-semibold mb-3">Perbandingan Bulanan</h4>
              <div className="flex justify-between">
                <div>
                  <div className="text-lg font-semibold text-white">{stat.details.thisMonth}</div>
                  <div className="text-slate-400 text-sm">Bulan Ini</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-300">{stat.details.lastMonth}</div>
                  <div className="text-slate-400 text-sm">Bulan Lalu</div>
                </div>
              </div>
            </div>
          </div>
        )

      case "blackspots":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-400">{stat.details.blackspot}</div>
                <div className="text-slate-300 text-sm">Blackspot</div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-400">{stat.details.potential}</div>
                <div className="text-slate-300 text-sm">Potential Blackspot</div>
              </div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-amber-400">{stat.details.total}</div>
              <div className="text-slate-300 text-sm">Total Titik Rawan</div>
            </div>
          </div>
        )

      case "reports":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-400">{stat.details.diterima}</div>
                <div className="text-slate-300 text-sm">Diterima</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">{stat.details.peninjauan}</div>
                <div className="text-slate-300 text-sm">Dalam Peninjauan</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-400">{stat.details.ditindaklanjuti}</div>
                <div className="text-slate-300 text-sm">Ditindaklanjuti</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">{stat.details.selesai}</div>
                <div className="text-slate-300 text-sm">Selesai</div>
              </div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-amber-400">{stat.details.total}</div>
              <div className="text-slate-300 text-sm">Total Laporan Diterima</div>
            </div>
          </div>
        )

      case "infrastructure":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">{stat.details.trafficLights}</div>
                <div className="text-slate-300 text-sm">Lampu Lalu Lintas</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">{stat.details.signs}</div>
                <div className="text-slate-300 text-sm">Rambu Lalu Lintas</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-400">{stat.details.roads}</div>
                <div className="text-slate-300 text-sm">Perbaikan Jalan</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-400">{stat.details.lighting}</div>
                <div className="text-slate-300 text-sm">Penerangan Jalan</div>
              </div>
            </div>
          </div>
        )

      case "facilities":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-400">{stat.details.hospitals}</div>
                <div className="text-slate-300 text-sm">Rumah Sakit</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">{stat.details.schools}</div>
                <div className="text-slate-300 text-sm">Sekolah</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">{stat.details.markets}</div>
                <div className="text-slate-300 text-sm">Pasar</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-400">{stat.details.others}</div>
                <div className="text-slate-300 text-sm">Lainnya</div>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Detail tidak tersedia</div>
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <div className="relative -top-1">
                <LakonLogo size={36} />
              </div>
              <div>
                <span className="text-xl font-bold text-white">LAKON</span>
                <p className="text-xs text-slate-400 -mt-1">Laporan Kecelakaan Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/about">
                <Button className="text-slate-300 hover:text-amber-400 bg-transparent hover:bg-slate-700">
                  Tentang
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">Masuk</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-12 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0">
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
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 mt-1"
          >
            <LakonLogo size={140} className="mx-auto" />
          </motion.div>
          
          <div className="pt-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                LAKON
                <span className="block text-amber-400">Laporan Kecelakaan Online</span>
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Sistem Informasi Geospasial untuk Manajemen & Analisis Keselamatan Lalu Lintas Surakarta
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link href="/map">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-8 py-3 text-lg">
                Jelajahi Peta
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/report">
              <Button
                className="border-slate-600 text-white hover:bg-slate-800 px-8 py-3 text-lg bg-transparent"
              >
                Laporkan Masalah
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="cursor-pointer"
            onClick={scrollToStats}
          >
            <ChevronDown className="w-8 h-8 text-slate-400 mx-auto animate-bounce hover:text-amber-400 transition-colors" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="py-16 px-6 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Statistik Terkini</h2>
            <p className="text-slate-300">Data real-time kecelakaan dan infrastruktur lalu lintas</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`${stat.bgColor} ${stat.borderColor} border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-500/30 group`}
                  onClick={() => openModal(stat.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 rounded-lg bg-slate-700/50 ${stat.color} group-hover:scale-110 transition-transform`}
                      >
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1 group-hover:text-slate-300 transition-colors">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-white mb-2" suppressHydrationWarning>
                        {isClient ? (
                          stat.id === "accidents" && accidentsLoading ? (
                            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                          ) : stat.id === "blackspots" && blackspotsLoading ? (
                            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                          ) : stat.id === "reports" && reportsLoading ? (
                            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                          ) : stat.id === "infrastructure" && infrastructureLoading ? (
                            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                          ) : stat.id === "facilities" && facilitiesLoading ? (
                            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                          ) : (
                            stat.value
                          )
                        ) : (
                          "..."
                        )}
                      </p>
                      <p className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors">
                        Klik untuk detail lengkap
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Fitur Unggulan LAKON</h2>
            <p className="text-slate-300">Solusi komprehensif untuk manajemen keselamatan lalu lintas</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={feature.href}>
                  <Card
                    className={`${feature.bgColor} ${feature.borderColor} border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-500/30 group h-full`}
                  >
                    <CardContent className="p-6">
                      <div
                        className={`p-3 rounded-lg bg-slate-700/50 ${feature.color} group-hover:scale-110 transition-transform w-fit mb-4`}
                      >
                        <feature.icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-amber-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-slate-300 text-sm group-hover:text-slate-200 transition-colors">
                        {feature.description}
                      </p>
                      <div className="mt-4 flex items-center text-amber-400 group-hover:text-amber-300 transition-colors">
                        <span className="text-sm font-medium">Selengkapnya</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <LakonLogo size={36} />
                <div>
                  <span className="text-xl font-bold text-white">LAKON</span>
                  <p className="text-xs text-slate-400 -mt-1">Laporan Kecelakaan Online</p>
                </div>
              </div>
              <p className="text-slate-300 mb-4">
                Sistem Informasi Geospasial untuk Manajemen & Analisis Keselamatan Lalu Lintas Surakarta untuk menciptakan jalan yang lebih aman bagi
                semua.
              </p>
              <p className="text-slate-400 text-sm">© 2024 LAKON - Dinas Perhubungan Surakarta</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Fitur</h4>
              <ul className="space-y-2 text-slate-300">
                <li>
                  <Link href="/map" className="hover:text-amber-400 transition-colors">
                    Peta Interaktif
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="hover:text-amber-400 transition-colors">
                    Analisis Data
                  </Link>
                </li>
                <li>
                  <Link href="/report" className="hover:text-amber-400 transition-colors">
                    Laporan Masyarakat
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-amber-400 transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Kontak</h4>
              <ul className="space-y-2 text-slate-300">
                <li>Dinas Perhubungan Surakarta</li>
                <li>Jl. Jenderal Ahmad Yani No. 1</li>
                <li>Surakarta, Jawa Tengah</li>
                <li>Telp: (0271) 123456</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {stats.map((stat) => (
        <Modal key={stat.id} isOpen={selectedModal === stat.id} onClose={closeModal} title={`Detail ${stat.title}`}>
          <div className="mb-4">
            <p className="text-slate-300 text-sm leading-relaxed">{stat.description}</p>
          </div>
          {renderModalContent(stat)}
        </Modal>
      ))}
    </div>
  )
}
