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
import { SymbologySettings as SymbologySettingsComponent } from "@/components/ui/symbology-settings"
import { FullscreenButton } from "@/components/ui/fullscreen-button"

// Fix Leaflet default icon issue - only run on client side
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  })
}

interface SymbologySettings {
  fillColor: string
  borderColor: string
  borderWidth: number
  fillOpacity: number
  borderOpacity: number
  hollow: boolean
  showLabels: boolean
  labelColor: string
  labelSize: number
  labelBold: boolean
}

interface MapProps {
  selectedLayers: Record<string, boolean>
  onLocationSelect?: (lat: number, lng: number) => void
  isCompact?: boolean
  onMapReady?: (mapInstance: any) => void
  filteredAccidents?: any[]
  showBoundaryKota?: boolean
  boundaryKotaSettings?: SymbologySettings
  showBoundaryKecamatan?: boolean
  boundaryKecamatanSettings?: SymbologySettings
  showBoundaryKelurahan?: boolean
  boundaryKelurahanSettings?: SymbologySettings
  onBoundarySettingsChange?: (type: 'kota' | 'kecamatan' | 'kelurahan', settings: SymbologySettings) => void
  onVisibilityChange?: (type: 'kota' | 'kecamatan' | 'kelurahan', visible: boolean) => void
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
const MapComponent = ({
  selectedLayers,
  onLocationSelect,
  isCompact = false,
  onMapReady,
  filteredAccidents,
  showBoundaryKota = false,
  boundaryKotaSettings,
  showBoundaryKecamatan = false,
  boundaryKecamatanSettings,
  showBoundaryKelurahan = false,
  boundaryKelurahanSettings,
  onBoundarySettingsChange,
  onVisibilityChange,
}: MapProps) => {
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
  const [boundaryKotaData, setBoundaryKotaData] = useState<any>(null)
  const [boundaryKecamatanData, setBoundaryKecamatanData] = useState<any>(null)
  const [boundaryKelurahanData, setBoundaryKelurahanData] = useState<any>(null)
  const [boundaryKotaLayer, setBoundaryKotaLayer] = useState<L.LayerGroup | null>(null)
  const [boundaryKecamatanLayer, setBoundaryKecamatanLayer] = useState<L.LayerGroup | null>(null)
  const [boundaryKelurahanLayer, setBoundaryKelurahanLayer] = useState<L.LayerGroup | null>(null)

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

  // Function to load boundary GeoJSON
  const loadBoundaryData = async (url: string, setter: (data: any) => void) => {
    try {
      const response = await fetch(url)
      const data = await response.json()
      setter(data)
    } catch (error) {
      console.error('Error loading boundary data:', error)
    }
  }

  // Helper function to calculate the true centroid of a polygon
  const calculatePolygonCentroid = (latLngs: L.LatLng[]) => {
    if (latLngs.length < 3) return null
    
    let area = 0
    let centroidX = 0
    let centroidY = 0
    
    for (let i = 0; i < latLngs.length; i++) {
      const j = (i + 1) % latLngs.length
      const cross = latLngs[i].lng * latLngs[j].lat - latLngs[j].lng * latLngs[i].lat
      area += cross
      centroidX += (latLngs[i].lng + latLngs[j].lng) * cross
      centroidY += (latLngs[i].lat + latLngs[j].lat) * cross
    }
    
    area /= 2
    if (Math.abs(area) < 1e-10) return null // Degenerate polygon
    
    centroidX /= (6 * area)
    centroidY /= (6 * area)
    
    return [centroidY, centroidX] as [number, number] // Return as [lat, lng]
  }

  // Helper function to check if a point is inside a polygon
  const isPointInPolygon = (point: [number, number], polygonLatLngs: L.LatLng[]) => {
    const [x, y] = point
    let inside = false
    
    for (let i = 0, j = polygonLatLngs.length - 1; i < polygonLatLngs.length; j = i++) {
      const xi = polygonLatLngs[i].lng
      const yi = polygonLatLngs[i].lat
      const xj = polygonLatLngs[j].lng
      const yj = polygonLatLngs[j].lat
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside
      }
    }
    
    return inside
  }

