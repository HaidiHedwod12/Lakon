"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Modal } from "@/components/ui/modal"
import { LakonLogo } from "@/components/logo"
import AuthProvider from "@/components/AuthProvider"
import {
  Layers,
  Filter,
  Search,
  AlertTriangle,
  Car,
  BikeIcon as Motorcycle,
  Truck,
  Navigation,
  X,
  Building,
  MessageSquare,
  Construction,
  MapPin,
  Eye,
  EyeOff,
  Car as CarAccident,
  Wrench,
  Home,
  MessageCircle,
  Target,
  Circle,
  Square,
  Triangle,
  Star,
  Heart,
  Settings,
  Building2,
  MessageCircle as Report,
  AlertOctagon,
  Loader2,
  Map as MapIcon,
  Clock,
  Phone,
  Globe,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import MapComponent from "@/components/Map"

import { accidentData, infrastructureData, facilityData, communityReports, overallStats } from "@/lib/dummy-data"
import { useFirebase } from "@/hooks/useFirebase"

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic'

// Interface for search results
interface SearchResult {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  type: string
  rating?: number
  distance?: string
}

export default function MapPage() {
  const [selectedLayers, setSelectedLayers] = useState<Record<string, boolean>>({
    accidents: true,
    infrastructure: true,
    facilities: false,
    reports: true,
    blackspots: false,
  })

  const [selectedModal, setSelectedModal] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState([2024])
  
  // Filter states
  const [accidentTypeFilter, setAccidentTypeFilter] = useState("all")
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState(2024)
  
  // Search functionality states
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<SearchResult | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Firebase hooks
  const { data: firebaseAccidents } = useFirebase("accidents")
  const { data: firebaseBlackspots } = useFirebase("blackspots")

  // Filter accidents based on selected filters
  const getFilteredAccidents = () => {
    if (!firebaseAccidents || firebaseAccidents.length === 0) {
      return []
    }

    const filtered = firebaseAccidents.filter((accident: any) => {
      // Filter by accident type
      if (accidentTypeFilter !== "all") {
        const accidentType = accident.jenis?.toLowerCase() || ""
        if (accidentTypeFilter === "fatal" && !accidentType.includes("fatal")) {
          return false
        }
        if (accidentTypeFilter === "injury" && !accidentType.includes("luka")) {
          return false
        }
        if (accidentTypeFilter === "damage" && !accidentType.includes("kerusakan")) {
          return false
        }
      }

      // Filter by vehicle type
      if (vehicleTypeFilter !== "all") {
        const vehicleType = accident.kendaraan?.toLowerCase() || ""
        if (vehicleTypeFilter === "car" && !vehicleType.includes("mobil")) {
          return false
        }
        if (vehicleTypeFilter === "motorcycle" && !vehicleType.includes("motor")) {
          return false
        }
        if (vehicleTypeFilter === "truck" && !vehicleType.includes("truk")) {
          return false
        }
      }

      // Filter by year
      try {
        let date
        if (accident.tanggal.includes('/')) {
          // Format: DD/MM/YYYY
          const [day, month, year] = accident.tanggal.split('/')
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        } else {
          // Try standard date format
          date = new Date(accident.tanggal)
        }
        
        if (date.getFullYear() !== yearFilter) {
          return false
        }
      } catch (error) {
        // If date parsing fails, exclude the accident
        return false
      }

      return true
    })

    // Debug logging
    console.log('Filter settings:', { accidentTypeFilter, vehicleTypeFilter, yearFilter })
    console.log('Total accidents:', firebaseAccidents?.length || 0)
    console.log('Filtered accidents:', filtered.length)
    
    return filtered
  }

  const accidents = getFilteredAccidents()
  const infrastructure = infrastructureData
  const facilities = facilityData
  const reports = communityReports

  // Add effect to refresh map when filters change
  useEffect(() => {
    // Map will automatically refresh when accidents data changes
    // because the Map component receives new filteredAccidents prop
  }, [accidents])

  // Real geocoding search using OpenStreetMap Nominatim API
  const performGeocodingSearch = async (query: string): Promise<SearchResult[]> => {
    try {
      // First try with bounded search (Surakarta area)
      let response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=10&viewbox=110.7,-7.6,110.9,-7.5&bounded=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'LAKON-Map-Search/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Geocoding request failed')
      }

      let data = await response.json()
      
      // If no results in bounded area, try global search
      if (data.length === 0) {
        response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=10`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'LAKON-Map-Search/1.0'
            }
          }
        )
        
        if (response.ok) {
          data = await response.json()
        }
      }
      
      return data.map((item: any, index: number) => ({
        id: `${index + 1}`,
        name: item.display_name.split(',')[0] || item.display_name,
        address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: getPlaceType(item.type, item.class),
        rating: undefined, // OSM doesn't provide ratings
        distance: undefined
      }))
    } catch (error) {
      console.error('Geocoding error:', error)
      return []
    }
  }

  // Helper function to determine place type from OSM data
  const getPlaceType = (osmType: string, osmClass: string): string => {
    const typeMap: Record<string, string> = {
      'amenity': 'facility',
      'shop': 'shopping',
      'leisure': 'recreation',
      'tourism': 'tourism',
      'historic': 'landmark',
      'building': 'building',
      'highway': 'road',
      'place': 'area',
      'natural': 'natural',
      'landuse': 'area',
      'office': 'business',
      'craft': 'business',
      'industrial': 'industrial',
      'railway': 'transport',
      'aeroway': 'transport',
      'waterway': 'water',
      'power': 'infrastructure',
      'man_made': 'infrastructure',
      'boundary': 'administrative',
      'admin_level': 'administrative'
    }
    
    return typeMap[osmClass] || typeMap[osmType] || 'place'
  }

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim().length >= 2) {
        performSearch(value)
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 300)
  }

  // Perform search function using real geocoding API
  const performSearch = async (query: string) => {
    setIsSearching(true)
    setShowSearchResults(true)
    
    try {
      // Use real geocoding API
      const results = await performGeocodingSearch(query)
      setSearchResults(results)
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle location selection
  const handleLocationSelect = (location: SearchResult) => {
    setSelectedLocation(location)
    setSearchQuery(location.name)
    setShowSearchResults(false)
    
    // Navigate to location on map
    if (typeof window !== 'undefined') {
      const mapInstance = (window as any).mapInstance
      if (mapInstance) {
        mapInstance.setView([location.lat, location.lng], 16)
        
        // Add temporary marker using Leaflet
        const L = (window as any).L
        if (L) {
          const tempMarker = L.marker([location.lat, location.lng], {
            icon: L.divIcon({
              className: "custom-div-icon",
              html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })
          }).addTo(mapInstance)

          // Remove marker after 5 seconds
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              const currentMapInstance = (window as any).mapInstance
              if (currentMapInstance) {
                currentMapInstance.removeLayer(tempMarker)
              }
            }
          }, 5000)
        }
      }
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setShowSearchResults(false)
    setSelectedLocation(null)
  }

  // Get icon for location type
  const getLocationIcon = (type: string) => {
    switch (type) {
      case "facility":
        return "🏥"
      case "shopping":
        return "🛍️"
      case "recreation":
        return "🎮"
      case "tourism":
        return "🏛️"
      case "landmark":
        return "🏛️"
      case "building":
        return "🏢"
      case "road":
        return "🛣️"
      case "area":
        return "🗺️"
      case "natural":
        return "🌳"
      case "business":
        return "🏢"
      case "industrial":
        return "🏭"
      case "transport":
        return "🚉"
      case "water":
        return "💧"
      case "infrastructure":
        return "⚡"
      case "administrative":
        return "🏛️"
      case "place":
      default:
        return "📍"
    }
  }

  // Get location type label
  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case "facility":
        return "Fasilitas"
      case "shopping":
        return "Toko/Mall"
      case "recreation":
        return "Rekreasi"
      case "tourism":
        return "Wisata"
      case "landmark":
        return "Landmark"
      case "building":
        return "Gedung"
      case "road":
        return "Jalan"
      case "area":
        return "Area"
      case "natural":
        return "Alam"
      case "business":
        return "Bisnis"
      case "industrial":
        return "Industri"
      case "transport":
        return "Transportasi"
      case "water":
        return "Air"
      case "infrastructure":
        return "Infrastruktur"
      case "administrative":
        return "Administrasi"
      case "place":
      default:
        return "Tempat"
    }
  }

  const quickStats = [
    {
      id: "accidents",
      title: "Kecelakaan",
      value: accidents.length,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      icon: CarAccident,
      mapIcon: "🔴",
      description: `Total kecelakaan yang difilter (${accidentTypeFilter !== "all" ? accidentTypeFilter : "semua jenis"}, ${vehicleTypeFilter !== "all" ? vehicleTypeFilter : "semua kendaraan"}, tahun ${yearFilter})`,
      locations: accidents.slice(0, 5).map((accident: any) => ({
        name: accident.lokasi,
        jenis: accident.jenis,
        kendaraan: accident.kendaraan,
        tanggal: accident.tanggal,
        lat: accident.lat,
        lng: accident.long,
      })),
    },
    {
      id: "blackspots",
      title: "Blackspot",
      value: firebaseBlackspots?.length || 0,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      icon: AlertTriangle,
      mapIcon: "🔴",
      description: "Titik rawan kecelakaan yang memerlukan perhatian khusus",
      locations: firebaseBlackspots?.slice(0, 5).map((blackspot: any) => ({
        name: blackspot.lokasi,
        jenis: blackspot.jenis,
        lat: blackspot.lat,
        lng: blackspot.long,
      })) || [],
    },
    {
      id: "reports",
      title: "Laporan",
      value: overallStats.totalReports,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      icon: MessageSquare,
      mapIcon: "📍",
      description: "Laporan masalah infrastruktur dari masyarakat",
      locations: reports.slice(0, 5).map((report) => ({
        name: report.location,
        type: report.category,
        status: report.status,
        lat: report.lat,
        lng: report.lng,
      })),
    },
  ]

  const layerConfigs = [
    {
      key: "accidents",
      label: "Data Kecelakaan",
      color: "bg-red-500",
      icon: CarAccident,
      legends: [
        { icon: "🔴", label: "Kecelakaan Fatal", color: "bg-red-500" },
        { icon: "🟠", label: "Luka-luka", color: "bg-orange-500" },
        { icon: "🟡", label: "Kerusakan", color: "bg-yellow-500" },
      ],
    },
    {
      key: "infrastructure",
      label: "Infrastruktur",
      color: "bg-blue-500",
      icon: Settings,
      legends: [
        { icon: "🚦", label: "Lampu Lalu Lintas", color: "bg-blue-500" },
        { icon: "🚧", label: "Rambu Lalu Lintas", color: "bg-blue-600" },
        { icon: "📹", label: "CCTV", color: "bg-blue-400" },
        { icon: "🌉", label: "Jembatan", color: "bg-blue-700" },
      ],
    },
    {
      key: "facilities",
      label: "Fasilitas Umum",
      color: "bg-green-500",
      icon: Building2,
      legends: [
        { icon: "🏥", label: "Rumah Sakit", color: "bg-green-500" },
        { icon: "👮", label: "Kantor Polisi", color: "bg-green-600" },
        { icon: "🚒", label: "Pemadam Kebakaran", color: "bg-green-400" },
        { icon: "🏫", label: "Sekolah", color: "bg-green-700" },
        { icon: "⛽", label: "SPBU", color: "bg-green-300" },
      ],
    },
    {
      key: "reports",
      label: "Laporan Masyarakat",
      color: "bg-amber-500",
      icon: Report,
      legends: [
        { icon: "📍", label: "Laporan Pending", color: "bg-amber-500" },
        { icon: "🔄", label: "Sedang Diproses", color: "bg-blue-500" },
        { icon: "✅", label: "Selesai", color: "bg-green-500" },
      ],
    },
    {
      key: "blackspots",
      label: "Blackspot",
      color: "bg-red-600",
      icon: AlertOctagon,
      legends: [{ icon: "🔴", label: "Blackspot Aktif", color: "bg-red-600" }],
    },
  ]

  const openModal = (modalId: string) => {
    setSelectedModal(modalId)
  }

  const closeModal = () => {
    setSelectedModal(null)
  }

  const toggleLayer = (layerKey: string) => {
    setSelectedLayers((prev) => {
      const newLayers = { ...prev, [layerKey]: !prev[layerKey] }
      return newLayers
    })
  }

  const getVisibleLegends = () => {
    return layerConfigs.filter((config) => selectedLayers[config.key])
  }

  const renderModalContent = (stat: any) => {
    switch (stat.id) {
      case "blackspots":
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-red-400 mb-2">{stat.value}</div>
              <div className="text-slate-300">Total Blackspot Aktif</div>
            </div>
            <div className="space-y-3">
              {stat.locations.map((location: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{location.name}</p>
                    <p className="text-slate-400 text-xs">Jenis: {location.jenis}</p>
                  </div>
                  <Badge className="bg-red-500">Blackspot</Badge>
                </div>
              ))}
            </div>
          </div>
        )

      case "reports":
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-amber-400 mb-2">{stat.value}</div>
              <div className="text-slate-300">Total Laporan Masyarakat</div>
            </div>
            <div className="space-y-3">
              {stat.locations.map((location: any, index: number) => (
                <div key={index} className="p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-medium text-sm">{location.name}</p>
                    <Badge
                      className={
                        location.status === "completed"
                          ? "bg-green-500"
                          : location.status === "in_progress"
                            ? "bg-blue-500"
                            : "bg-orange-500"
                      }
                    >
                      {location.status}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-xs">{('type' in location ? location.type : 'Tidak diketahui')}</p>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return <div>Detail tidak tersedia</div>
    }
  }

  // Add global click listener to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.search-container')) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-900">
      <AuthProvider>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar Controls */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Enhanced Search */}
            <div className="search-container">
              <h3 className="text-lg font-semibold text-white mb-3">Pencarian Lokasi</h3>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Cari tempat, alamat, landmark..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute z-50 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400 mb-2" />
                      <p className="text-slate-400 text-sm">Mencari lokasi...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleLocationSelect(result)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-600 transition-colors border-b border-slate-600 last:border-b-0"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="text-lg">{getLocationIcon(result.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="text-white font-medium text-sm truncate">
                                  {result.name}
                                </h4>
                                {result.rating && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    <span className="text-xs text-slate-300">{result.rating}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-slate-400 text-xs mb-1">{result.address}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 bg-slate-600 px-2 py-1 rounded">
                                  {getLocationTypeLabel(result.type)}
                                </span>
                                {result.distance && (
                                  <span className="text-xs text-slate-400">{result.distance}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.trim().length >= 2 ? (
                    <div className="p-4 text-center">
                      <MapPin className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">Tidak ada hasil ditemukan</p>
                      <p className="text-slate-500 text-xs mt-1">Coba kata kunci lain</p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Selected Location Info */}
              {selectedLocation && (
                <div className="mt-3 p-3 bg-slate-700 rounded-lg border border-slate-600">
                  <div className="flex items-start space-x-3">
                    <div className="text-lg">{getLocationIcon(selectedLocation.type)}</div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm mb-1">{selectedLocation.name}</h4>
                      <p className="text-slate-400 text-xs mb-2">{selectedLocation.address}</p>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-500 text-xs">
                          {getLocationTypeLabel(selectedLocation.type)}
                        </Badge>
                        {selectedLocation.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-slate-300">{selectedLocation.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedLocation(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Layer Controls */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Layers className="w-5 h-5 mr-2" />
                Layer Peta
              </h3>
              <div className="space-y-3">
                {layerConfigs.map((layer) => (
                  <div key={layer.key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${layer.color} border ${layer.color}`}>
                        <layer.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-slate-300 font-medium">{layer.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={selectedLayers[layer.key]} onCheckedChange={() => toggleLayer(layer.key)} />
                      <Button className="p-1 h-6 w-6 bg-transparent hover:bg-slate-700" onClick={() => toggleLayer(layer.key)}>
                        {selectedLayers[layer.key] ? (
                          <Eye className="w-3 h-3 text-green-400" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-slate-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter Data
                </h3>
                {(accidentTypeFilter !== "all" || vehicleTypeFilter !== "all" || yearFilter !== 2024) && (
                  <Badge className="bg-blue-600 text-white text-xs">
                    Filter Aktif
                  </Badge>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Jenis Kecelakaan</label>
                  <Select value={accidentTypeFilter} onValueChange={setAccidentTypeFilter}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Semua jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jenis</SelectItem>
                      <SelectItem value="fatal">Fatal</SelectItem>
                      <SelectItem value="injury">Luka-luka</SelectItem>
                      <SelectItem value="damage">Kerusakan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Jenis Kendaraan</label>
                  <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Semua kendaraan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kendaraan</SelectItem>
                      <SelectItem value="car">Mobil</SelectItem>
                      <SelectItem value="motorcycle">Motor</SelectItem>
                      <SelectItem value="truck">Truk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Tahun</label>
                  <div className="px-2">
                    <Slider
                      value={[yearFilter]}
                      onValueChange={(value) => setYearFilter(value[0])}
                      max={2024}
                      min={2020}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>2020</span>
                      <span>2024</span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-sm font-medium text-white bg-blue-600 px-3 py-1 rounded-full">
                        {yearFilter}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Reset Filter Button */}
                <div className="mt-4">
                  <Button 
                    onClick={() => {
                      setAccidentTypeFilter("all")
                      setVehicleTypeFilter("all")
                      setYearFilter(2024)
                    }}
                    variant="outline"
                    className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    Reset Filter
                  </Button>
                </div>
                
                {/* Filter Summary */}
                <div className="mt-4 p-3 bg-slate-700 rounded-lg">
                  <div className="text-xs text-slate-300 mb-2">Filter Aktif:</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Jenis:</span>
                      <span className="text-white">
                        {accidentTypeFilter === "all" ? "Semua" : 
                         accidentTypeFilter === "fatal" ? "Fatal" :
                         accidentTypeFilter === "injury" ? "Luka-luka" : "Kerusakan"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kendaraan:</span>
                      <span className="text-white">
                        {vehicleTypeFilter === "all" ? "Semua" :
                         vehicleTypeFilter === "car" ? "Mobil" :
                         vehicleTypeFilter === "motorcycle" ? "Motor" : "Truk"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tahun:</span>
                      <span className="text-white">{yearFilter}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-600 pt-1 mt-1">
                      <span className="text-slate-400">Hasil:</span>
                      <span className="text-green-400 font-medium">{accidents.length} data</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Statistik Cepat</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickStats.map((stat, index) => (
                  <motion.div
                    key={stat.id}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      openModal(stat.id)
                      if (stat.id === "blackspots") {
                        setSelectedLayers((prev) => ({ ...prev, blackspots: true }))
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <Card
                      className={`${stat.bgColor} ${stat.borderColor} border-2 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 group`}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="flex justify-center mb-2">
                          <stat.icon className={`w-5 h-5 ${stat.color} group-hover:scale-110 transition-transform`} />
                        </div>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-slate-300 group-hover:text-slate-200 transition-colors">
                          {stat.title}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <MapComponent 
            selectedLayers={selectedLayers}
            filteredAccidents={accidents}
            onLocationSelect={(lat: number, lng: number) => {
              console.log("Location selected:", lat, lng)
            }}
            onMapReady={(mapInstance: any) => {
              // Store map instance globally for search functionality
              ;(window as any).mapInstance = mapInstance
            }}
          />
        </div>
      </div>

      {/* Modals */}
      {quickStats.map((stat) => (
        <Modal key={stat.id} isOpen={selectedModal === stat.id} onClose={closeModal} title={`Detail ${stat.title}`}>
          <div className="mb-4">
            <p className="text-slate-300 text-sm leading-relaxed">{stat.description}</p>
          </div>
          {renderModalContent(stat)}
        </Modal>
      ))}
      </AuthProvider>
    </div>
  )
}
