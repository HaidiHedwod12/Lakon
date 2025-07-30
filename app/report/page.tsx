"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { LakonLogo } from "@/components/logo"
import AuthProvider from "@/components/AuthProvider"
import { Send, CheckCircle, Clock, Upload, X, MapPin, User, Calendar } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Map from "@/components/Map"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/toaster"

import { overallStats, getRecentReports } from "@/lib/dummy-data"

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic'

export default function ReportPage() {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [reportCategory, setReportCategory] = useState("")
  const [description, setDescription] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [selectedStat, setSelectedStat] = useState<string | null>(null)
  const [selectedLayers, setSelectedLayers] = useState({
    accidents: false,
    infrastructure: false,
    facilities: false,
    reports: false,
    blackspots: false,
    roads: false,
    boundaries: false
  })
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const mapInstanceRef = React.useRef<any>(null)
  const [isNavigatingToLocation, setIsNavigatingToLocation] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)

  const categories = [
    { value: "rambu-rusak", label: "Rambu Rusak/Hilang", icon: "🚧" },
    { value: "marka-buram", label: "Marka Jalan Buram", icon: "🛣️" },
    { value: "lampu-mati", label: "Lampu Lalu Lintas Mati", icon: "🚦" },
    { value: "penerangan-kurang", label: "Penerangan Kurang", icon: "💡" },
    { value: "jalan-rusak", label: "Jalan Rusak/Berlubang", icon: "🕳️" },
    { value: "potensi-kecelakaan", label: "Potensi Kecelakaan", icon: "⚠️" },
    { value: "parkir-liar", label: "Parkir Liar", icon: "🚗" },
  ]

  const recentReports = getRecentReports(3)

  // Handle location selection from map
  const handleLocationSelect = (lat: number, lng: number) => {
    if (lat === 0 && lng === 0) {
      // Reset coordinates
      setSelectedLocation(null)
      setMapCoordinates(null)
    } else {
      setSelectedLocation({ lat, lng })
      setMapCoordinates({ lat, lng })
    }
  }

  // Check for coordinates from localStorage (from map context menu)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLocation = localStorage.getItem('reportLocation')
      if (storedLocation) {
        try {
          const location = JSON.parse(storedLocation)
          setSelectedLocation(location)
          setMapCoordinates(location)
          // Clear localStorage after reading
          localStorage.removeItem('reportLocation')
          // Show success message
          toast.success("Lokasi telah diisi otomatis dari peta! Peta akan menuju ke lokasi tersebut.")
        } catch (error) {
          console.error('Error parsing stored location:', error)
          localStorage.removeItem('reportLocation')
        }
      }
    }
  }, [])

  // Handle map initialization with stored location
  const handleMapReady = (mapInstance: any) => {
    console.log('Map is ready:', mapInstance)
    // Store map instance for later use
    mapInstanceRef.current = mapInstance
    setIsMapReady(true)
    
    if (selectedLocation) {
      // Center map to selected location
      mapInstance.setView([selectedLocation.lat, selectedLocation.lng], 16)
    }
  }

  // Effect to center map when selectedLocation changes
  React.useEffect(() => {
    if (selectedLocation && mapInstanceRef.current) {
      setIsNavigatingToLocation(true)
      // Small delay to ensure map is ready
      setTimeout(() => {
        mapInstanceRef.current.setView([selectedLocation.lat, selectedLocation.lng], 16)
        setIsNavigatingToLocation(false)
      }, 100)
    }
  }, [selectedLocation])

  // Copy Google Maps URL to clipboard
  const copyGoogleMapsUrl = (lat: number, lng: number) => {
    if (typeof window !== 'undefined') {
      const url = `https://maps.google.com/?q=${lat},${lng}`
      navigator.clipboard.writeText(url).then(() => {
        toast.success("URL Google Maps telah disalin ke clipboard!")
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        toast.success("URL Google Maps telah disalin ke clipboard!")
      })
    }
  }

  const statsData = [
    {
      id: "total",
      title: "Total Laporan",
      value: overallStats.totalReports,
      color: "text-blue-400",
      description: "Total laporan yang telah diterima sistem",
      details: {
        thisMonth: 28,
        lastMonth: 22,
        growth: "+27%",
        categories: [
          { name: "Rambu Rusak", count: 45 },
          { name: "Jalan Rusak", count: 38 },
          { name: "Lampu Mati", count: 32 },
          { name: "Marka Buram", count: 28 },
        ],
      },
    },
    {
      id: "completed",
      title: "Selesai Ditangani",
      value: overallStats.completedReports,
      color: "text-green-400",
      description: "Laporan yang telah diselesaikan dengan baik",
      details: {
        completionRate: Math.round((overallStats.completedReports / overallStats.totalReports) * 100),
        avgTime: "3.2 hari",
        satisfaction: "94%",
        recentCompleted: [
          { location: "Jl. Slamet Riyadi", type: "Rambu Rusak", date: "2024-01-20" },
          { location: "Jl. Ahmad Yani", type: "Lampu Mati", date: "2024-01-19" },
          { location: "Jl. Veteran", type: "Marka Buram", date: "2024-01-18" },
        ],
      },
    },
    {
      id: "inProgress",
      title: "Sedang Diproses",
      value: overallStats.inProgressReports,
      color: "text-blue-400",
      description: "Laporan yang sedang dalam tahap penanganan",
      details: {
        avgProcessTime: "1.8 hari",
        priority: {
          high: 12,
          medium: 23,
          low: 10,
        },
        teams: [
          { name: "Tim Infrastruktur", reports: 18 },
          { name: "Tim Rambu", reports: 15 },
          { name: "Tim Marka", reports: 12 },
        ],
      },
    },
    {
      id: "pending",
      title: "Menunggu Tinjauan",
      value: overallStats.pendingReports,
      color: "text-orange-400",
      description: "Laporan baru yang menunggu verifikasi",
      details: {
        avgWaitTime: "0.5 hari",
        todayReceived: 8,
        needsVerification: 15,
        autoAssigned: 7,
        recentPending: [
          { location: "Jl. Dr. Moewardi", type: "Jalan Rusak", reporter: "Ahmad S.", time: "2 jam lalu" },
          { location: "Jl. Gatot Subroto", type: "Penerangan", reporter: "Siti M.", time: "4 jam lalu" },
          { location: "Jl. Kapten Mulyadi", type: "Parkir Liar", reporter: "Budi P.", time: "6 jam lalu" },
        ],
      },
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedLocation) {
      // Remove alert, just return without showing notification
      return
    }
    
    if (!reportCategory) {
      // Remove alert, just return without showing notification
      return
    }
    
    if (!description.trim()) {
      // Remove alert, just return without showing notification
      return
    }
    
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    
    // Reset form
    setSelectedLocation(null)
    setReportCategory("")
    setDescription("")
    setUploadedFiles([])
    
    // Remove success alert
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const openReportModal = (report: any) => {
    setSelectedReport(report)
  }

  const openStatModal = (statId: string) => {
    setSelectedStat(statId)
  }

  const closeModal = () => {
    setSelectedReport(null)
    setSelectedStat(null)
  }

  const renderReportModal = () => {
    if (!selectedReport) return null

    return (
      <div className="space-y-6">
        <div className="bg-slate-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">{selectedReport.category}</h3>
            <Badge
              className={
                selectedReport.status === "completed"
                  ? "bg-green-500"
                  : selectedReport.status === "in_progress"
                    ? "bg-blue-500"
                    : selectedReport.status === "reviewed"
                      ? "bg-purple-500"
                      : "bg-orange-500"
              }
            >
              {selectedReport.status === "completed"
                ? "Selesai"
                : selectedReport.status === "in_progress"
                  ? "Diproses"
                  : selectedReport.status === "reviewed"
                    ? "Ditinjau"
                    : "Pending"}
            </Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-slate-400 mr-2" />
              <span className="text-slate-300">{selectedReport.location}</span>
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 text-slate-400 mr-2" />
              <span className="text-slate-300">Dilaporkan oleh: {selectedReport.reporter}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-slate-400 mr-2" />
              <span className="text-slate-300">{selectedReport.date}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-700 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-2">Deskripsi Masalah</h4>
          <p className="text-slate-300 text-sm">{selectedReport.description}</p>
        </div>

        {selectedReport.priority && (
          <div className="bg-slate-700 p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-2">Prioritas</h4>
            <Badge
              className={
                selectedReport.priority === "high"
                  ? "bg-red-500"
                  : selectedReport.priority === "medium"
                    ? "bg-orange-500"
                    : "bg-yellow-500"
              }
            >
              {selectedReport.priority === "high"
                ? "Tinggi"
                : selectedReport.priority === "medium"
                  ? "Sedang"
                  : "Rendah"}
            </Badge>
          </div>
        )}

        {selectedReport.estimatedCost && (
          <div className="bg-slate-700 p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-2">Estimasi Biaya</h4>
            <p className="text-amber-400 font-semibold">{selectedReport.estimatedCost}</p>
          </div>
        )}
      </div>
    )
  }

  const renderStatModal = () => {
    const stat = statsData.find((s) => s.id === selectedStat)
    if (!stat) return null

    switch (stat.id) {
      case "total":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{stat.value}</div>
              <div className="text-slate-300">Total Laporan Diterima</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-xl font-bold text-green-400">{stat.details.thisMonth}</div>
                <div className="text-slate-300 text-sm">Bulan Ini</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-xl font-bold text-slate-300">{stat.details.lastMonth}</div>
                <div className="text-slate-300 text-sm">Bulan Lalu</div>
              </div>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-3">Kategori Laporan Terbanyak</h4>
              <div className="space-y-2">
                {stat.details.categories?.map((cat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-slate-300">{cat.name}</span>
                    <span className="text-white font-semibold">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "completed":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{stat.value}</div>
              <div className="text-slate-300">Laporan Selesai</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-700 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-green-400">{stat.details.completionRate}%</div>
                <div className="text-slate-300 text-xs">Tingkat Selesai</div>
              </div>
              <div className="bg-slate-700 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-400">{stat.details.avgTime}</div>
                <div className="text-slate-300 text-xs">Rata-rata Waktu</div>
              </div>
              <div className="bg-slate-700 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-amber-400">{stat.details.satisfaction}</div>
                <div className="text-slate-300 text-xs">Kepuasan</div>
              </div>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-3">Selesai Terbaru</h4>
              <div className="space-y-2">
                {stat.details.recentCompleted?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-white">{item.location}</span>
                      <span className="text-slate-400 ml-2">({item.type})</span>
                    </div>
                    <span className="text-slate-400">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "inProgress":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{stat.value}</div>
              <div className="text-slate-300">Sedang Diproses</div>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-3">Distribusi Prioritas</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-400">{stat.details.priority?.high}</div>
                  <div className="text-slate-300 text-sm">Tinggi</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-400">{stat.details.priority?.medium}</div>
                  <div className="text-slate-300 text-sm">Sedang</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">{stat.details.priority?.low}</div>
                  <div className="text-slate-300 text-sm">Rendah</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-3">Tim Penanganan</h4>
              <div className="space-y-2">
                {stat.details.teams?.map((team, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-slate-300">{team.name}</span>
                    <span className="text-white font-semibold">{team.reports} laporan</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "pending":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">{stat.value}</div>
              <div className="text-slate-300">Menunggu Tinjauan</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-700 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-green-400">{stat.details.todayReceived}</div>
                <div className="text-slate-300 text-xs">Hari Ini</div>
              </div>
              <div className="bg-slate-700 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-orange-400">{stat.details.needsVerification}</div>
                <div className="text-slate-300 text-xs">Perlu Verifikasi</div>
              </div>
              <div className="bg-slate-700 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-400">{stat.details.autoAssigned}</div>
                <div className="text-slate-300 text-xs">Auto Assigned</div>
              </div>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-3">Laporan Terbaru</h4>
              <div className="space-y-3">
                {stat.details.recentPending?.map((item, index) => (
                  <div key={index} className="border-l-2 border-orange-400 pl-3">
                    <div className="text-white font-medium text-sm">{item.location}</div>
                    <div className="text-slate-400 text-xs">
                      {item.type} • {item.reporter} • {item.time}
                    </div>
                  </div>
                ))}
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
      <AuthProvider>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Lapor Masalah Lalu Lintas</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Laporkan masalah infrastruktur lalu lintas di sekitar Anda untuk membantu menciptakan jalan yang lebih aman
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Report Form */}
          <div className="lg:col-span-2 relative z-20">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Send className="w-5 h-5 mr-2 text-amber-400" />
                  Buat Laporan Baru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Location Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Lokasi Masalah
                      {selectedLocation && (
                        <span className="ml-2 text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                          Dari Peta
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="Klik pada peta atau ketik alamat..."
                        className={`bg-slate-700 border-slate-600 text-white pr-10 ${
                          selectedLocation ? 'border-amber-400/50' : ''
                        }`}
                        value={selectedLocation ? `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}` : ""}
                        readOnly
                      />
                      {selectedLocation ? (
                        <button
                          onClick={() => setSelectedLocation(null)}
                          className="absolute right-3 top-3 w-4 h-4 text-red-400 hover:text-red-300 transition-colors"
                          title="Hapus lokasi"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      ) : (
                        <MapPin className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    {/* Interactive Map for Location Selection */}
                    <div className="mt-3 h-64 bg-slate-700 rounded-lg relative overflow-hidden z-10">
                      <div style={{ width: '100%', height: '256px', position: 'relative' }}>
                        <Map 
                          selectedLayers={selectedLayers} 
                          onLocationSelect={handleLocationSelect}
                          isCompact={true}
                          onMapReady={handleMapReady}
                        />
                      </div>
                      
                      {/* Loading indicator when navigating to location */}
                      {isNavigatingToLocation && (
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs z-10">
                          Menuju ke lokasi...
                        </div>
                      )}

                      {/* Map Coordinates Display */}
                      {mapCoordinates && (
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs p-2 rounded max-w-[280px] z-20">
                          <div className="font-medium mb-1">Lokasi Peta:</div>
                          <div className="mb-1">Koordinat: {mapCoordinates.lat.toFixed(6)}, {mapCoordinates.lng.toFixed(6)}</div>
                          <div className="mb-1 flex items-center justify-between">
                            <span>URL: https://maps.google.com/?q={mapCoordinates.lat},{mapCoordinates.lng}</span>
                            <button
                              onClick={() => copyGoogleMapsUrl(mapCoordinates.lat, mapCoordinates.lng)}
                              className="ml-2 text-blue-300 hover:text-blue-200 text-xs"
                              title="Copy URL"
                            >
                              📋
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              setMapCoordinates(null)
                              setSelectedLocation(null)
                            }}
                            className="text-red-300 hover:text-red-200 text-xs"
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                      
                      {/* Quick Layer Toggle for Report Context */}
                      <div className="absolute top-2 right-2 bg-black/70 rounded p-2 z-20">
                        <div className="text-xs text-white mb-1">Layer:</div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => setSelectedLayers(prev => ({ ...prev, infrastructure: !prev.infrastructure }))}
                            className={`text-xs px-2 py-1 rounded ${selectedLayers.infrastructure ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'}`}
                          >
                            Infrastruktur
                          </button>
                          <button
                            onClick={() => setSelectedLayers(prev => ({ ...prev, facilities: !prev.facilities }))}
                            className={`text-xs px-2 py-1 rounded ${selectedLayers.facilities ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'}`}
                          >
                            Fasilitas
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="relative z-30">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Kategori Masalah</label>
                    <Select value={reportCategory} onValueChange={setReportCategory}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Pilih kategori masalah" />
                      </SelectTrigger>
                      <SelectContent 
                        className="z-50" 
                        position="popper" 
                        side="bottom" 
                        align="start"
                        sideOffset={4}
                      >
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center">
                              <span className="mr-2">{category.icon}</span>
                              {category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="relative z-30">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Deskripsi Masalah</label>
                    <Textarea
                      placeholder="Jelaskan masalah yang Anda temukan secara detail..."
                      className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/* File Upload */}
                  <div className="relative z-30">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Upload Foto (Opsional)
                    </label>
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-300">Klik untuk upload atau drag & drop</p>
                        <p className="text-slate-500 text-sm mt-1">PNG, JPG, MP4 hingga 10MB</p>
                      </label>
                    </div>

                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-slate-700 p-2 rounded">
                            <span className="text-slate-300 text-sm">{file.name}</span>
                            <Button
                              onClick={() => removeFile(index)}
                              className="text-slate-400 hover:text-red-400 bg-transparent hover:bg-slate-600 p-1"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="relative z-30">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Mengirim Laporan...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Send className="w-4 h-4 mr-2" />
                          Kirim Laporan
                        </div>
                      )}
                    </Button>
                  </div>

                  {/* Validation Messages */}
                  <div className="relative z-30 space-y-2">
                    {!selectedLocation && (
                      <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded p-2">
                        ⚠️ Pilih lokasi masalah terlebih dahulu
                      </div>
                    )}
                    {!reportCategory && (
                      <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded p-2">
                        ⚠️ Pilih kategori masalah
                      </div>
                    )}
                    {!description.trim() && (
                      <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded p-2">
                        ⚠️ Isi deskripsi masalah
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-400" />
                  Laporan Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <motion.div
                      key={report.id}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer"
                      onClick={() => openReportModal(report)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium text-sm">{report.category}</h4>
                        <Badge
                          className={
                            report.status === "completed"
                              ? "bg-green-500"
                              : report.status === "in_progress"
                                ? "bg-blue-500"
                                : report.status === "reviewed"
                                  ? "bg-purple-500"
                                  : "bg-orange-500"
                          }
                        >
                          {report.status === "completed"
                            ? "Selesai"
                            : report.status === "in_progress"
                              ? "Diproses"
                              : report.status === "reviewed"
                                ? "Ditinjau"
                                : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-slate-300 text-sm mb-2">{report.location}</p>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{report.date}</span>
                        <span>oleh {report.reporter}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-slate-800 border-slate-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                  Statistik Laporan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statsData.map((stat) => (
                    <motion.div
                      key={stat.id}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex justify-between items-center hover:bg-slate-700 p-2 rounded transition-colors cursor-pointer"
                      onClick={() => openStatModal(stat.id)}
                    >
                      <span className="text-slate-300">{stat.title}</span>
                      <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      <Modal
        isOpen={selectedReport !== null}
        onClose={closeModal}
        title={`Detail Laporan: ${selectedReport?.category || ""}`}
      >
        {renderReportModal()}
      </Modal>

      {/* Stats Detail Modal */}
      <Modal
        isOpen={selectedStat !== null}
        onClose={closeModal}
        title={`Detail ${statsData.find((s) => s.id === selectedStat)?.title || ""}`}
      >
        {renderStatModal()}
      </Modal>
      <Toaster />
      </AuthProvider>
    </div>
  )
}