  // Helper function to find the best label position within a polygon
  const findBestLabelPosition = (polygon: L.Polygon, labelText: string, settings: SymbologySettings) => {
    const bounds = polygon.getBounds()
    const latLngs = polygon.getLatLngs()[0] as L.LatLng[]
    
    // First try to find the pole of inaccessibility (point furthest from any boundary)
    // This is often better than centroid for irregular shapes
    const polePoint = findPoleOfInaccessibility(latLngs)
    if (polePoint && isPointInPolygon(polePoint, latLngs)) {
      return L.latLng(polePoint[0], polePoint[1])
    }
    
    // If pole of inaccessibility fails, try the true centroid of the polygon
    const centroid = calculatePolygonCentroid(latLngs)
    if (centroid && isPointInPolygon(centroid, latLngs)) {
      return L.latLng(centroid[0], centroid[1])
    }
    
    // If centroid is outside or invalid, find the best internal point
    const center = bounds.getCenter()
    
    // Check if center is inside the polygon
    if (isPointInPolygon([center.lat, center.lng], latLngs)) {
      return center
    }
    
    // If center is outside, find the best point inside using a more precise search
    const boundsWidth = Math.abs(bounds.getEast() - bounds.getWest())
    const boundsHeight = Math.abs(bounds.getNorth() - bounds.getSouth())
    const stepSize = Math.min(boundsWidth, boundsHeight) / 60 // More precise grid
    
    // Try to find a point that's as close as possible to the center
    let bestPoint = center
    let bestDistance = Infinity
    
    // Search in a spiral pattern from center outward
    for (let radius = 0; radius < Math.min(boundsWidth, boundsHeight) / 3; radius += stepSize) {
      for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 24) { // 48 directions for more precision
        const testLat = center.lat + radius * Math.cos(angle)
        const testLng = center.lng + radius * Math.sin(angle)
        const testPoint: [number, number] = [testLat, testLng]
        
        if (isPointInPolygon(testPoint, latLngs)) {
          const distance = Math.sqrt(
            Math.pow(testLat - center.lat, 2) + Math.pow(testLng - center.lng, 2)
          )
          if (distance < bestDistance) {
            bestDistance = distance
            bestPoint = L.latLng(testLat, testLng)
          }
        }
      }
    }
    
    // If we found a better point, use it
    if (bestDistance < Infinity) {
      return bestPoint
    }
    
    // If still no point found, try a grid search with smaller steps
    for (let lat = bounds.getSouth(); lat <= bounds.getNorth(); lat += stepSize) {
      for (let lng = bounds.getWest(); lng <= bounds.getEast(); lng += stepSize) {
        const testPoint: [number, number] = [lat, lng]
        if (isPointInPolygon(testPoint, latLngs)) {
          return L.latLng(lat, lng)
        }
      }
    }
    
