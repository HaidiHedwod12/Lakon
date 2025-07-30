"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { LakonLogo } from "@/components/logo"
import AuthProvider from "@/components/AuthProvider"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, Users, Calendar, MapPin, Clock, Target } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

import {
  monthlyAccidentData,
  vehicleDistributionData,
  vehicleAccidentTrendData,
  recommendationData,
  getTopBlackspots,
} from "@/lib/dummy-data"
import { formatNumber } from "@/lib/utils"
import { useFirebase } from "@/hooks/useFirebase"

export default function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState("2024")
  const [monthFilter, setMonthFilter] = useState("all")
  const [selectedModal, setSelectedModal] = useState<string | null>(null)
  const [selectedBlackspot, setSelectedBlackspot] = useState<any>(null)
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  // Firebase hooks for real-time data
  const { data: firebaseAccidents } = useFirebase("accidents")
  const { data: firebaseBlackspots } = useFirebase("blackspots")
  const { data: firebaseReports } = useFirebase("reports")

  useEffect(() => {
    setIsClient(true)
  }, [])

  const monthlyData = monthlyAccidentData
  const vehicleData = vehicleDistributionData
  const blackspots = getTopBlackspots().map((spot: any, index: number) => ({ ...spot, severity: "Tinggi" })) // Make all blackspots "Tinggi"
  const recommendations = recommendationData.slice(0, 3)

  // Process accident data from Firebase to create vehicle trend data
  const processVehicleTrendData = (accidents: any[]) => {
    if (!accidents || accidents.length === 0) {
      return vehicleAccidentTrendData // fallback to dummy data
    }

    // Group accidents by month and vehicle type
    const monthlyGroups: { [key: string]: { [key: string]: number } } = {}
    
    accidents.forEach((accident) => {
      try {
        // Handle different date formats
        let date
        if (accident.tanggal.includes('/')) {
          // Format: DD/MM/YYYY
          const [day, month, year] = accident.tanggal.split('/')
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        } else {
          // Try standard date format
          date = new Date(accident.tanggal)
        }
        
        const month = date.toLocaleDateString('id-ID', { month: 'short' })
        const vehicle = accident.kendaraan || 'Lainnya'
        
        if (!monthlyGroups[month]) {
          monthlyGroups[month] = { mobil: 0, motor: 0, truk: 0, lainnya: 0 }
        }
        
        // Map vehicle types to our categories
        const vehicleLower = vehicle.toLowerCase()
        
        // Check for multiple vehicles in one record (e.g., "Mobil, Motor")
        const vehicles = vehicleLower.split(',').map((v: string) => v.trim())
        
        vehicles.forEach((singleVehicle: string) => {
          let vehicleCategory = 'lainnya'
          
          if (singleVehicle.includes('mobil') || singleVehicle.includes('car') || 
              singleVehicle.includes('sedan') || singleVehicle.includes('suv')) {
            vehicleCategory = 'mobil'
          } else if (singleVehicle.includes('motor') || singleVehicle.includes('motorcycle') || 
                     singleVehicle.includes('sepeda motor')) {
            vehicleCategory = 'motor'
          } else if (singleVehicle.includes('truk') || singleVehicle.includes('truck') || 
                     singleVehicle.includes('pickup')) {
            vehicleCategory = 'truk'
          } else {
            vehicleCategory = 'lainnya'
          }
          
          monthlyGroups[month][vehicleCategory]++
        })
        
      } catch (error) {
        console.error('Error processing accident data:', error, accident)
      }
    })

    // Convert to chart data format
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
    const result = months.map(month => ({
      month,
      mobil: monthlyGroups[month]?.mobil || 0,
      motor: monthlyGroups[month]?.motor || 0,
      truk: monthlyGroups[month]?.truk || 0,
      lainnya: monthlyGroups[month]?.lainnya || 0
    }))
    
    return result
  }

  // Process accident data to create severity distribution data
  const processSeverityDistributionData = (accidents: any[]) => {
    if (!accidents || accidents.length === 0) {
      return vehicleDistributionData // fallback to dummy data
    }

    const severityCounts = {
      fatal: 0,
      luka: 0,
      kerusakan: 0
    }

    accidents.forEach((accident) => {
      const severity = accident.jenis || 'Luka-luka'
      const severityLower = severity.toLowerCase()
      
      if (severityLower.includes('fatal') || severityLower === 'fatal') {
        severityCounts.fatal++
      } else if (severityLower.includes('luka') || severityLower === 'luka-luka') {
        severityCounts.luka++
      } else if (severityLower.includes('kerusakan') || severityLower === 'kerusakan') {
        severityCounts.kerusakan++
      } else {
        // Default to luka-luka if unknown
        severityCounts.luka++
      }
    })

    const total = severityCounts.fatal + severityCounts.luka + severityCounts.kerusakan

    // Only include categories that have data
    const result = []
    
    if (severityCounts.fatal > 0) {
      result.push({ 
        name: "Fatal", 
        value: severityCounts.fatal, 
        color: "#ef4444", 
        percentage: total > 0 ? Math.round((severityCounts.fatal / total) * 100) : 0 
      })
    }
    
    if (severityCounts.luka > 0) {
      result.push({ 
        name: "Luka-luka", 
        value: severityCounts.luka, 
        color: "#f59e0b", 
        percentage: total > 0 ? Math.round((severityCounts.luka / total) * 100) : 0 
      })
    }
    
    if (severityCounts.kerusakan > 0) {
      result.push({ 
        name: "Kerusakan", 
        value: severityCounts.kerusakan, 
        color: "#3b82f6", 
        percentage: total > 0 ? Math.round((severityCounts.kerusakan / total) * 100) : 0 
      })
    }

    return result
  }

  // Filter data based on month filter
  const filterDataByMonth = (data: any[], monthFilter: string) => {
    if (monthFilter === "all") return data
    
    const monthMap: { [key: string]: number } = {
      "jan": 0, "feb": 1, "mar": 2, "apr": 3, "mei": 4, "jun": 5,
      "jul": 6, "aug": 7, "sep": 8, "oct": 9, "nov": 10, "dec": 11
    }
    
    const targetMonth = monthMap[monthFilter.toLowerCase()]
    
    return data.filter((accident) => {
      try {
        let date
        if (accident.tanggal.includes('/')) {
          const [day, month, year] = accident.tanggal.split('/')
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        } else {
          date = new Date(accident.tanggal)
        }
        return date.getMonth() === targetMonth
      } catch (error) {
        return false
      }
    })
  }

  // Get processed vehicle trend data from Firebase
  const vehicleTrendDataFromFirebase = processVehicleTrendData(firebaseAccidents)

  // Filter accidents for pie chart based on month filter
  const filteredAccidents = filterDataByMonth(firebaseAccidents || [], monthFilter)
  const severityDistributionDataFromFirebase = processSeverityDistributionData(filteredAccidents)

  // Use Firebase data for line chart (vehicle trends)
  const chartData = vehicleTrendDataFromFirebase
  // Use filtered data for pie chart (severity distribution)
  const pieChartData = severityDistributionDataFromFirebase

  const stats = [
    {
      id: "accidents",
      title: "Total Kecelakaan",
      value: firebaseAccidents ? firebaseAccidents.length.toString() : "0",
      change: "",
      trend: "",
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      description: "Total kecelakaan yang tercatat dalam sistem LAKON",
      details: {
        fatal: firebaseAccidents ? firebaseAccidents.filter((acc: any) => acc.jenis === "Fatal").length : 0,
        injury: firebaseAccidents ? firebaseAccidents.filter((acc: any) => acc.jenis === "Luka-luka").length : 0,
        damage: firebaseAccidents ? firebaseAccidents.filter((acc: any) => acc.jenis === "Kerusakan").length : 0,
        thisMonth: monthlyData[monthlyData.length - 1].accidents,
        lastMonth: monthlyData[monthlyData.length - 2].accidents,
      },
    },
    {
      id: "blackspots",
      title: "Blackspot Aktif",
      value: firebaseBlackspots ? firebaseBlackspots.length.toString() : "0",
      change: "",
      trend: "",
      icon: MapPin,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      description: "Titik rawan kecelakaan yang memerlukan perhatian khusus",
      details: {
        high: firebaseBlackspots ? firebaseBlackspots.filter((spot: any) => spot.jenis === "Blackspot").length : 0,
        medium: firebaseBlackspots ? firebaseBlackspots.filter((spot: any) => spot.jenis === "Potential Blackspot").length : 0,
        low: 0,
        totalAccidents: firebaseBlackspots ? firebaseBlackspots.reduce((sum: number, b: any) => sum + (parseInt(b.totalKecelakaan) || 0), 0) : 0,
      },
    },
    {
      id: "reports",
      title: "Laporan Masyarakat",
      value: firebaseReports ? firebaseReports.length.toString() : "0",
      change: "",
      trend: "",
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      description: "Laporan masalah infrastruktur dari masyarakat",
      details: {
        pending: firebaseReports ? firebaseReports.filter((report: any) => report.status === "Diterima").length : 0,
        inProgress: firebaseReports ? firebaseReports.filter((report: any) => report.status === "Dalam Peninjauan").length : 0,
        completed: firebaseReports ? firebaseReports.filter((report: any) => report.status === "Selesai").length : 0,
        avgResponseTime: "2.3 hari",
      },
    },
  ]

  const openModal = (modalId: string) => {
    setSelectedModal(modalId)
  }

  const closeModal = () => {
    setSelectedModal(null)
    setSelectedBlackspot(null)
    setSelectedRecommendation(null)
  }

  const openBlackspotModal = (blackspot: any) => {
    setSelectedBlackspot(blackspot)
  }

  const openRecommendationModal = (recommendation: any) => {
    setSelectedRecommendation(recommendation)
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
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-400">{stat.details.high}</div>
                <div className="text-slate-300 text-sm">Tinggi</div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-400">{stat.details.medium}</div>
                <div className="text-slate-300 text-sm">Sedang</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-400">{stat.details.low}</div>
                <div className="text-slate-300 text-sm">Rendah</div>
              </div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-amber-400">{stat.details.totalAccidents}</div>
              <div className="text-slate-300 text-sm">Total Kecelakaan di Blackspot</div>
            </div>
            <div className="border-t border-slate-600 pt-4">
              <h4 className="text-white font-semibold mb-3">Top 5 Blackspot Terparah</h4>
              <div className="space-y-2">
                {blackspots.slice(0, 3).map((spot, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">{spot.location}</span>
                    <Badge className="bg-red-500">{spot.accidents} kecelakaan</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "reports":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-400">{stat.details.pending}</div>
                <div className="text-slate-300 text-sm">Pending</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">{stat.details.inProgress}</div>
                <div className="text-slate-300 text-sm">Diproses</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">{stat.details.completed}</div>
                <div className="text-slate-300 text-sm">Selesai</div>
              </div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-white">Waktu Respons Rata-rata</div>
                  <div className="text-slate-400 text-sm">Dari laporan masuk hingga ditindaklanjuti</div>
                </div>
                <div className="text-2xl font-bold text-amber-400">{stat.details.avgResponseTime}</div>
              </div>
            </div>
            <div className="border-t border-slate-600 pt-4">
              <h4 className="text-white font-semibold mb-3">Tingkat Penyelesaian</h4>
              <div className="w-full bg-slate-600 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full"
                  style={{ width: `${firebaseReports && firebaseReports.length > 0 ? (stat.details.completed / firebaseReports.length) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="text-right text-sm text-slate-400 mt-1">
                {firebaseReports && firebaseReports.length > 0 ? Math.round((stat.details.completed / firebaseReports.length) * 100) : 0}% selesai
              </div>
            </div>
          </div>
        )

      default:
        return <div>Detail tidak tersedia</div>
    }
  }

  const renderBlackspotModal = () => {
    if (!selectedBlackspot) return null

    return (
      <div className="space-y-6">
        <div className="bg-slate-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">{selectedBlackspot.location}</h3>
            <Badge className="bg-red-500">{selectedBlackspot.severity}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Total Kecelakaan:</span>
              <p className="text-white font-semibold">{selectedBlackspot.accidents}</p>
            </div>
            <div>
              <span className="text-slate-400">Kecelakaan Terakhir:</span>
              <p className="text-white font-semibold">{selectedBlackspot.lastAccident}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-700 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-2">Penyebab Utama</h4>
          <p className="text-slate-300">{selectedBlackspot.mainCause}</p>
        </div>

        <div className="bg-slate-700 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-3">Rekomendasi Tindakan</h4>
          <ul className="space-y-2">
            {selectedBlackspot.recommendations.map((rec: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-amber-400 mr-2">•</span>
                <span className="text-slate-300 text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  const renderRecommendationModal = () => {
    if (!selectedRecommendation) return null

    return (
      <div className="space-y-6">
        <div className="bg-slate-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">{selectedRecommendation.location}</h3>
            <Badge className={selectedRecommendation.priority === "Tinggi" ? "bg-red-500" : "bg-orange-500"}>
              {selectedRecommendation.priority}
            </Badge>
          </div>
          <p className="text-slate-300 mb-3">{selectedRecommendation.description}</p>
        </div>

        <div className="bg-slate-700 p-4 rounded-lg">
          <span className="text-slate-400 text-sm">Timeline:</span>
          <p className="text-blue-400 font-semibold text-lg">{selectedRecommendation.timeline}</p>
        </div>

        <div className="bg-slate-700 p-4 rounded-lg">
          <span className="text-slate-400 text-sm">Pengurangan Kecelakaan yang Diharapkan:</span>
          <p className="text-green-400 font-semibold text-2xl">{selectedRecommendation.expectedReduction}</p>
        </div>

        <div className="bg-slate-700 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-2">Tindakan yang Akan Dilakukan</h4>
          <p className="text-slate-300">{selectedRecommendation.action}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <AuthProvider>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard Analisis</h1>
            <p className="text-slate-300">Ringkasan data kecelakaan dan rekomendasi tindakan</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
              <Calendar className="w-4 h-4 mr-2" />
              Export Laporan
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((metric, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Card
                className={`${metric.bgColor} ${metric.borderColor} border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-500/30 group h-full`}
                onClick={() => openModal(metric.id)}
              >
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between flex-1">
                    <div className="flex-1">
                      <p className="text-slate-400 text-sm mb-1 group-hover:text-slate-300 transition-colors">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold text-white mb-2" suppressHydrationWarning>{metric.value}</p>
                      <div className="flex items-center">
                        {metric.trend === "up" ? (
                          <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                        )}
                        <span className={`text-sm ${metric.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`p-3 rounded-lg bg-slate-700/50 ${metric.color} group-hover:scale-110 transition-transform flex-shrink-0`}
                    >
                      <metric.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-600/50">
                    <p className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors">
                      Klik untuk detail lengkap
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trend */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-amber-400" />
                  Tren Kecelakaan Berdasarkan Kendaraan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#9ca3af" 
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="mobil" stroke="#3b82f6" strokeWidth={3} name="Mobil" />
                    <Line type="monotone" dataKey="motor" stroke="#f59e0b" strokeWidth={3} name="Motor" />
                    <Line type="monotone" dataKey="truk" stroke="#ef4444" strokeWidth={3} name="Truk" />
                    <Line type="monotone" dataKey="lainnya" stroke="#8b5cf6" strokeWidth={3} name="Lainnya" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Severity Distribution */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <Target className="w-5 h-5 mr-2 text-amber-400" />
                    Distribusi Tingkat Keparahan Kecelakaan
                  </CardTitle>
                  <Select value={monthFilter} onValueChange={setMonthFilter}>
                    <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white text-xs">
                      <SelectValue placeholder="Filter Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Bulan</SelectItem>
                      <SelectItem value="jan">Jan</SelectItem>
                      <SelectItem value="feb">Feb</SelectItem>
                      <SelectItem value="mar">Mar</SelectItem>
                      <SelectItem value="apr">Apr</SelectItem>
                      <SelectItem value="mei">Mei</SelectItem>
                      <SelectItem value="jun">Jun</SelectItem>
                      <SelectItem value="jul">Jul</SelectItem>
                      <SelectItem value="aug">Ags</SelectItem>
                      <SelectItem value="sep">Sep</SelectItem>
                      <SelectItem value="oct">Okt</SelectItem>
                      <SelectItem value="nov">Nov</SelectItem>
                      <SelectItem value="dec">Des</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-slate-400">
                    Tidak ada data untuk periode yang dipilih
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Blackspots and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Blackspots */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                  Top 5 Blackspot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {blackspots.map((spot, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer"
                      onClick={() => openBlackspotModal(spot)}
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{spot.location}</p>
                        <p className="text-slate-400 text-xs mt-1">{spot.accidents} kecelakaan</p>
                      </div>
                      <Badge className="bg-red-500">{spot.severity}</Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recommendations */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-400" />
                  Rekomendasi Tindakan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer"
                      onClick={() => openRecommendationModal(rec)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-white font-medium text-sm flex-1">{rec.location}</p>
                        <Badge className={rec.priority === "Tinggi" ? "bg-red-500" : "bg-orange-500"}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-slate-300 text-sm mb-2">{rec.action}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-slate-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {rec.timeline}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      {stats.map((stat) => (
        <Modal key={stat.id} isOpen={selectedModal === stat.id} onClose={closeModal} title={`Detail ${stat.title}`}>
          <div className="mb-4">
            <p className="text-slate-300 text-sm leading-relaxed">{stat.description}</p>
          </div>
          {renderModalContent(stat)}
        </Modal>
      ))}

      {/* Blackspot Detail Modal */}
      <Modal
        isOpen={selectedBlackspot !== null}
        onClose={closeModal}
        title={`Detail Blackspot: ${selectedBlackspot?.location || ""}`}
      >
        {renderBlackspotModal()}
      </Modal>

      {/* Recommendation Detail Modal */}
      <Modal
        isOpen={selectedRecommendation !== null}
        onClose={closeModal}
        title={`Detail Rekomendasi: ${selectedRecommendation?.location || ""}`}
      >
        {renderRecommendationModal()}
      </Modal>
      </AuthProvider>
    </div>
  )
}
