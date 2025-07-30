"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  MapPin, 
  AlertTriangle, 
  Building, 
  Settings, 
  MessageCircle,
  Plus,
  X,
  Info,
  Car as CarAccident,
  Building2,
  AlertOctagon,
  FileText as Report,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { useFirebase } from "@/hooks/useFirebase"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/toaster"

// Fix Leaflet default icon issue - only run on client side
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  })
}

interface MapProps {
  selectedLayers: Record<string, boolean>
  onLocationSelect?: (lat: number, lng: number) => void
  isCompact?: boolean
  onMapReady?: (mapInstance: any) => void
  filteredAccidents?: any[]
}

interface MapData {
  accidents: any[]
  infrastructure: any[]
  facilities: any[]
  reports: any[]
  blackspots: any[]
  roads: any[]
  boundaries: any[]
}

// Export the Map component as client-only
const MapComponent = ({ selectedLayers, onLocationSelect, isCompact = false, onMapReady, filteredAccidents }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layersRef = useRef<Record<string, L.LayerGroup>>({})
  const currentTileLayerRef = useRef<L.TileLayer | null>(null)

  const [selectedBaseMap, setSelectedBaseMap] = useState("osm")
  const [coordinates, setCoordinates] = useState("")
  const [isCoordInputVisible, setIsCoordInputVisible] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(13)
  const [isBaseMapMinimized, setIsBaseMapMinimized] = useState(false)
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    lat: number
    lng: number
  } | null>(null)

  // Firebase hooks for all data types
  const { data: firebaseAccidents } = useFirebase("accidents")
  const { data: firebaseInfrastructure } = useFirebase("infrastructure")
  const { data: firebaseFacilities } = useFirebase("facilities")
  const { data: firebaseReports } = useFirebase("reports")
  const { data: firebaseBlackspots } = useFirebase("blackspots")

  // Function to clear selected coordinates
  const clearSelectedCoordinates = () => {
    setSelectedCoordinates(null)
    if (onLocationSelect) {
      onLocationSelect(0, 0) // Reset to default coordinates
    }
  }

  // Base map options with high zoom support (up to 22)
  const baseMaps = {
    osm: {
      name: "OpenStreetMap",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "© OpenStreetMap contributors",
      maxZoom: 22
    },
    satellite: {
      name: "Satellite",
      url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      attribution: "© Google",
      maxZoom: 22
    },
    streets: {
      name: "Google Streets",
      url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      attribution: "© Google",
      maxZoom: 22
    }
  }

  // Sample GeoJSON data for Surakarta - Updated with Firebase data
  const mapData: MapData = {
    accidents: (filteredAccidents || firebaseAccidents).map((accident: any) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [accident.long, accident.lat]
      },
      properties: {
        id: accident.id,
        no: accident.no,
        tanggal: accident.tanggal,
        lokasi: accident.lokasi,
        jenis: accident.jenis,
        kendaraan: accident.kendaraan,
        korban: accident.korban,
        deskripsi: accident.deskripsi,
        type: accident.jenis === "Fatal" ? "fatal" : 
              accident.jenis === "Luka-luka" ? "injury" : "damage",
        date: accident.tanggal,
        description: accident.deskripsi,
        vehicles: accident.kendaraan.split(", "),
        casualties: parseInt(accident.korban) || 0
      }
    })),
    infrastructure: firebaseInfrastructure.map((infra: any) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [infra.long, infra.lat]
      },
      properties: {
        id: infra.id,
        no: infra.no,
        jenis: infra.jenis,
        lokasi: infra.lokasi,
        status: infra.status,
        deskripsi: infra.deskripsi
      }
    })),
    facilities: firebaseFacilities.map((facility: any) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [facility.long, facility.lat]
      },
      properties: {
        id: facility.id,
        no: facility.no,
        nama: facility.nama,
        jenis: facility.jenis,
        lokasi: facility.lokasi,
        status: facility.status,
        deskripsi: facility.deskripsi
      }
    })),
    reports: firebaseReports.map((report: any) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [report.long, report.lat]
      },
      properties: {
        id: report.id,
        no: report.no,
        kategori: report.kategori,
        lokasi: report.lokasi,
        status: report.status,
        pelapor: report.pelapor,
        tanggal: report.tanggal,
        deskripsi: report.deskripsi
      }
    })),
    blackspots: firebaseBlackspots.map((blackspot: any) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [blackspot.long, blackspot.lat]
      },
      properties: {
        id: blackspot.id,
        no: blackspot.no,
        lokasi: blackspot.lokasi,
        jenis: blackspot.jenis,
        deskripsi: blackspot.deskripsi
      }
    })),
    roads: [],
    boundaries: []
  }

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map centered on Surakarta with enhanced zoom levels
    const map = L.map(mapRef.current, {
      center: [-7.5665, 110.8167],
      zoom: 13,
      minZoom: 8, // Minimum zoom level for Surakarta area
      maxZoom: 22, // Maximum zoom level (up to 22)
      zoomControl: false // We'll add custom zoom control
    }).setView([-7.5665, 110.8167], 13)
    mapInstanceRef.current = map

    // Call onMapReady callback if provided
    if (onMapReady) {
      onMapReady(map)
    }

    // Store map instance globally for search functionality (only on client side)
    if (typeof window !== 'undefined') {
      (window as any).mapInstance = map
      ;(window as any).L = L
    }

    // Add initial base map
    const currentBaseMap = baseMaps[selectedBaseMap as keyof typeof baseMaps]
    const tileLayer = L.tileLayer(currentBaseMap.url, {
      attribution: currentBaseMap.attribution,
      maxZoom: currentBaseMap.maxZoom || 22
    }).addTo(map)
    currentTileLayerRef.current = tileLayer

    // Add custom zoom control with enhanced zoom levels
    L.control.zoom({
      position: 'bottomright',
      zoomInTitle: 'Zoom In',
      zoomOutTitle: 'Zoom Out'
    }).addTo(map)

    // Initialize layer groups
    layersRef.current = {
      accidents: L.layerGroup().addTo(map),
      infrastructure: L.layerGroup().addTo(map),
      facilities: L.layerGroup().addTo(map),
      reports: L.layerGroup().addTo(map),
      blackspots: L.layerGroup().addTo(map),
      roads: L.layerGroup().addTo(map),
      boundaries: L.layerGroup().addTo(map)
    }

    // Add click handler to hide context menu and save coordinates
    map.on("click", (e) => {
      // Hide context menu on left click
      setContextMenu(null)
      
      // Save selected coordinates for report page
      const coords = { lat: e.latlng.lat, lng: e.latlng.lng }
      setSelectedCoordinates(coords)
      
      // Call onLocationSelect if provided (for report page)
      if (onLocationSelect) {
        onLocationSelect(coords.lat, coords.lng)
      }
    })

    // Add zoom change handler
    map.on("zoomend", () => {
      setCurrentZoom(map.getZoom())
    })

    // Add context menu handler (right click)
    map.on("contextmenu", (e) => {
      e.originalEvent.preventDefault()
      
      // Get map container position
      const mapContainer = mapRef.current
      if (mapContainer) {
        const rect = mapContainer.getBoundingClientRect()
        let x = e.originalEvent.clientX - rect.left
        let y = e.originalEvent.clientY - rect.top
        
        // Ensure context menu stays within map bounds
        const menuWidth = 200 // Approximate menu width
        const menuHeight = 120 // Approximate menu height
        
        // Adjust X position if menu would go outside right edge
        if (x + menuWidth/2 > rect.width) {
          x = rect.width - menuWidth/2
        }
        // Adjust X position if menu would go outside left edge
        if (x - menuWidth/2 < 0) {
          x = menuWidth/2
        }
        
        // Adjust Y position if menu would go outside bottom edge
        if (y + menuHeight > rect.height) {
          y = y - menuHeight - 20 // Show above cursor
        } else {
          y = y - 20 // Show above cursor
        }
        
        setContextMenu({
          visible: true,
          x: x,
          y: y,
          lat: e.latlng.lat,
          lng: e.latlng.lng
        })
      }
    })

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Add global click listener to close context menu
  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu(null)
    }

    document.addEventListener('click', handleGlobalClick)
    return () => {
      document.removeEventListener('click', handleGlobalClick)
    }
  }, [])

  // Handle base map changes without recreating the map
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current
    const currentBaseMap = baseMaps[selectedBaseMap as keyof typeof baseMaps]

    // Remove existing tile layer
    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current)
    }

    // Add new tile layer
          const newTileLayer = L.tileLayer(currentBaseMap.url, {
        attribution: currentBaseMap.attribution,
        maxZoom: currentBaseMap.maxZoom || 22
      }).addTo(map)
    currentTileLayerRef.current = newTileLayer

    // Update map max zoom to match tile server
            const maxZoom = currentBaseMap.maxZoom || 22
    map.setMaxZoom(maxZoom)
    
    // If current zoom exceeds new max zoom, adjust it
    if (map.getZoom() > maxZoom) {
      map.setZoom(maxZoom)
    }

  }, [selectedBaseMap])

  // Update layers based on selectedLayers and Firebase data
  useEffect(() => {
    if (!mapInstanceRef.current) return

    Object.keys(layersRef.current).forEach((layerKey) => {
      const layerGroup = layersRef.current[layerKey]
      layerGroup.clearLayers()

      if (selectedLayers[layerKey] && mapData[layerKey as keyof MapData]) {
        const data = mapData[layerKey as keyof MapData]
        
        if (Array.isArray(data)) {
          data.forEach((feature) => {
            if (feature.geometry.type === "Point") {
              addPointLayer(feature, layerKey)
            } else if (feature.geometry.type === "LineString") {
              addLineLayer(feature, layerKey)
            } else if (feature.geometry.type === "Polygon") {
              addPolygonLayer(feature, layerKey)
            }
          })
        }
      }
    })
  }, [selectedLayers, firebaseAccidents, firebaseInfrastructure, firebaseFacilities, firebaseReports, firebaseBlackspots, filteredAccidents])

  const addPointLayer = (feature: any, layerType: string) => {
    const [lng, lat] = feature.geometry.coordinates
    const properties = feature.properties

    let icon: any
    let color: string

    switch (layerType) {
      case "accidents":
        // Use jenis field from admin data, fallback to type field
        const jenis = properties.jenis || properties.type
        color = jenis === "Fatal" || jenis === "fatal" ? "#ef4444" : 
                jenis === "Luka-luka" || jenis === "injury" ? "#f97316" : "#eab308"
        icon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        }) as L.Icon
        break
      case "infrastructure":
        color = "#3b82f6"
        icon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 2px; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        }) as L.Icon
        break
      case "facilities":
        color = "#10b981"
        icon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 2px; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        }) as L.Icon
        break
      case "reports":
        color = "#f59e0b"
        icon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5]
        })
        break
      case "blackspots":
        color = "#dc2626"
        icon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
        break
      default:
        icon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: #6b7280; width: 8px; height: 8px; border-radius: 50%; border: 2px solid white;"></div>`,
          iconSize: [8, 8],
          iconAnchor: [4, 4]
        })
    }

    const marker = L.marker([lat, lng], { icon }).addTo(layersRef.current[layerType])
    
    // Add popup
    const popupContent = createPopupContent(properties, layerType)
    marker.bindPopup(popupContent)
  }

  const addLineLayer = (feature: any, layerType: string) => {
    const coordinates = feature.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]])
    const properties = feature.properties

    const line = L.polyline(coordinates, {
      color: "#3b82f6",
      weight: 3,
      opacity: 0.8
    }).addTo(layersRef.current[layerType])

    const popupContent = createPopupContent(properties, layerType)
    line.bindPopup(popupContent)
  }

  const addPolygonLayer = (feature: any, layerType: string) => {
    const coordinates = feature.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]])
    const properties = feature.properties

    const polygon = L.polygon(coordinates, {
      color: "#6b7280",
      weight: 2,
      fillColor: "#6b7280",
      fillOpacity: 0.1
    }).addTo(layersRef.current[layerType])

    const popupContent = createPopupContent(properties, layerType)
    polygon.bindPopup(popupContent)
  }

  const createPopupContent = (properties: any, layerType: string) => {
    let content = `<div class="p-2">`
    
    switch (layerType) {
      case "accidents":
        content += `
          <h3 class="font-semibold text-red-600 mb-2">Kecelakaan Lalu Lintas</h3>
          <p class="text-sm mb-1"><strong>No:</strong> ${properties.no || properties.id}</p>
          <p class="text-sm mb-1"><strong>Tanggal:</strong> ${properties.tanggal || properties.date}</p>
          <p class="text-sm mb-1"><strong>Lokasi:</strong> ${properties.lokasi || properties.description}</p>
          <p class="text-sm mb-1"><strong>Jenis:</strong> ${properties.jenis || properties.type}</p>
          <p class="text-sm mb-1"><strong>Kendaraan:</strong> ${properties.kendaraan || properties.vehicles?.join(", ")}</p>
          <p class="text-sm mb-1"><strong>Korban:</strong> ${properties.korban || properties.casualties} orang</p>
          <p class="text-sm"><strong>Deskripsi:</strong> ${properties.deskripsi || properties.description}</p>
        `
        break
      case "infrastructure":
        content += `
          <h3 class="font-semibold text-blue-600 mb-2">Infrastruktur</h3>
          <p class="text-sm mb-1"><strong>No:</strong> ${properties.no || properties.id}</p>
          <p class="text-sm mb-1"><strong>Jenis:</strong> ${properties.jenis || properties.type}</p>
          <p class="text-sm mb-1"><strong>Lokasi:</strong> ${properties.lokasi || properties.description}</p>
          <p class="text-sm mb-1"><strong>Status:</strong> ${properties.status}</p>
          <p class="text-sm"><strong>Deskripsi:</strong> ${properties.deskripsi || properties.description}</p>
        `
        break
      case "facilities":
        content += `
          <h3 class="font-semibold text-green-600 mb-2">Fasilitas Umum</h3>
          <p class="text-sm mb-1"><strong>No:</strong> ${properties.no || properties.id}</p>
          <p class="text-sm mb-1"><strong>Nama:</strong> ${properties.nama || properties.name}</p>
          <p class="text-sm mb-1"><strong>Jenis:</strong> ${properties.jenis || properties.type}</p>
          <p class="text-sm mb-1"><strong>Lokasi:</strong> ${properties.lokasi || properties.description}</p>
          <p class="text-sm mb-1"><strong>Status:</strong> ${properties.status}</p>
          <p class="text-sm"><strong>Deskripsi:</strong> ${properties.deskripsi || properties.description}</p>
        `
        break
      case "reports":
        content += `
          <h3 class="font-semibold text-amber-600 mb-2">Laporan Masyarakat</h3>
          <p class="text-sm mb-1"><strong>No:</strong> ${properties.no || properties.id}</p>
          <p class="text-sm mb-1"><strong>Kategori:</strong> ${properties.kategori || properties.category}</p>
          <p class="text-sm mb-1"><strong>Lokasi:</strong> ${properties.lokasi || properties.description}</p>
          <p class="text-sm mb-1"><strong>Status:</strong> ${properties.status}</p>
          <p class="text-sm mb-1"><strong>Pelapor:</strong> ${properties.pelapor || properties.reported_by}</p>
          <p class="text-sm mb-1"><strong>Tanggal:</strong> ${properties.tanggal || properties.date}</p>
          <p class="text-sm"><strong>Deskripsi:</strong> ${properties.deskripsi || properties.description}</p>
        `
        break
      case "blackspots":
        content += `
          <h3 class="font-semibold text-red-600 mb-2">Blackspot</h3>
          <p class="text-sm mb-1"><strong>No:</strong> ${properties.no || properties.id}</p>
          <p class="text-sm mb-1"><strong>Lokasi:</strong> ${properties.lokasi}</p>
          <p class="text-sm mb-1"><strong>Jenis:</strong> ${properties.jenis}</p>
          <p class="text-sm mb-1"><strong>Total Kecelakaan:</strong> ${properties.totalKecelakaan || ""}</p>
          <p class="text-sm"><strong>Deskripsi:</strong> ${properties.deskripsi}</p>
        `
        break
      case "roads":
        content += `
          <h3 class="font-semibold text-blue-600 mb-2">Jalan</h3>
          <p class="text-sm mb-1"><strong>Nama:</strong> ${properties.name}</p>
          <p class="text-sm mb-1"><strong>Jenis:</strong> ${properties.type}</p>
          <p class="text-sm"><strong>Jumlah Lajur:</strong> ${properties.lanes}</p>
        `
        break
      case "boundaries":
        content += `
          <h3 class="font-semibold text-gray-600 mb-2">Batas Wilayah</h3>
          <p class="text-sm mb-1"><strong>Nama:</strong> ${properties.name}</p>
          <p class="text-sm"><strong>Jenis:</strong> ${properties.type}</p>
        `
        break
    }
    
    content += `</div>`
    return content
  }



  // Function to extract coordinates from Google Maps URL
  // Function to parse coordinates from input
  const parseCoordinates = (coordString: string) => {
    // Remove extra spaces and normalize
    const clean = coordString.trim().replace(/\s+/g, ' ')
    
    // Pattern 1: "lat, lng" (e.g., "-7.5665, 110.8167")
    const pattern1 = /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/
    const match1 = clean.match(pattern1)
    if (match1) {
      const lat = parseFloat(match1[1])
      const lng = parseFloat(match1[2])
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng }
      }
    }
    
    // Pattern 2: "lat lng" (e.g., "-7.5665 110.8167")
    const pattern2 = /^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/
    const match2 = clean.match(pattern2)
    if (match2) {
      const lat = parseFloat(match2[1])
      const lng = parseFloat(match2[2])
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng }
      }
    }
    
    // Pattern 3: Extract from Google Maps URL
    const urlPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/g
    const urlMatch = clean.match(urlPattern)
    if (urlMatch) {
      const coords = urlMatch[0].match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
      if (coords) {
        const lat = parseFloat(coords[1])
        const lng = parseFloat(coords[2])
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng }
        }
      }
    }
    
    return null
  }

  // Function to handle Google Maps URL input
  const handleCoordinateSubmit = () => {
    if (!coordinates.trim()) {
      toast.error("Mohon masukkan koordinat atau URL Google Maps")
      return
    }

    setIsSearching(true)
    const coords = parseCoordinates(coordinates)

    if (coords) {
      if (mapInstanceRef.current) {
        const currentBaseMap = baseMaps[selectedBaseMap as keyof typeof baseMaps]
        const maxZoom = currentBaseMap.maxZoom || 22
        const targetZoom = Math.min(18, maxZoom) // Don't exceed tile server max zoom
        mapInstanceRef.current.setView([coords.lat, coords.lng], targetZoom)
        // Add a temporary marker to show the location
        const tempMarker = L.marker([coords.lat, coords.lng], {
          icon: L.divIcon({
            className: "custom-div-icon",
            html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          }) as any
        }).addTo(mapInstanceRef.current)

        // Remove marker after 5 seconds
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.removeLayer(tempMarker)
          }
        }, 5000)

        toast.success(`Berhasil navigasi ke koordinat: ${coords.lat}, ${coords.lng}`)
        setCoordinates("")
        setIsCoordInputVisible(false)
      }
    } else {
      toast.error("Format koordinat tidak valid. Gunakan format: -7.5665, 110.8167 atau paste URL Google Maps")
    }
    
    setIsSearching(false)
  }

  // Function to copy Google Maps URL
  const copyGoogleMapsUrl = (lat: number, lng: number) => {
    if (typeof window !== 'undefined') {
      const url = `https://www.google.com/maps?q=${lat},${lng}`
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
    setContextMenu(null)
  }

  // Function to copy coordinates for Google Maps search
  const copyCoordinates = (lat: number, lng: number) => {
    if (typeof window !== 'undefined') {
      // Format coordinates for Google Maps search bar (decimal degrees)
      const coords = `${lat}, ${lng}`
      navigator.clipboard.writeText(coords).then(() => {
        toast.success("Koordinat telah disalin ke clipboard!")
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = coords
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        toast.success("Koordinat telah disalin ke clipboard!")
      })
    }
    setContextMenu(null)
  }

  // Function to report issue at selected location
  const reportIssue = (lat: number, lng: number) => {
    // Store coordinates in localStorage for report page
    if (typeof window !== 'undefined') {
      localStorage.setItem('reportLocation', JSON.stringify({ lat, lng }))
      // Navigate to report page
      window.location.href = '/report'
    }
    setContextMenu(null)
  }



  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />
      <Toaster />
      

      

      
      {/* Base Map Selector */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
          <CardContent className="p-3">
            {/* Header with minimize button */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 text-xs">Peta Dasar</h4>
              <Button
                onClick={() => setIsBaseMapMinimized(!isBaseMapMinimized)}
                className="p-1 h-6 w-6 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
              >
                {isBaseMapMinimized ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronUp className="w-3 h-3" />
                )}
              </Button>
            </div>
            
            {/* Content - conditionally rendered */}
            {!isBaseMapMinimized && (
              <>
                <div className="space-y-1 text-xs">
                  {Object.entries(baseMaps).map(([key, map]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedBaseMap(key)}
                      className={`w-full text-left px-2 py-1 rounded transition-colors ${
                        selectedBaseMap === key 
                          ? 'bg-blue-100 text-blue-700 font-medium' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {map.name}
                    </button>
                  ))}
                </div>
                {/* Zoom Level Display */}
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-600 font-medium">
                    Zoom: {currentZoom}x
                  </div>
                  <div className="text-xs text-gray-400">
                    {currentZoom >= 18 ? "Detail Tinggi" : 
                     currentZoom >= 15 ? "Detail Menengah" : 
                     currentZoom >= 12 ? "Detail Rendah" : "Area Luas"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Max: {baseMaps[selectedBaseMap as keyof typeof baseMaps]?.maxZoom || 22}x
                  </div>
                  <div className="text-xs text-gray-400">
                    {selectedBaseMap === 'osm' ? 'OSM' : 
                     selectedBaseMap === 'satellite' ? 'Satellite' : 
                     selectedBaseMap === 'streets' ? 'Google Streets' : 'OSM'}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Google Maps URL Input - Compact for Report Page */}
      {!isCompact ? (
        <div className="absolute top-4 right-4 z-[1000]">
          <Card className="bg-white/95 backdrop-blur-md shadow-xl border-0 rounded-xl overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">Cari Lokasi</h4>
                      <p className="text-blue-100 text-xs">Koordinat & URL Google Maps</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsCoordInputVisible(!isCoordInputVisible)}
                    className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200"
                  >
                    {isCoordInputVisible ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Content */}
                             <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                 isCoordInputVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
               }`}>
                 <div className="p-4 space-y-4">
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <MapPin className="h-4 w-4 text-gray-400" />
                     </div>
                     <input
                       type="text"
                       placeholder="Paste koordinat atau URL Google Maps..."
                       value={coordinates}
                       onChange={(e) => setCoordinates(e.target.value)}
                       className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                     />
                   </div>
                   
                   <div className="flex space-x-2">
                     <Button
                       onClick={handleCoordinateSubmit}
                       disabled={!coordinates.trim() || isSearching}
                       className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {isSearching ? (
                         <>
                           <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                           Mencari...
                         </>
                       ) : (
                         <>
                           <MapPin className="w-4 h-4 mr-2" />
                           Cari Lokasi
                         </>
                       )}
                     </Button>
                     <Button
                       onClick={() => {
                         setCoordinates("")
                         setIsCoordInputVisible(false)
                       }}
                       className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200"
                     >
                       Batal
                     </Button>
                   </div>
                   
                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                     <div className="flex items-start space-x-2">
                       <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                         <span className="text-white text-xs">💡</span>
                       </div>
                       <div className="text-xs text-blue-800">
                         <p className="font-medium mb-1">Cara Penggunaan:</p>
                         <ul className="space-y-1 text-blue-700">
                           <li>• Copy koordinat dari Google Maps (klik kanan)</li>
                           <li>• Atau copy URL dari address bar</li>
                           <li>• Paste di input field di atas</li>
                           <li>• Klik "Cari Lokasi" untuk navigasi</li>
                         </ul>
                         <p className="font-medium mt-2 mb-1">Format yang Didukung:</p>
                         <ul className="space-y-1 text-blue-700">
                           <li>• Koordinat: -7.5665, 110.8167</li>
                           <li>• URL: google.com/maps/@lat,lng</li>
                           <li>• URL: maps.app.goo.gl/xxx</li>
                         </ul>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
       ) : (
         /* Compact version for report page */
         <div className="absolute top-2 right-2 z-[1000]">
           <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
             <CardContent className="p-2">
               <div className="flex items-center space-x-2">
                 <MapPin className="w-3 h-3 text-blue-600" />
                 <span className="text-xs font-medium text-gray-700">Cari Lokasi</span>
                 <Button
                   onClick={() => setIsCoordInputVisible(!isCoordInputVisible)}
                   className="p-1 h-5 w-5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
                 >
                   {isCoordInputVisible ? (
                     <ChevronUp className="w-2 h-2" />
                   ) : (
                     <ChevronDown className="w-2 h-2" />
                   )}
                 </Button>
               </div>
               
               {/* Compact Content */}
               {isCoordInputVisible && (
                 <div className="mt-2 space-y-2">
                   <div className="flex space-x-1">
                     <Input
                       placeholder="Koordinat..."
                       value={coordinates}
                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoordinates(e.target.value)}
                       className="text-xs h-7"
                     />
                     <Button
                       onClick={handleCoordinateSubmit}
                       disabled={isSearching}
                       className="bg-blue-500 hover:bg-blue-600 text-white px-2 text-xs h-7"
                     >
                       {isSearching ? (
                         <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" />
                       ) : (
                         "Cari"
                       )}
                     </Button>
                   </div>
                 </div>
               )}
             </CardContent>
           </Card>
         </div>
       )}

       {/* Selected Location Info - for Report Page */}
       {isCompact && selectedCoordinates && (
         <div className="absolute bottom-2 left-2 z-[1000] bg-black/80 text-white p-2 rounded text-xs">
           <div className="flex items-center justify-between mb-1">
             <div className="font-medium">Lokasi Dipilih:</div>
             <button
               onClick={clearSelectedCoordinates}
               className="text-red-400 hover:text-red-300 transition-colors"
               title="Hapus lokasi"
             >
               <X className="w-3 h-3" />
             </button>
           </div>
           <div className="space-y-1">
             <div>Koordinat: {selectedCoordinates.lat.toFixed(6)}, {selectedCoordinates.lng.toFixed(6)}</div>
             <div>URL: https://maps.google.com/?q={selectedCoordinates.lat},{selectedCoordinates.lng}</div>
           </div>
         </div>
       )}

       {/* Context Menu */}
       {contextMenu && (
         <div 
           className="absolute z-[2000] bg-white shadow-lg rounded-md border border-gray-200 py-1 min-w-[180px]"
           style={{
             left: `${contextMenu.x}px`,
             top: `${contextMenu.y}px`,
             transform: 'translate(-50%, -100%)'
           }}
         >
           <button
             onClick={() => copyGoogleMapsUrl(contextMenu.lat, contextMenu.lng)}
             className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
           >
             <MapPin className="w-4 h-4 text-blue-500" />
             <span>Copy Google Maps URL</span>
           </button>
           <button
             onClick={() => copyCoordinates(contextMenu.lat, contextMenu.lng)}
             className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
           >
             <Info className="w-4 h-4 text-green-500" />
             <span>Copy Koordinat</span>
           </button>
           <button
             onClick={() => reportIssue(contextMenu.lat, contextMenu.lng)}
             className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
           >
             <AlertTriangle className="w-4 h-4 text-red-500" />
             <span>Laporkan Kerusakan</span>
           </button>
           <div className="border-t border-gray-200 my-1"></div>
           <div className="px-4 py-1 text-xs text-gray-500">
             Lat: {contextMenu.lat.toFixed(6)}<br/>
             Lng: {contextMenu.lng.toFixed(6)}
           </div>
         </div>
       )}

       {/* Layer Legends - Only show when layer is active */}
       <div 
         className="absolute top-64 left-4 z-[1000] max-h-[calc(100vh-200px)] overflow-y-auto space-y-4 pr-2 custom-scrollbar"
         style={{
           scrollbarWidth: 'thin',
           scrollbarColor: '#d1d5db transparent'
         }}
       >
         {/* Accidents Legend */}
         {selectedLayers.accidents && (
           <Card className="bg-white/90 backdrop-blur-sm shadow-lg flex-shrink-0">
             <CardContent className="p-2">
               <h4 className="font-semibold text-gray-900 mb-2 text-xs flex items-center">
                 <CarAccident className="w-3 h-3 mr-1 text-red-500" />
                 Data Kecelakaan
               </h4>
               <div className="space-y-1 text-xs">
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                   <span>Fatal</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                   <span>Luka-luka</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                   <span>Kerusakan</span>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}

         {/* Infrastructure Legend */}
         {selectedLayers.infrastructure && (
           <Card className="bg-white/90 backdrop-blur-sm shadow-lg flex-shrink-0">
             <CardContent className="p-2">
               <h4 className="font-semibold text-gray-900 mb-2 text-xs flex items-center">
                 <Settings className="w-3 h-3 mr-1 text-blue-500" />
                 Infrastruktur
               </h4>
               <div className="space-y-1 text-xs">
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                   <span>🚦 Lampu Lalu Lintas</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                   <span>🚧 Rambu Lalu Lintas</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                   <span>📹 CCTV</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                   <span>🌉 Jembatan</span>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}

         {/* Facilities Legend */}
         {selectedLayers.facilities && (
           <Card className="bg-white/90 backdrop-blur-sm shadow-lg flex-shrink-0">
             <CardContent className="p-2">
               <h4 className="font-semibold text-gray-900 mb-2 text-xs flex items-center">
                 <Building2 className="w-3 h-3 mr-1 text-green-500" />
                 Fasilitas Umum
               </h4>
               <div className="space-y-1 text-xs">
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                   <span>🏥 Rumah Sakit</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                   <span>👮 Kantor Polisi</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                   <span>🚒 Pemadam Kebakaran</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                   <span>🏫 Sekolah</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                   <span>⛽ SPBU</span>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}

         {/* Reports Legend */}
         {selectedLayers.reports && (
           <Card className="bg-white/90 backdrop-blur-sm shadow-lg flex-shrink-0">
             <CardContent className="p-2">
               <h4 className="font-semibold text-gray-900 mb-2 text-xs flex items-center">
                 <Report className="w-3 h-3 mr-1 text-amber-500" />
                 Laporan Masyarakat
               </h4>
               <div className="space-y-1 text-xs">
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                   <span>📍 Pending</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                   <span>🔄 Diproses</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                   <span>✅ Selesai</span>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}

         {/* Blackspots Legend */}
         {selectedLayers.blackspots && (
           <Card className="bg-white/90 backdrop-blur-sm shadow-lg flex-shrink-0">
             <CardContent className="p-2">
               <h4 className="font-semibold text-gray-900 mb-2 text-xs flex items-center">
                 <AlertOctagon className="w-3 h-3 mr-1 text-red-600" />
                 Blackspot
               </h4>
               <div className="space-y-1 text-xs">
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                   <span>⚠️ Blackspot Aktif</span>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}
       </div>
     </div>
   )
}

// Export as client-only component
export default dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">Loading map...</div>
})