    // Final fallback to bounds center
    return center
  }

  // Helper function to find the pole of inaccessibility (point furthest from any boundary)
  const findPoleOfInaccessibility = (latLngs: L.LatLng[]) => {
    if (latLngs.length < 3) return null
    
    // Find the bounding box
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity
    for (const point of latLngs) {
      minLat = Math.min(minLat, point.lat)
      maxLat = Math.max(maxLat, point.lat)
      minLng = Math.min(minLng, point.lng)
      maxLng = Math.max(maxLng, point.lng)
    }
    
    // First try with a coarse grid to find a good starting area
    const coarseGridSize = 20 // 20x20 grid for initial search
    const latStepCoarse = (maxLat - minLat) / coarseGridSize
    const lngStepCoarse = (maxLng - minLng) / coarseGridSize
    
    let bestPointCoarse: [number, number] | null = null
    let maxDistanceCoarse = -1
    
    // Coarse grid search
    for (let i = 0; i <= coarseGridSize; i++) {
      for (let j = 0; j <= coarseGridSize; j++) {
        const lat = minLat + i * latStepCoarse
        const lng = minLng + j * lngStepCoarse
        const testPoint: [number, number] = [lat, lng]
        
        if (isPointInPolygon(testPoint, latLngs)) {
          // Calculate minimum distance to any boundary edge
          let minDistToBoundary = Infinity
          for (let k = 0; k < latLngs.length; k++) {
            const p1 = latLngs[k]
            const p2 = latLngs[(k + 1) % latLngs.length]
            
            const dist = pointToLineSegmentDistance(testPoint, [p1.lat, p1.lng], [p2.lat, p2.lng])
            minDistToBoundary = Math.min(minDistToBoundary, dist)
          }
          
          if (minDistToBoundary > maxDistanceCoarse) {
            maxDistanceCoarse = minDistToBoundary
            bestPointCoarse = testPoint
          }
        }
      }
    }
    
    // If we found a good point in the coarse search, refine it with a finer grid
    if (bestPointCoarse) {
      // Define a smaller search area around the best point from coarse search
      const refinementRadius = Math.max(latStepCoarse, lngStepCoarse) * 2
      const refineLat1 = Math.max(minLat, bestPointCoarse[0] - refinementRadius)
      const refineLat2 = Math.min(maxLat, bestPointCoarse[0] + refinementRadius)
      const refineLng1 = Math.max(minLng, bestPointCoarse[1] - refinementRadius)
      const refineLng2 = Math.min(maxLng, bestPointCoarse[1] + refinementRadius)
      
      // Use a finer grid in this smaller area
      const fineGridSize = 30
      const latStepFine = (refineLat2 - refineLat1) / fineGridSize
      const lngStepFine = (refineLng2 - refineLng1) / fineGridSize
      
      let bestPointFine: [number, number] | null = bestPointCoarse
      let maxDistanceFine = maxDistanceCoarse
      
      // Fine grid search
      for (let i = 0; i <= fineGridSize; i++) {
        for (let j = 0; j <= fineGridSize; j++) {
          const lat = refineLat1 + i * latStepFine
          const lng = refineLng1 + j * lngStepFine
          const testPoint: [number, number] = [lat, lng]
          
          if (isPointInPolygon(testPoint, latLngs)) {
            // Calculate minimum distance to any boundary edge
            let minDistToBoundary = Infinity
            for (let k = 0; k < latLngs.length; k++) {
              const p1 = latLngs[k]
              const p2 = latLngs[(k + 1) % latLngs.length]
              
              const dist = pointToLineSegmentDistance(testPoint, [p1.lat, p1.lng], [p2.lat, p2.lng])
              minDistToBoundary = Math.min(minDistToBoundary, dist)
            }
            
            if (minDistToBoundary > maxDistanceFine) {
              maxDistanceFine = minDistToBoundary
              bestPointFine = testPoint
            }
          }
        }
      }
      
      return bestPointFine
    }
    
    // Fallback to centroid if no good point found
    const centroid = calculatePolygonCentroid(latLngs)
    if (centroid && isPointInPolygon(centroid, latLngs)) {
      return centroid
    }
    
    // Last resort: just use the first point that's inside the polygon
    for (let i = 0; i <= 50; i++) {
      for (let j = 0; j <= 50; j++) {
        const lat = minLat + i * (maxLat - minLat) / 50
        const lng = minLng + j * (maxLng - minLng) / 50
        const testPoint: [number, number] = [lat, lng]
        
        if (isPointInPolygon(testPoint, latLngs)) {
          return testPoint
        }
      }
    }
    
    return null
  }

  // Helper function to calculate distance from point to line segment
  const pointToLineSegmentDistance = (point: [number, number], lineStart: [number, number], lineEnd: [number, number]) => {
    const [px, py] = point
    const [x1, y1] = lineStart
    const [x2, y2] = lineEnd
    
    const A = px - x1
    const B = py - y1
    const C = x2 - x1
    const D = y2 - y1
    
    const dot = A * C + B * D
    const lenSq = C * C + D * D
    
    if (lenSq === 0) {
      // Line segment is actually a point
      return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1))
    }
    
    let param = dot / lenSq
    
    let xx, yy
    if (param < 0) {
      xx = x1
      yy = y1
    } else if (param > 1) {
      xx = x2
      yy = y2
    } else {
      xx = x1 + param * C
      yy = y1 + param * D
    }
    
    const dx = px - xx
    const dy = py - yy
    
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Helper function to check if a label position is suitable (not too close to boundaries)
  const isLabelPositionSuitable = (position: L.LatLng, polygon: L.Polygon, labelSize: number) => {
    const latLngs = polygon.getLatLngs()[0] as L.LatLng[]
    const point: [number, number] = [position.lat, position.lng]
    
    // Calculate minimum distance to any boundary edge
    let minDistToBoundary = Infinity
    for (let k = 0; k < latLngs.length; k++) {
      const p1 = latLngs[k]
      const p2 = latLngs[(k + 1) % latLngs.length]
      
      const dist = pointToLineSegmentDistance(point, [p1.lat, p1.lng], [p2.lat, p2.lng])
      minDistToBoundary = Math.min(minDistToBoundary, dist)
    }
    
    // Calculate the area of the polygon to adjust the required distance based on size
    // For smaller polygons, we need to be more lenient
    const bounds = polygon.getBounds()
    const boundsArea = (bounds.getNorth() - bounds.getSouth()) * (bounds.getEast() - bounds.getWest())
    
    // Convert label size from pixels to degrees (approximate)
    // Adjust based on the zoom level and polygon size
    const labelSizeInDegrees = labelSize * 0.0001 * (1 / Math.sqrt(boundsArea) * 0.01)
    
    // For very small polygons, be more lenient
    const minRequiredDistance = boundsArea < 0.0001 ? 
      labelSizeInDegrees * 0.5 : // Very small polygons
      labelSizeInDegrees * 1.5   // Normal polygons
    
    // Position is suitable if it's at least the required distance away from boundaries
    return minDistToBoundary > minRequiredDistance
  }

  // Helper function to find an alternative label position if the primary one is not suitable
  const findAlternativeLabelPosition = (polygon: L.Polygon, labelText: string, settings: SymbologySettings) => {
    const bounds = polygon.getBounds()
    const latLngs = polygon.getLatLngs()[0] as L.LatLng[]
    const center = bounds.getCenter()
    
    // First try the pole of inaccessibility as it's often the best position
    const polePoint = findPoleOfInaccessibility(latLngs)
    if (polePoint && isPointInPolygon(polePoint, latLngs)) {
      const poleLatLng = L.latLng(polePoint[0], polePoint[1])
      if (isLabelPositionSuitable(poleLatLng, polygon, settings.labelSize || 10)) {
        return poleLatLng
      }
    }
    
    // Try positions in a grid pattern, prioritizing areas with more space
    const boundsWidth = Math.abs(bounds.getEast() - bounds.getWest())
    const boundsHeight = Math.abs(bounds.getNorth() - bounds.getSouth())
    
    // Adjust grid density based on polygon size
    // For smaller polygons, use a finer grid
    const boundsArea = boundsWidth * boundsHeight
    const gridDensity = boundsArea < 0.0001 ? 40 : 30 // Higher density for smaller polygons
    const stepSize = Math.min(boundsWidth, boundsHeight) / gridDensity
    
    let bestPosition: L.LatLng | null = null
    let bestScore = -1
    
    // Try a spiral search pattern from center outward
    const maxRadius = Math.min(boundsWidth, boundsHeight) / 2
    const angleStep = Math.PI / 12 // 24 directions per full circle
    
    for (let radius = 0; radius < maxRadius; radius += stepSize) {
      for (let angle = 0; angle < 2 * Math.PI; angle += angleStep) {
        const testLat = center.lat + radius * Math.cos(angle)
        const testLng = center.lng + radius * Math.sin(angle)
        const testPoint: [number, number] = [testLat, testLng]
        
        if (isPointInPolygon(testPoint, latLngs)) {
          // Calculate distance to center (prefer positions closer to center)
          const distanceToCenter = radius // We already know this from the spiral
          
          // Calculate minimum distance to boundary
          let minDistToBoundary = Infinity
          for (let k = 0; k < latLngs.length; k++) {
            const p1 = latLngs[k]
            const p2 = latLngs[(k + 1) % latLngs.length]
            
            const dist = pointToLineSegmentDistance(testPoint, [p1.lat, p1.lng], [p2.lat, p2.lng])
            minDistToBoundary = Math.min(minDistToBoundary, dist)
          }
          
          // Score based on distance to center and distance to boundary
          const score = minDistToBoundary - distanceToCenter * 0.1
          
          if (score > bestScore) {
            bestScore = score
            bestPosition = L.latLng(testLat, testLng)
          }
        }
      }
    }
    
    return bestPosition
  }

  const renderBoundaryLayer = (data: any, settings: SymbologySettings, layerRef: L.LayerGroup | null, setLayerRef: (layer: L.LayerGroup | null) => void, boundaryType?: 'kota' | 'kecamatan' | 'kelurahan') => {
    if (!mapInstanceRef.current || !data) return

    // Remove existing layer if any
    if (layerRef) {
      mapInstanceRef.current.removeLayer(layerRef)
    }

    // Create new layer
    const newLayer = L.layerGroup()
    
    data.features.forEach((feature: any) => {
      if (feature.geometry.type === 'Polygon') {
        // Handle Polygon geometry
        const coordinates = feature.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]] as [number, number])
        const polygon = L.polygon(coordinates, {
          color: settings.borderColor,
          weight: settings.borderWidth,
          fillColor: settings.hollow ? 'transparent' : settings.fillColor,
          fillOpacity: settings.hollow ? 0 : settings.fillOpacity,
          opacity: settings.borderOpacity
        })
        
        // Determine label text based on boundary type
        let labelText = ''
        let popupTitle = ''
        
        if (boundaryType === 'kota') {
          labelText = feature.properties.WADMKK || 'Kota'
          popupTitle = feature.properties.WADMKK || 'Kota'
        } else if (boundaryType === 'kecamatan') {
          labelText = feature.properties.WADMKC || 'Kecamatan'
          popupTitle = feature.properties.WADMKC || 'Kecamatan'
        } else if (boundaryType === 'kelurahan') {
          labelText = feature.properties.WADMKD || 'Kelurahan'
          popupTitle = feature.properties.WADMKD || 'Kelurahan'
        } else {
          // Fallback for unknown boundary type
          labelText = feature.properties.WADMKK || feature.properties.WADMKC || feature.properties.WADMKD || feature.properties.name || 'Wilayah'
          popupTitle = feature.properties.WADMKK || feature.properties.WADMKC || feature.properties.WADMKD || feature.properties.name || 'Wilayah'
        }
        
        // Add popup with boundary information
        const popupContent = `
          <div class="p-2">
            <h3 class="font-semibold text-blue-600 mb-2">${popupTitle}</h3>
            <p class="text-sm mb-1"><strong>Provinsi:</strong> ${feature.properties.WADMPR || feature.properties.province || 'Jawa Tengah'}</p>
            <p class="text-sm mb-1"><strong>Luas:</strong> ${feature.properties.Shape_Area ? (feature.properties.Shape_Area * 100).toFixed(2) : 'N/A'} km²</p>
            <p class="text-sm mb-1"><strong>Panjang Batas:</strong> ${feature.properties.Shape_Leng ? (feature.properties.Shape_Leng * 100).toFixed(2) : 'N/A'} km</p>
            <p class="text-sm"><strong>Deskripsi:</strong> Batas administratif</p>
          </div>
        `
        polygon.bindPopup(popupContent)
        
        newLayer.addLayer(polygon)

        // Add label if enabled - Using improved label positioning
          if (settings.showLabels && labelText) {
            // Use the findBestLabelPosition function to get a better position
            const bestPosition = findBestLabelPosition(polygon, labelText, settings)
            
            // Add a much smaller random offset to prevent labels from overlapping exactly
            const offsetLat = (Math.random() - 0.5) * 0.0001 // Smaller offset
            const offsetLng = (Math.random() - 0.5) * 0.0001
            const adjustedPosition = L.latLng(bestPosition.lat + offsetLat, bestPosition.lng + offsetLng)
          
          const labelHtml = `
            <div class="boundary-label" style="
              color: ${settings.labelColor};
              font-size: ${settings.labelSize}px;
              font-weight: ${settings.labelBold ? 'bold' : 'normal'};
              text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
              background: rgba(255, 255, 255, 0.8);
              padding: 2px 6px;
              border-radius: 3px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
              border: none;
              text-align: center;
              white-space: nowrap;
              pointer-events: none;
              display: flex;
              align-items: center;
              justify-content: center;
              transform: translate(-50%, -50%);
              position: relative;
              z-index: 1000;
            ">
              ${labelText}
            </div>
          `
          const labelIcon = L.divIcon({
            className: 'boundary-label-container',
            html: labelHtml,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
          })
          
          const labelMarker = L.marker(adjustedPosition, { icon: labelIcon })
          newLayer.addLayer(labelMarker)
        }
      } else if (feature.geometry.type === 'MultiPolygon') {
        // Handle MultiPolygon geometry
        // Determine label text based on boundary type first (only once per feature)
        let labelText = ''
        let popupTitle = ''
        
        if (boundaryType === 'kota') {
          labelText = feature.properties.WADMKK || 'Kota'
          popupTitle = feature.properties.WADMKK || 'Kota'
        } else if (boundaryType === 'kecamatan') {
          labelText = feature.properties.WADMKC || 'Kecamatan'
          popupTitle = feature.properties.WADMKC || 'Kecamatan'
        } else if (boundaryType === 'kelurahan') {
          labelText = feature.properties.WADMKD || 'Kelurahan'
          popupTitle = feature.properties.WADMKD || 'Kelurahan'
        } else {
          // Fallback for unknown boundary type
          labelText = feature.properties.WADMKK || feature.properties.WADMKC || feature.properties.WADMKD || feature.properties.name || 'Wilayah'
          popupTitle = feature.properties.WADMKK || feature.properties.WADMKC || feature.properties.WADMKD || feature.properties.name || 'Wilayah'
        }
        
        // Create a FeatureGroup to hold all polygons for this MultiPolygon feature
        const multiPolygonGroup = L.featureGroup()
        
        // Add all polygon parts to the group
        feature.geometry.coordinates.forEach((polygonCoords: number[][][]) => {
          polygonCoords.forEach((ring: number[][]) => {
            // Convert 3D coordinates to 2D and swap lat/lng
            const coordinates = ring.map((coord: number[]) => [coord[1], coord[0]] as [number, number])
            const polygon = L.polygon(coordinates, {
              color: settings.borderColor,
              weight: settings.borderWidth,
              fillColor: settings.hollow ? 'transparent' : settings.fillColor,
              fillOpacity: settings.hollow ? 0 : settings.fillOpacity,
              opacity: settings.borderOpacity
            })
            
            // Add popup with boundary information
            const popupContent = `
              <div class="p-2">
                <h3 class="font-semibold text-blue-600 mb-2">${popupTitle}</h3>
                <p class="text-sm mb-1"><strong>Provinsi:</strong> ${feature.properties.WADMPR || feature.properties.province || 'Jawa Tengah'}</p>
                <p class="text-sm mb-1"><strong>Luas:</strong> ${feature.properties.Shape_Area ? (feature.properties.Shape_Area * 100).toFixed(2) : 'N/A'} km²</p>
                <p class="text-sm mb-1"><strong>Panjang Batas:</strong> ${feature.properties.Shape_Leng ? (feature.properties.Shape_Leng * 100).toFixed(2) : 'N/A'} km</p>
                <p class="text-sm"><strong>Deskripsi:</strong> Batas administratif</p>
              </div>
            `
            polygon.bindPopup(popupContent)
            
            // Add polygon to the group
            multiPolygonGroup.addLayer(polygon)
          })
        })
        
        // Add the entire group to the main layer
        newLayer.addLayer(multiPolygonGroup)
        
        // Add only ONE label for the entire MultiPolygon feature
        if (settings.showLabels && labelText) {
          // Get bounds of the entire MultiPolygon group
          const bounds = multiPolygonGroup.getBounds()
          const center = bounds.getCenter()
          
          // Find the largest polygon in the MultiPolygon to use for label positioning
          let largestPolygon: L.Polygon | null = null
          let maxArea = 0
          
          multiPolygonGroup.eachLayer((layer: any) => {
            if (layer instanceof L.Polygon) {
              const layerBounds = layer.getBounds()
              const area = (layerBounds.getNorth() - layerBounds.getSouth()) * (layerBounds.getEast() - layerBounds.getWest())
              if (area > maxArea) {
                maxArea = area
                largestPolygon = layer
              }
            }
          })
          
          // Use the largest polygon for finding the best label position
          let bestPosition = center
          if (largestPolygon) {
            const betterPosition = findBestLabelPosition(largestPolygon, labelText, settings)
            if (betterPosition) {
              bestPosition = betterPosition
            }
          }
          
          // Add a much smaller random offset to prevent labels from overlapping exactly
          const offsetLat = (Math.random() - 0.5) * 0.0001 // Smaller offset
          const offsetLng = (Math.random() - 0.5) * 0.0001
          const adjustedPosition = L.latLng(bestPosition.lat + offsetLat, bestPosition.lng + offsetLng)
          
          const labelHtml = `
            <div class="boundary-label" style="
              color: ${settings.labelColor};
              font-size: ${settings.labelSize}px;
              font-weight: ${settings.labelBold ? 'bold' : 'normal'};
              text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
              background: rgba(255, 255, 255, 0.8);
              padding: 2px 6px;
              border-radius: 3px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
              border: none;
              text-align: center;
              white-space: nowrap;
              pointer-events: none;
              display: flex;
              align-items: center;
              justify-content: center;
              transform: translate(-50%, -50%);
              position: relative;
              z-index: 1000;
            ">
              ${labelText}
            </div>
          `
          const labelIcon = L.divIcon({
            className: 'boundary-label-container',
            html: labelHtml,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
          })
          
          const labelMarker = L.marker(adjustedPosition, { icon: labelIcon })
          newLayer.addLayer(labelMarker)
        }
      }
    })
    
    mapInstanceRef.current.addLayer(newLayer)
    setLayerRef(newLayer)
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
        type: accident.jenis === "Fatal" ? "fatal" : (accident.jenis === "Luka-luka" ? "injury" : "damage"),
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

  // Load boundary data on component mount
  useEffect(() => {
    loadBoundaryData('/geojson/surakarta-boundary.geojson', setBoundaryKotaData)
    loadBoundaryData('/geojson/Kecamatan_Solo.geojson', setBoundaryKecamatanData)
    loadBoundaryData('/geojson/Desa_Solo.geojson', setBoundaryKelurahanData)
  }, [])

  // Default symbology settings
  const defaultKotaSettings: SymbologySettings = {
    fillColor: '#3b82f6',
    borderColor: '#3b82f6',
    borderWidth: 2,
    fillOpacity: 0.3,
    borderOpacity: 0.8,
    hollow: false,
    showLabels: true,
    labelColor: '#3b82f6',
    labelSize: 12,
    labelBold: false
  }

  const defaultKecamatanSettings: SymbologySettings = {
    fillColor: '#16a34a',
    borderColor: '#16a34a',
    borderWidth: 2,
    fillOpacity: 0.3,
    borderOpacity: 0.8,
    hollow: false,
    showLabels: true,
    labelColor: '#16a34a',
    labelSize: 10,
    labelBold: false
  }

  const defaultKelurahanSettings: SymbologySettings = {
    fillColor: '#ca8a04',
    borderColor: '#ca8a04',
    borderWidth: 2,
    fillOpacity: 0.3,
    borderOpacity: 0.8,
    hollow: false,
    showLabels: true,
    labelColor: '#ca8a04',
    labelSize: 9,
    labelBold: false
  }

  // Handle boundary layer visibility changes
  useEffect(() => {
    if (showBoundaryKota && boundaryKotaData && mapInstanceRef.current) {
      const settings = boundaryKotaSettings || defaultKotaSettings
              renderBoundaryLayer(boundaryKotaData, settings, boundaryKotaLayer, setBoundaryKotaLayer, 'kota')
    } else if (!showBoundaryKota && boundaryKotaLayer && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(boundaryKotaLayer)
      setBoundaryKotaLayer(null)
    }
  }, [showBoundaryKota, boundaryKotaData, boundaryKotaSettings])

  // Handle kecamatan boundary layer visibility changes
  useEffect(() => {
    if (showBoundaryKecamatan && boundaryKecamatanData && mapInstanceRef.current) {
      const settings = boundaryKecamatanSettings || defaultKecamatanSettings
              renderBoundaryLayer(boundaryKecamatanData, settings, boundaryKecamatanLayer, setBoundaryKecamatanLayer, 'kecamatan')
    } else if (!showBoundaryKecamatan && boundaryKecamatanLayer && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(boundaryKecamatanLayer)
      setBoundaryKecamatanLayer(null)
    }
  }, [showBoundaryKecamatan, boundaryKecamatanData, boundaryKecamatanSettings])

  // Handle kelurahan boundary layer visibility changes
  useEffect(() => {
    if (showBoundaryKelurahan && boundaryKelurahanData && mapInstanceRef.current) {
      const settings = boundaryKelurahanSettings || defaultKelurahanSettings
              renderBoundaryLayer(boundaryKelurahanData, settings, boundaryKelurahanLayer, setBoundaryKelurahanLayer, 'kelurahan')
    } else if (!showBoundaryKelurahan && boundaryKelurahanLayer && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(boundaryKelurahanLayer)
      setBoundaryKelurahanLayer(null)
    }
  }, [showBoundaryKelurahan, boundaryKelurahanData, boundaryKelurahanSettings])

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
        color = jenis === "Fatal" || jenis === "fatal" ? "#ef4444" : (jenis === "Luka-luka" || jenis === "injury" ? "#f97316" : "#eab308")
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
      

      

      
      {/* Map Controls - Left Side */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        {/* Fullscreen Button */}
        <FullscreenButton targetRef={mapRef} />

        {/* Symbology Settings */}
        <SymbologySettingsComponent
          boundarySettings={{
            kota: boundaryKotaSettings || defaultKotaSettings,
            kecamatan: boundaryKecamatanSettings || defaultKecamatanSettings,
            kelurahan: boundaryKelurahanSettings || defaultKelurahanSettings
          }}
          boundaryVisibility={{
            kota: showBoundaryKota,
            kecamatan: showBoundaryKecamatan,
            kelurahan: showBoundaryKelurahan
          }}
          onSettingsChange={(type, settings) => onBoundarySettingsChange?.(type, settings)}
          onVisibilityChange={(type, visible) => {
            onVisibilityChange?.(type, visible)
          }}
        />
      </div>

      {/* Base Map Selector - Top Right */}
      <div className="absolute top-4 right-4 z-[1000]">
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
                    {currentZoom >= 18 ? "Detail Tinggi" : (currentZoom >= 15 ? "Detail Menengah" : (currentZoom >= 12 ? "Detail Rendah" : "Area Luas"))}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Max: {baseMaps[selectedBaseMap as keyof typeof baseMaps]?.maxZoom || 22}x
                  </div>
                  <div className="text-xs text-gray-400">
                    {selectedBaseMap === 'osm' ? 'OSM' : (selectedBaseMap === 'satellite' ? 'Satellite' : (selectedBaseMap === 'streets' ? 'Google Streets' : 'OSM'))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Google Maps URL Input - Compact for Report Page */}
      {!isCompact ? (
        <div className="absolute top-4 right-4 z-[1000]" style={{ top: '280px' }}>
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
                      <p className="text-blue-100 text-xs">Koordinat & URL</p>
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
         className="absolute top-64 left-4 z-[1000] max-h-[calc(100vh-400px)] overflow-y-auto space-y-2 pr-2 custom-scrollbar"
         style={{
           scrollbarWidth: 'thin',
           scrollbarColor: '#d1d5db transparent',
           maxHeight: 'calc(100vh - 400px)'
         }}
       >
         {/* Accidents Legend */}
         {selectedLayers.accidents && (
           <Card className="bg-white/90 backdrop-blur-sm shadow-lg flex-shrink-0">
             <CardContent className="p-1.5">
               <h4 className="font-semibold text-gray-900 mb-1 text-xs flex items-center">
                 <CarAccident className="w-3 h-3 mr-1 text-red-500" />
                 Data Kecelakaan
               </h4>
               <div className="space-y-0.5 text-xs">
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                   <span>Fatal</span>
                 </div>
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                   <span>Luka-luka</span>
                 </div>
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                   <span>Kerusakan</span>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}

         {/* Infrastructure Legend */}
         {selectedLayers.infrastructure && (
           <Card className="bg-white/90 backdrop-blur-sm shadow-lg flex-shrink-0">
             <CardContent className="p-1.5">
               <h4 className="font-semibold text-gray-900 mb-1 text-xs flex items-center">
                 <Settings className="w-3 h-3 mr-1 text-blue-500" />
                 Infrastruktur
               </h4>
               <div className="space-y-0.5 text-xs">
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
                   <span>🚦 Lampu Lalu Lintas</span>
                 </div>
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
                   <span>🚧 Rambu Lalu Lintas</span>
                 </div>
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
                   <span>📹 CCTV</span>
                 </div>
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
                   <span>🌉 Jembatan</span>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}

         {/* Facilities Legend */}
         {selectedLayers.facilities && (
           <Card className="bg-white/90 backdrop-blur-sm shadow-lg flex-shrink-0">
             <CardContent className="p-1.5">
               <h4 className="font-semibold text-gray-900 mb-1 text-xs flex items-center">
                 <Building2 className="w-3 h-3 mr-1 text-green-500" />
                 Fasilitas Umum
               </h4>
               <div className="space-y-0.5 text-xs">
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
                   <span>🏥 Rumah Sakit</span>
                 </div>
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
                   <span>👮 Kantor Polisi</span>
                 </div>
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
                   <span>🚒 Pemadam Kebakaran</span>
                 </div>
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
                   <span>🏫 Sekolah</span>
                 </div>
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
                   <span>⛽ SPBU</span>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}

         {/* Reports Legend */}
         {selectedLayers.reports && (
           <Card className="bg-white/90 backdrop-blur-sm shadow-lg flex-shrink-0">
             <CardContent className="p-1.5">
               <h4 className="font-semibold text-gray-900 mb-1 text-xs flex items-center">
                 <Report className="w-3 h-3 mr-1 text-amber-500" />
                 Laporan Masyarakat
               </h4>
               <div className="space-y-0.5 text-xs">
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
                   <span>📍 Pending</span>
                 </div>
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                   <span>🔄 Diproses</span>
                 </div>
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                   <span>✅ Selesai</span>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}

         {/* Blackspots Legend */}
         {selectedLayers.blackspots && (
           <Card className="bg-white/90 backdrop-blur-sm shadow-lg flex-shrink-0">
             <CardContent className="p-1.5">
               <h4 className="font-semibold text-gray-900 mb-1 text-xs flex items-center">
                 <AlertOctagon className="w-3 h-3 mr-1 text-red-600" />
                 Blackspot
               </h4>
               <div className="space-y-0.5 text-xs">
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
                   <span>⚠️ Blackspot Aktif</span>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}

         {/* Boundary Legend */}
         {showBoundaryKota && (
           <Card className="bg-white/90 backdrop-blur-sm shadow-lg flex-shrink-0">
             <CardContent className="p-1.5">
               <h4 className="font-semibold text-blue-700 mb-1 text-xs flex items-center">
                 <MapPin className="w-3 h-3 mr-1 text-blue-600" />
                 Batas Kota
               </h4>
               <div className="space-y-0.5 text-xs">
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></div>
                   <span>🔵 Batas Kota Surakarta</span>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}

         {/* Kecamatan Boundary Legend */}
         {showBoundaryKecamatan && (
           <Card className="bg-white/90 backdrop-blur-sm shadow-lg flex-shrink-0">
             <CardContent className="p-1.5">
               <h4 className="font-semibold text-green-700 mb-1 text-xs flex items-center">
                 <MapPin className="w-3 h-3 mr-1 text-green-600" />
                 Batas Kecamatan
               </h4>
               <div className="space-y-0.5 text-xs">
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-green-600 rounded-sm"></div>
                   <span>🟢 Batas Kecamatan</span>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}

         {/* Kelurahan Boundary Legend */}
         {showBoundaryKelurahan && (
           <Card className="bg-white/90 backdrop-blur-sm shadow-lg flex-shrink-0">
             <CardContent className="p-1.5">
               <h4 className="font-semibold text-yellow-700 mb-1 text-xs flex items-center">
                 <MapPin className="w-3 h-3 mr-1 text-yellow-600" />
                 Batas Kelurahan
               </h4>
               <div className="space-y-0.5 text-xs">
                 <div className="flex items-center space-x-1.5">
                   <div className="w-2.5 h-2.5 bg-yellow-600 rounded-sm"></div>
                   <span>🟡 Batas Kelurahan</span>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}
       </div>
     </div>
   )
}

// Export as client-only component with proper error handling
const Map = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

export default Map