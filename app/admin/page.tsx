"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
    FileSpreadsheet, 
  Map, 
  Calendar, 
  MapPin, 
  Car, 
  Truck,
  BikeIcon,
  Bus,
  Bike,
  Users as UsersIcon, 
  FileText, 
  Settings, 
  CheckCircle, 
  Wrench, 
  XCircle, 
  Heart, 
  Clock, 
  Loader2, 
  Shield,
  Save,
  X,
  AlertTriangle,
  Construction,
  Building,
  MessageSquare,
  Users,
  AlertCircle,
  AlertOctagon,
  Target,
  FileDown,
  Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useFirebase } from "@/hooks/useFirebase"
import { 
  exportToExcel, 
  exportToGeoJSON, 
  importFromExcel, 
  importFromGeoJSON,
  downloadExcelTemplate,
  downloadGeoJSONTemplate
} from "@/lib/import-export"
import { Modal } from "@/components/ui/modal"
import Link from "next/link"
import { LakonLogo } from "@/components/logo"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import AdminNavbar from "@/components/AdminNavbar"
import AdminRouteGuard from "@/components/AdminRouteGuard"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/toaster"

// All imports verified and working

// Interface for accident data
interface AccidentData {
  id?: string
  no: string
  tanggal: string
  lokasi: string
  jenis: "Fatal" | "Luka-luka" | "Kerusakan"
  kendaraan: string
  korban: string
  deskripsi: string
  lat: number
  long: number
}

// Interface for infrastructure data
interface InfrastructureData {
  id?: string
  no: string
  jenis: string
  lokasi: string
  status: "Aktif" | "Rusak" | "Dalam Perbaikan"
  deskripsi: string
  lat: number
  long: number
}

// Interface for facility data
interface FacilityData {
  id?: string
  no: string
  nama: string
  jenis: string
  lokasi: string
  status: "Aktif" | "Tidak Aktif" | "Dalam Renovasi"
  deskripsi: string
  lat: number
  long: number
}

// Interface for report data
interface ReportData {
  id?: string
  no: string
  kategori: "Rambu Rusak/Hilang" | "Marka Jalan Buram" | "Lampu Lalu Lintas Mati" | "Penerangan Kurang" | "Jalan Rusak/Berlubang" | "Potensi Kecelakaan" | "Parkir Liar"
  lokasi: string
  status: "Diterima" | "Dalam Peninjauan" | "Ditindaklanjuti" | "Selesai"
  pelapor: string
  tanggal: string
  deskripsi: string
  lat: number
  long: number
}

interface BlackspotData {
  id?: string
  no: string
  lokasi: string
  jenis: "Blackspot" | "Potential Blackspot"
  totalKecelakaan: string
  deskripsi: string
  lat: number
  long: number
}

// Interface for user data
interface UserData {
  id: string
  nama: string
  email: string
  role: string
  status: "active" | "inactive"
  lastLogin: string
}

export default function AdminPage() {
  // State management for admin panel
  const [activeTab, setActiveTab] = useState("accidents")
  const [selectedModal, setSelectedModal] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [cardFilter, setCardFilter] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<any>(null)
  const [importing, setImporting] = useState(false)
  const [renumbering, setRenumbering] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showRenumberConfirm, setShowRenumberConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [bulkProcessing, setBulkProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Data states for each tab
  const [accidentData, setAccidentData] = useState<AccidentData[]>([])
  const [infrastructureData, setInfrastructureData] = useState<InfrastructureData[]>([])
  const [facilityData, setFacilityData] = useState<FacilityData[]>([])
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [blackspotData, setBlackspotData] = useState<BlackspotData[]>([])
  const [userData, setUserData] = useState<UserData[]>([])

  const tabs = [
    { id: "accidents", label: "Kecelakaan", icon: AlertTriangle, color: "text-red-400" },
    { id: "infrastructure", label: "Infrastruktur", icon: Construction, color: "text-blue-400" },
    { id: "facilities", label: "Fasilitas Umum", icon: Building, color: "text-green-400" },
    { id: "reports", label: "Laporan Masyarakat", icon: MessageSquare, color: "text-amber-400" },
    { id: "blackspots", label: "Blackspot", icon: AlertCircle, color: "text-orange-400" },
    { id: "users", label: "Manajemen User", icon: Users, color: "text-purple-400" },
  ]

  // Firebase hooks for all collections with unique keys
  const { 
    data: firebaseAccidents, 
    loading: accidentLoading, 
    error: accidentError, 
    addData: addAccident, 
    updateData: updateAccident, 
    deleteData: deleteAccident 
  } = useFirebase("accidents")

  const { 
    data: firebaseInfrastructure, 
    loading: infrastructureLoading, 
    error: infrastructureError, 
    addData: addInfrastructure, 
    updateData: updateInfrastructure, 
    deleteData: deleteInfrastructure 
  } = useFirebase("infrastructure")

  const { 
    data: firebaseFacilities, 
    loading: facilitiesLoading, 
    error: facilitiesError, 
    addData: addFacility, 
    updateData: updateFacility, 
    deleteData: deleteFacility 
  } = useFirebase("facilities")

  const { 
    data: firebaseReports, 
    loading: reportsLoading, 
    error: reportsError, 
    addData: addReport, 
    updateData: updateReport, 
    deleteData: deleteReport 
  } = useFirebase("reports")

  const { 
    data: firebaseBlackspots, 
    loading: blackspotsLoading, 
    error: blackspotsError, 
    addData: addBlackspot, 
    updateData: updateBlackspot, 
    deleteData: deleteBlackspot 
  } = useFirebase("blackspots")

  const { 
    data: firebaseUsers, 
    loading: usersLoading, 
    error: usersError, 
    addData: addUser, 
    updateData: updateUser, 
    deleteData: deleteUser 
  } = useFirebase("users")

  // Reset data when tab changes to prevent data mixing
  useEffect(() => {
    console.log(`Tab changed to: ${activeTab}`)
    console.log(`Accident data length: ${firebaseAccidents.length}`)
    console.log(`Infrastructure data length: ${firebaseInfrastructure.length}`)
    console.log(`Facilities data length: ${firebaseFacilities.length}`)
    console.log(`Reports data length: ${firebaseReports.length}`)
    console.log(`Blackspots data length: ${firebaseBlackspots.length}`)
    console.log(`Users data length: ${firebaseUsers.length}`)
    
    // Reset selection when tab changes
    setSelectedItems([])
    setSelectAll(false)
  }, [activeTab, firebaseAccidents, firebaseInfrastructure, firebaseFacilities, firebaseReports, firebaseBlackspots, firebaseUsers])

  // Update local state when Firebase data changes
  useEffect(() => {
    console.log('Setting accident data:', firebaseAccidents)
    setAccidentData(firebaseAccidents as AccidentData[])
  }, [firebaseAccidents])

  useEffect(() => {
    console.log('Setting infrastructure data:', firebaseInfrastructure)
    setInfrastructureData(firebaseInfrastructure as InfrastructureData[])
  }, [firebaseInfrastructure])

  useEffect(() => {
    console.log('Setting facilities data:', firebaseFacilities)
    setFacilityData(firebaseFacilities as FacilityData[])
  }, [firebaseFacilities])

  useEffect(() => {
    console.log('Setting reports data:', firebaseReports)
    setReportData(firebaseReports as ReportData[])
  }, [firebaseReports])

  useEffect(() => {
    console.log('Setting blackspots data:', firebaseBlackspots)
    setBlackspotData(firebaseBlackspots as BlackspotData[])
  }, [firebaseBlackspots])

  useEffect(() => {
    console.log('Setting users data:', firebaseUsers)
    setUserData(firebaseUsers as UserData[])
  }, [firebaseUsers])

  // Get current data based on active tab
  const getCurrentData = () => {
    console.log(`Getting data for tab: ${activeTab}`)
    let data: any[] = []
    
    switch (activeTab) {
      case "accidents":
        data = accidentData
        console.log(`Accident data:`, data)
        break
      case "infrastructure":
        data = infrastructureData
        console.log(`Infrastructure data:`, data)
        break
      case "facilities":
        data = facilityData
        console.log(`Facilities data:`, data)
        break
      case "reports":
        data = reportData
        console.log(`Reports data:`, data)
        break
      case "blackspots":
        data = blackspotData
        console.log(`Blackspots data:`, data)
        break
      case "users":
        data = userData
        console.log(`Users data:`, data)
        break
      default:
        data = []
    }
    
    // Sort data by 'no' field in ascending order for all data types except users
    if (activeTab !== 'users') {
      data = data.sort((a, b) => {
        const aNum = parseInt(a.no) || 0
        const bNum = parseInt(b.no) || 0
        return aNum - bNum
      })
    }
    
    console.log(`Returning ${data.length} items for ${activeTab}`)
    return data
  }

  // Get unique vehicle types from accident data
  const getVehicleTypes = () => {
    if (activeTab !== "accidents" || !firebaseAccidents) return []
    
    const vehicleTypes = new Set<string>()
    
    firebaseAccidents.forEach((accident: any) => {
      if (accident.kendaraan) {
        // Split by comma and trim each vehicle type
        const vehicles = accident.kendaraan.split(',').map((v: string) => v.trim())
        vehicles.forEach((vehicle: string) => {
          if (vehicle) {
            vehicleTypes.add(vehicle)
          }
        })
      }
    })
    
    return Array.from(vehicleTypes).sort()
  }

  // Get accident count for specific vehicle type
  const getAccidentCountByVehicle = (vehicleType: string) => {
    if (activeTab !== "accidents" || !firebaseAccidents) return 0
    
    return firebaseAccidents.filter((accident: any) => {
      if (!accident.kendaraan) return false
      const vehicles = accident.kendaraan.split(',').map((v: string) => v.trim())
      return vehicles.includes(vehicleType)
    }).length
  }

  // Get vehicle icon based on vehicle type
  const getVehicleIcon = (vehicleType: string) => {
    const vehicleLower = vehicleType.toLowerCase()
    
    if (vehicleLower.includes('motor') || vehicleLower.includes('sepeda motor')) {
      return BikeIcon
    } else if (vehicleLower.includes('mobil') || vehicleLower.includes('car') || 
               vehicleLower.includes('sedan') || vehicleLower.includes('suv')) {
      return Car
    } else if (vehicleLower.includes('truk') || vehicleLower.includes('truck') || 
               vehicleLower.includes('pickup')) {
      return Truck
    } else if (vehicleLower.includes('bus') || vehicleLower.includes('minibus')) {
      return Bus
    } else if (vehicleLower.includes('becak') || vehicleLower.includes('pedicab')) {
      return Bike
    } else {
      return Car // Default icon
    }
  }

  // Get vehicle color based on vehicle type
  const getVehicleColor = (vehicleType: string) => {
    const vehicleLower = vehicleType.toLowerCase()
    
    if (vehicleLower.includes('motor') || vehicleLower.includes('sepeda motor')) {
      return 'text-orange-400'
    } else if (vehicleLower.includes('mobil') || vehicleLower.includes('car') || 
               vehicleLower.includes('sedan') || vehicleLower.includes('suv')) {
      return 'text-blue-400'
    } else if (vehicleLower.includes('truk') || vehicleLower.includes('truck') || 
               vehicleLower.includes('pickup')) {
      return 'text-red-400'
    } else if (vehicleLower.includes('bus') || vehicleLower.includes('minibus')) {
      return 'text-green-400'
    } else if (vehicleLower.includes('becak') || vehicleLower.includes('pedicab')) {
      return 'text-yellow-400'
    } else {
      return 'text-purple-400' // Default color for other vehicles
    }
  }

  // Reset search and filter when tab changes
  useEffect(() => {
    setSearchTerm("")
    setFilterStatus("all")
    setCardFilter(null)
    setSelectedModal(null)
    setSelectedItem(null)
    setIsEditing(false)
    setEditForm(null)
  }, [activeTab])

  // Get current filter options based on active tab
  const getFilterOptions = () => {
    switch (activeTab) {
      case "accidents":
        return [
          { value: "all", label: "Semua Jenis" },
          { value: "Fatal", label: "Fatal" },
          { value: "Luka-luka", label: "Luka-luka" },
          { value: "Kerusakan", label: "Kerusakan" }
        ]
      case "infrastructure":
        return [
          { value: "all", label: "Semua Status" },
          { value: "Aktif", label: "Aktif" },
          { value: "Rusak", label: "Rusak" },
          { value: "Dalam Perbaikan", label: "Dalam Perbaikan" }
        ]
      case "facilities":
        return [
          { value: "all", label: "Semua Status" },
          { value: "Aktif", label: "Aktif" },
          { value: "Tidak Aktif", label: "Tidak Aktif" },
          { value: "Dalam Renovasi", label: "Dalam Renovasi" }
        ]
      case "reports":
        return [
          { value: "all", label: "Semua Status" },
          { value: "Diterima", label: "Diterima" },
          { value: "Dalam Peninjauan", label: "Dalam Peninjauan" },
          { value: "Ditindaklanjuti", label: "Ditindaklanjuti" },
          { value: "Selesai", label: "Selesai" }
        ]
      case "blackspots":
        return [
          { value: "all", label: "Semua Jenis" },
          { value: "Blackspot", label: "Blackspot" },
          { value: "Potential Blackspot", label: "Potential Blackspot" }
        ]
      case "users":
        return [
          { value: "all", label: "Semua Status" },
          { value: "active", label: "Aktif" },
          { value: "inactive", label: "Tidak Aktif" }
        ]
      default:
        return []
    }
  }

  const currentData = getCurrentData()
  console.log(`Current tab: ${activeTab}, Data length: ${currentData.length}`)
  if (currentData.length > 0) {
    console.log(`Sample data for ${activeTab}:`, currentData[0])
    console.log(`Sample data ID:`, currentData[0]?.id)
    
    // Check for duplicate IDs
    const ids = currentData.map(item => item.id).filter(Boolean)
    const uniqueIds = [...new Set(ids)]
    if (ids.length !== uniqueIds.length) {
      console.warn(`⚠️ Duplicate IDs found in ${activeTab}:`, ids.filter((id, index) => ids.indexOf(id) !== index))
    }
  }
  
  const filteredData = currentData.filter((item) => {
    const matchesSearch = searchTerm === "" || 
      Object.values(item).some(value => 
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    let matchesFilter = true
    if (activeTab === "accidents") {
      const accidentItem = item as AccidentData
      
      // Check if filterStatus is a vehicle type (not a standard accident type)
      const vehicleTypes = getVehicleTypes()
      if (vehicleTypes.includes(filterStatus)) {
        // Filter by vehicle type
        if (!accidentItem.kendaraan) {
          matchesFilter = false
        } else {
          const vehicles = accidentItem.kendaraan.split(',').map((v: string) => v.trim())
          matchesFilter = vehicles.includes(filterStatus)
        }
      } else {
        // Filter by accident type (Fatal, Luka-luka, Kerusakan)
        matchesFilter = filterStatus === "all" || accidentItem.jenis === filterStatus
      }
    } else if (activeTab === "blackspots") {
      const blackspotItem = item as BlackspotData
      matchesFilter = filterStatus === "all" || blackspotItem.jenis === filterStatus
    } else if (activeTab === "users") {
      const userItem = item as UserData
      matchesFilter = filterStatus === "all" || userItem.status === filterStatus
    } else {
      const otherItem = item as InfrastructureData | FacilityData | ReportData
      matchesFilter = filterStatus === "all" || otherItem.status === filterStatus
    }
    
    return matchesSearch && matchesFilter
  })

  const openModal = (modalType: string, item?: any) => {
    console.log('🔍 openModal called')
    console.log('modalType:', modalType)
    console.log('item:', item)
    console.log('item.id:', item?.id)
    
    setSelectedModal(modalType)
    setSelectedItem(item || null)
    
    if (modalType === "edit") {
      setIsEditing(true)
      setEditForm(item || null)
    } else {
      setIsEditing(false)
      setEditForm(item || null)
    }
  }

  const closeModal = () => {
    setSelectedModal(null)
    setSelectedItem(null)
    setIsEditing(false)
    setEditForm(null)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    console.log('🔍 handleSave called')
    console.log('editForm:', editForm)
    console.log('selectedItem:', selectedItem)
    console.log('activeTab:', activeTab)
    
    if (editForm && selectedItem) {
      if (!selectedItem.id) {
        console.error('❌ No ID found in selectedItem')
        return
      }
      
      console.log('✅ selectedItem.id:', selectedItem.id)
      
      // Remove id field from editForm to avoid conflicts
      const { id, ...updateData } = editForm as any
      console.log('📝 updateData:', updateData)
      
      try {
        console.log(`🔄 Updating ${activeTab} with ID:`, selectedItem.id)
        
        switch (activeTab) {
          case "accidents":
            await updateAccident(selectedItem.id, updateData)
            break
          case "infrastructure":
            await updateInfrastructure(selectedItem.id, updateData)
            break
          case "facilities":
            await updateFacility(selectedItem.id, updateData)
            break
                case "reports":
        await updateReport(selectedItem.id, updateData)
        break
      case "blackspots":
        await updateBlackspot(selectedItem.id, updateData)
        break
      case "users":
        await updateUser(selectedItem.id, updateData)
        break
        }
        console.log('✅ Update successful!')
        setIsEditing(false)
        closeModal()
      } catch (error) {
        console.error('❌ Error updating data:', error)
      }
    } else {
      console.log('❌ Missing editForm or selectedItem')
    }
  }

  // Function to renumber all data after deletion
  const renumberData = async () => {
    console.log('Starting renumber process...')
    
    // Wait longer for Firebase to update and force refresh
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Force refresh data from Firebase
    try {
      switch (activeTab) {
        case "accidents":
          // Force refresh by calling getData again
          await new Promise(resolve => setTimeout(resolve, 500))
          break
        case "infrastructure":
          await new Promise(resolve => setTimeout(resolve, 500))
          break
        case "facilities":
          await new Promise(resolve => setTimeout(resolve, 500))
          break
        case "reports":
          await new Promise(resolve => setTimeout(resolve, 500))
          break
        case "blackspots":
          await new Promise(resolve => setTimeout(resolve, 500))
          break
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
    
    const currentData = getCurrentData()
    console.log('Current data before renumbering:', currentData)
    
    if (currentData.length === 0) {
      console.log('No data to renumber')
      return
    }

    try {
      // Sort data by current number to ensure proper renumbering
      const sortedData = currentData.sort((a, b) => {
        const aNum = parseInt(a.no) || 0
        const bNum = parseInt(b.no) || 0
        return aNum - bNum
      })
      
      console.log('Sorted data:', sortedData)

      // Renumber all data sequentially
      for (let i = 0; i < sortedData.length; i++) {
        const newNumber = String(i + 1).padStart(3, '0')
        const item = sortedData[i]
        
        console.log(`Checking item ${item.no} -> should be ${newNumber}`)
        
        if (item.no !== newNumber) {
          console.log(`Renumbering ${item.no} to ${newNumber}`)
          const updatedItem = { ...item, no: newNumber }
          
          switch (activeTab) {
            case "accidents":
              await updateAccident(item.id!, updatedItem)
              break
            case "infrastructure":
              await updateInfrastructure(item.id!, updatedItem)
              break
            case "facilities":
              await updateFacility(item.id!, updatedItem)
              break
            case "reports":
              await updateReport(item.id!, updatedItem)
              break
            case "blackspots":
              await updateBlackspot(item.id!, updatedItem)
              break
          }
          
          // Add small delay between updates
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      console.log('Data renumbered successfully')
    } catch (error) {
      console.error('Error renumbering data:', error)
    }
  }

  const handleDelete = async (id: string) => {
    setItemToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    
    try {
      console.log(`Deleting item with id: ${itemToDelete} from tab: ${activeTab}`)
      
      switch (activeTab) {
        case "accidents":
          await deleteAccident(itemToDelete)
          break
        case "infrastructure":
          await deleteInfrastructure(itemToDelete)
          break
        case "facilities":
          await deleteFacility(itemToDelete)
          break
        case "reports":
          await deleteReport(itemToDelete)
          break
        case "blackspots":
          await deleteBlackspot(itemToDelete)
          break
        case "users":
          await deleteUser(itemToDelete)
          break
      }
      
      console.log('Item deleted successfully, starting renumber process...')
      
      // Renumber data after deletion (except for users)
      if (activeTab !== 'users') {
        await renumberData()
      }
      
      setShowDeleteConfirm(false)
      setItemToDelete(null)
      toast.success("Data berhasil dihapus!")
    } catch (error) {
      console.error('Error deleting data:', error)
      toast.error("Gagal menghapus data!")
    }
  }

  const handleAddNew = () => {
    const currentData = getCurrentData()
    const nextNo = String(currentData.length + 1).padStart(3, '0')
    
    switch (activeTab) {
      case "accidents":
        setEditForm({
          no: nextNo,
          tanggal: "",
          lokasi: "",
          jenis: "Luka-luka",
          kendaraan: "",
          korban: "",
          deskripsi: "",
          lat: 0,
          long: 0
        })
        break
      case "infrastructure":
        setEditForm({
          no: nextNo,
          jenis: "",
          lokasi: "",
          status: "Aktif",
          deskripsi: "",
          lat: 0,
          long: 0
        })
        break
      case "facilities":
        setEditForm({
          no: nextNo,
          nama: "",
          jenis: "",
          lokasi: "",
          status: "Aktif",
          deskripsi: "",
          lat: 0,
          long: 0
        })
        break
      case "reports":
        setEditForm({
          no: nextNo,
          kategori: "Rambu Rusak/Hilang",
          lokasi: "",
          status: "Diterima",
          pelapor: "",
          tanggal: "",
          deskripsi: "",
          lat: 0,
          long: 0
        })
        break
      case "blackspots":
        setEditForm({
          no: nextNo,
          lokasi: "",
          jenis: "Blackspot",
          deskripsi: "",
          lat: 0,
          long: 0
        })
        break
      case "users":
        setEditForm({
          nama: "",
          email: "",
          role: "user",
          status: "active",
          lastLogin: new Date().toISOString().split('T')[0]
        })
        break
    }
    setIsEditing(false)
    setSelectedModal("add")
  }

  const handleSaveNew = async () => {
    if (editForm) {
      try {
        switch (activeTab) {
          case "accidents":
            await addAccident(editForm)
            break
          case "infrastructure":
            await addInfrastructure(editForm)
            break
          case "facilities":
            await addFacility(editForm)
            break
                case "reports":
        await addReport(editForm)
        break
      case "blackspots":
        await addBlackspot(editForm)
        break
      case "users":
        await addUser(editForm)
        break
        }
        closeModal()
      } catch (error) {
        console.error('Error adding data:', error)
      }
    }
  }

  const handleExportExcel = async () => {
    try {
      const currentData = getCurrentData()
      const filename = `lakon_${activeTab}_${new Date().toISOString().split('T')[0]}`
      const success = exportToExcel(currentData, filename, activeTab)
      
      if (success) {
        toast.success("Data berhasil diexport ke Excel!")
      } else {
        toast.error("Gagal mengexport data!")
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error("Error saat export data!")
    }
  }

  const handleExportGeoJSON = async () => {
    try {
      const currentData = getCurrentData()
      const filename = `lakon_${activeTab}_${new Date().toISOString().split('T')[0]}`
      const success = exportToGeoJSON(currentData, filename)
      
      if (success) {
        toast.success("Data berhasil diexport ke GeoJSON!")
      } else {
        toast.error("Gagal mengexport data!")
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error("Error saat export data!")
    }
  }

  const handleImportExcel = () => {
    fileInputRef.current?.click()
  }

  const handleImportGeoJSON = () => {
    fileInputRef.current?.click()
  }

  const handleDownloadExcelTemplate = () => {
    const success = downloadExcelTemplate(activeTab)
    if (success) {
      toast.success("Template Excel berhasil didownload!")
    } else {
      toast.error("Gagal download template Excel!")
    }
  }

  const handleDownloadGeoJSONTemplate = () => {
    const success = downloadGeoJSONTemplate(activeTab)
    if (success) {
      toast.success("Template GeoJSON berhasil didownload!")
    } else {
      toast.error("Gagal download template GeoJSON!")
    }
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setBulkProcessing(true)
    setProcessingProgress({ current: 0, total: 0 })
    
    try {
      let importedData: any[] = []
      
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        importedData = await importFromExcel(file, currentData, activeTab)
      } else if (file.name.endsWith('.geojson') || file.name.endsWith('.json')) {
        importedData = await importFromGeoJSON(file, currentData, activeTab)
      } else {
        toast.error('Format file tidak didukung! Gunakan .xlsx, .xls, atau .geojson')
        return
      }

      console.log('Current data before import:', currentData)
      console.log('Imported data:', importedData)
      console.log('Active tab:', activeTab)

      setProcessingProgress({ current: 0, total: importedData.length })

      // Add imported data to Firebase with progress tracking
      switch (activeTab) {
        case "accidents":
          for (let i = 0; i < importedData.length; i++) {
            const item = importedData[i]
            console.log('Adding accident with number:', item.no)
            await addAccident(item)
            setProcessingProgress({ current: i + 1, total: importedData.length })
            await new Promise(resolve => setTimeout(resolve, 50))
          }
          toast.success(`Berhasil import ${importedData.length} data kecelakaan!`)
          break
        case "infrastructure":
          for (let i = 0; i < importedData.length; i++) {
            const item = importedData[i]
            console.log('Adding infrastructure with number:', item.no)
            await addInfrastructure(item)
            setProcessingProgress({ current: i + 1, total: importedData.length })
            await new Promise(resolve => setTimeout(resolve, 50))
          }
          toast.success(`Berhasil import ${importedData.length} data infrastruktur!`)
          break
        case "facilities":
          for (let i = 0; i < importedData.length; i++) {
            const item = importedData[i]
            console.log('Adding facility with number:', item.no)
            await addFacility(item)
            setProcessingProgress({ current: i + 1, total: importedData.length })
            await new Promise(resolve => setTimeout(resolve, 50))
          }
          toast.success(`Berhasil import ${importedData.length} data fasilitas!`)
          break
        case "reports":
          for (let i = 0; i < importedData.length; i++) {
            const item = importedData[i]
            console.log('Adding report with number:', item.no)
            await addReport(item)
            setProcessingProgress({ current: i + 1, total: importedData.length })
            await new Promise(resolve => setTimeout(resolve, 50))
          }
          toast.success(`Berhasil import ${importedData.length} data laporan!`)
          break
        case "blackspots":
          for (let i = 0; i < importedData.length; i++) {
            const item = importedData[i]
            console.log('Adding blackspot with number:', item.no)
            await addBlackspot(item)
            setProcessingProgress({ current: i + 1, total: importedData.length })
            await new Promise(resolve => setTimeout(resolve, 50))
          }
          toast.success(`Berhasil import ${importedData.length} data blackspot!`)
          break
        case "users":
          for (let i = 0; i < importedData.length; i++) {
            const item = importedData[i]
            console.log('Adding user:', item.nama)
            await addUser(item)
            setProcessingProgress({ current: i + 1, total: importedData.length })
            await new Promise(resolve => setTimeout(resolve, 50))
          }
          toast.success(`Berhasil import ${importedData.length} data user!`)
          break
        default:
          toast.error('Import untuk tab ini akan segera tersedia!')
      }
      
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Error saat import data!')
    } finally {
      setImporting(false)
      setBulkProcessing(false)
      setProcessingProgress({ current: 0, total: 0 })
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const getJenisColor = (jenis: string) => {
    switch (jenis) {
      case "Fatal":
        return "bg-red-500"
      case "Luka-luka":
        return "bg-orange-500"
      case "Kerusakan":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTabLabel = (tabId: string) => {
    switch (tabId) {
      case "accidents":
        return "Kecelakaan"
      case "infrastructure":
        return "Infrastruktur"
      case "facilities":
        return "Fasilitas Umum"
      case "reports":
        return "Laporan Masyarakat"
      case "blackspots":
        return "Blackspot"
      case "users":
        return "Manajemen User"
      default:
        return "Data"
    }
  }

  const handleCardClick = (filterValue: string) => {
    if (cardFilter === filterValue) {
      // Jika card yang sama diklik lagi, reset filter
      setCardFilter(null)
      setFilterStatus("all")
    } else {
      // Set filter baru
      setCardFilter(filterValue)
      // Jika filterValue adalah "all", maka set filterStatus ke "all" juga
      if (filterValue === "all") {
        setFilterStatus("all")
      } else {
        setFilterStatus(filterValue)
      }
    }
  }

  const resetFilters = () => {
    setCardFilter(null)
    setFilterStatus("all")
    setSearchTerm("")
  }

  const renderAddForm = () => {
    switch (activeTab) {
      case "accidents":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">No</label>
                <Input
                  value={editForm?.no || ""}
                  disabled
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tanggal</label>
                <Input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={editForm?.tanggal || ""}
                  onChange={(e) => setEditForm((prev: AccidentData | null) => prev ? {...prev, tanggal: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Lokasi</label>
              <Input
                value={editForm?.lokasi || ""}
                onChange={(e) => setEditForm((prev: AccidentData | null) => prev ? {...prev, lokasi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Jenis</label>
                <Select value={editForm?.jenis || "Luka-luka"} onValueChange={(value) => setEditForm((prev: AccidentData | null) => prev ? {...prev, jenis: value as any} : null)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fatal">Fatal</SelectItem>
                    <SelectItem value="Luka-luka">Luka-luka</SelectItem>
                    <SelectItem value="Kerusakan">Kerusakan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Korban</label>
                <Input
                  value={editForm?.korban || ""}
                  onChange={(e) => setEditForm((prev: AccidentData | null) => prev ? {...prev, korban: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Kendaraan</label>
              <Input
                value={editForm?.kendaraan || ""}
                onChange={(e) => setEditForm((prev: AccidentData | null) => prev ? {...prev, kendaraan: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi</label>
              <Textarea
                value={editForm?.deskripsi || ""}
                onChange={(e) => setEditForm((prev: AccidentData | null) => prev ? {...prev, deskripsi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.lat || ""}
                  onChange={(e) => setEditForm((prev: AccidentData | null) => prev ? {...prev, lat: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.long || ""}
                  onChange={(e) => setEditForm((prev: AccidentData | null) => prev ? {...prev, long: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button onClick={isEditing ? handleSave : handleSaveNew} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Update" : "Simpan"}
              </Button>
            </div>
          </>
        )

      case "infrastructure":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">No</label>
                <Input
                  value={editForm?.no || ""}
                  disabled
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Jenis</label>
                <Input
                  value={editForm?.jenis || ""}
                  onChange={(e) => setEditForm((prev: InfrastructureData | null) => prev ? {...prev, jenis: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Lokasi</label>
              <Input
                value={editForm?.lokasi || ""}
                onChange={(e) => setEditForm((prev: InfrastructureData | null) => prev ? {...prev, lokasi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
              <Select value={editForm?.status || "Aktif"} onValueChange={(value) => setEditForm((prev: InfrastructureData | null) => prev ? {...prev, status: value as any} : null)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Rusak">Rusak</SelectItem>
                  <SelectItem value="Dalam Perbaikan">Dalam Perbaikan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi</label>
              <Textarea
                value={editForm?.deskripsi || ""}
                onChange={(e) => setEditForm((prev: InfrastructureData | null) => prev ? {...prev, deskripsi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.lat || ""}
                  onChange={(e) => setEditForm((prev: InfrastructureData | null) => prev ? {...prev, lat: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.long || ""}
                  onChange={(e) => setEditForm((prev: InfrastructureData | null) => prev ? {...prev, long: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button onClick={isEditing ? handleSave : handleSaveNew} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Update" : "Simpan"}
              </Button>
            </div>
          </>
        )

      case "facilities":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">No</label>
                <Input
                  value={editForm?.no || ""}
                  disabled
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nama</label>
                <Input
                  value={editForm?.nama || ""}
                  onChange={(e) => setEditForm((prev: FacilityData | null) => prev ? {...prev, nama: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Jenis</label>
                <Input
                  value={editForm?.jenis || ""}
                  onChange={(e) => setEditForm((prev: FacilityData | null) => prev ? {...prev, jenis: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <Select value={editForm?.status || "Aktif"} onValueChange={(value) => setEditForm((prev: FacilityData | null) => prev ? {...prev, status: value as any} : null)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                    <SelectItem value="Dalam Renovasi">Dalam Renovasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Lokasi</label>
              <Input
                value={editForm?.lokasi || ""}
                onChange={(e) => setEditForm((prev: FacilityData | null) => prev ? {...prev, lokasi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi</label>
              <Textarea
                value={editForm?.deskripsi || ""}
                onChange={(e) => setEditForm((prev: FacilityData | null) => prev ? {...prev, deskripsi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.lat || ""}
                  onChange={(e) => setEditForm((prev: FacilityData | null) => prev ? {...prev, lat: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.long || ""}
                  onChange={(e) => setEditForm((prev: FacilityData | null) => prev ? {...prev, long: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button onClick={isEditing ? handleSave : handleSaveNew} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Update" : "Simpan"}
              </Button>
            </div>
          </>
        )

      case "reports":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">No</label>
                <Input
                  value={editForm?.no || ""}
                  disabled
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Kategori</label>
                <Select value={editForm?.kategori || "Rambu Rusak/Hilang"} onValueChange={(value) => setEditForm((prev: ReportData | null) => prev ? {...prev, kategori: value as any} : null)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rambu Rusak/Hilang">Rambu Rusak/Hilang</SelectItem>
                    <SelectItem value="Marka Jalan Buram">Marka Jalan Buram</SelectItem>
                    <SelectItem value="Lampu Lalu Lintas Mati">Lampu Lalu Lintas Mati</SelectItem>
                    <SelectItem value="Penerangan Kurang">Penerangan Kurang</SelectItem>
                    <SelectItem value="Jalan Rusak/Berlubang">Jalan Rusak/Berlubang</SelectItem>
                    <SelectItem value="Potensi Kecelakaan">Potensi Kecelakaan</SelectItem>
                    <SelectItem value="Parkir Liar">Parkir Liar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Lokasi</label>
                <Input
                  value={editForm?.lokasi || ""}
                  onChange={(e) => setEditForm((prev: ReportData | null) => prev ? {...prev, lokasi: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <Select value={editForm?.status || "Diterima"} onValueChange={(value) => setEditForm((prev: ReportData | null) => prev ? {...prev, status: value as any} : null)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diterima">Diterima</SelectItem>
                    <SelectItem value="Dalam Peninjauan">Dalam Peninjauan</SelectItem>
                    <SelectItem value="Ditindaklanjuti">Ditindaklanjuti</SelectItem>
                    <SelectItem value="Selesai">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Pelapor</label>
                <Input
                  value={editForm?.pelapor || ""}
                  onChange={(e) => setEditForm((prev: ReportData | null) => prev ? {...prev, pelapor: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tanggal</label>
                <Input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={editForm?.tanggal || ""}
                  onChange={(e) => setEditForm((prev: ReportData | null) => prev ? {...prev, tanggal: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi</label>
              <Textarea
                value={editForm?.deskripsi || ""}
                onChange={(e) => setEditForm((prev: ReportData | null) => prev ? {...prev, deskripsi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.lat || ""}
                  onChange={(e) => setEditForm((prev: ReportData | null) => prev ? {...prev, lat: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.long || ""}
                  onChange={(e) => setEditForm((prev: ReportData | null) => prev ? {...prev, long: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button onClick={isEditing ? handleSave : handleSaveNew} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Update" : "Simpan"}
              </Button>
            </div>
          </>
        )

      case "blackspots":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">No</label>
              <Input
                value={editForm?.no || ""}
                disabled
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Lokasi</label>
              <Input
                value={editForm?.lokasi || ""}
                onChange={(e) => setEditForm((prev: BlackspotData | null) => prev ? {...prev, lokasi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Jenis</label>
              <Select value={editForm?.jenis || "Blackspot"} onValueChange={(value) => setEditForm((prev: BlackspotData | null) => prev ? {...prev, jenis: value as any} : null)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blackspot">Blackspot</SelectItem>
                  <SelectItem value="Potential Blackspot">Potential Blackspot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Total Kecelakaan</label>
              <Input
                value={editForm?.totalKecelakaan || ""}
                onChange={(e) => setEditForm((prev: BlackspotData | null) => prev ? {...prev, totalKecelakaan: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi</label>
              <Textarea
                value={editForm?.deskripsi || ""}
                onChange={(e) => setEditForm((prev: BlackspotData | null) => prev ? {...prev, deskripsi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.lat || ""}
                  onChange={(e) => setEditForm((prev: BlackspotData | null) => prev ? {...prev, lat: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.long || ""}
                  onChange={(e) => setEditForm((prev: BlackspotData | null) => prev ? {...prev, long: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button onClick={isEditing ? handleSave : handleSaveNew} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Update" : "Simpan"}
              </Button>
            </div>
          </>
        )

      case "users":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nama</label>
                <Input
                  value={editForm?.nama || ""}
                  onChange={(e) => setEditForm((prev: UserData | null) => prev ? {...prev, nama: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <Input
                  type="email"
                  value={editForm?.email || ""}
                  onChange={(e) => setEditForm((prev: UserData | null) => prev ? {...prev, email: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <Select value={editForm?.role || "user"} onValueChange={(value) => setEditForm((prev: UserData | null) => prev ? {...prev, role: value} : null)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <Select value={editForm?.status || "active"} onValueChange={(value) => setEditForm((prev: UserData | null) => prev ? {...prev, status: value as any} : null)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Last Login</label>
              <Input
                type="date"
                value={editForm?.lastLogin || ""}
                                  onChange={(e) => setEditForm((prev: UserData | null) => prev ? {...prev, lastLogin: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button onClick={isEditing ? handleSave : handleSaveNew} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Update" : "Simpan"}
              </Button>
            </div>
          </>
        )

      default:
        return <div>Form tidak tersedia</div>
    }
  }

  const renderEditForm = () => {
    // Similar to renderAddForm but for editing with handleSave instead of handleSaveNew
    switch (activeTab) {
      case "accidents":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">No</label>
                <Input
                  value={editForm?.no || ""}
                  disabled
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tanggal</label>
                <Input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={editForm?.tanggal || ""}
                  onChange={(e) => setEditForm((prev: AccidentData | null) => prev ? {...prev, tanggal: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Lokasi</label>
              <Input
                value={editForm?.lokasi || ""}
                onChange={(e) => setEditForm((prev: AccidentData | null) => prev ? {...prev, lokasi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Jenis</label>
                <Select value={editForm?.jenis || "Luka-luka"} onValueChange={(value) => setEditForm((prev: AccidentData | null) => prev ? {...prev, jenis: value as any} : null)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fatal">Fatal</SelectItem>
                    <SelectItem value="Luka-luka">Luka-luka</SelectItem>
                    <SelectItem value="Kerusakan">Kerusakan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Korban</label>
                <Input
                  value={editForm?.korban || ""}
                  onChange={(e) => setEditForm((prev: AccidentData | null) => prev ? {...prev, korban: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Kendaraan</label>
              <Input
                value={editForm?.kendaraan || ""}
                onChange={(e) => setEditForm((prev: AccidentData | null) => prev ? {...prev, kendaraan: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi</label>
              <Textarea
                value={editForm?.deskripsi || ""}
                onChange={(e) => setEditForm((prev: AccidentData | null) => prev ? {...prev, deskripsi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.lat || ""}
                  onChange={(e) => setEditForm((prev: AccidentData | null) => prev ? {...prev, lat: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.long || ""}
                  onChange={(e) => setEditForm((prev: AccidentData | null) => prev ? {...prev, long: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Update
              </Button>
            </div>
          </>
        )

      case "infrastructure":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">No</label>
                <Input
                  value={editForm?.no || ""}
                  disabled
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Jenis</label>
                <Input
                  value={editForm?.jenis || ""}
                  onChange={(e) => setEditForm((prev: InfrastructureData | null) => prev ? {...prev, jenis: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Lokasi</label>
              <Input
                value={editForm?.lokasi || ""}
                onChange={(e) => setEditForm((prev: InfrastructureData | null) => prev ? {...prev, lokasi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
              <Select value={editForm?.status || "Aktif"} onValueChange={(value) => setEditForm((prev: InfrastructureData | null) => prev ? {...prev, status: value as any} : null)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Rusak">Rusak</SelectItem>
                  <SelectItem value="Dalam Perbaikan">Dalam Perbaikan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi</label>
              <Textarea
                value={editForm?.deskripsi || ""}
                onChange={(e) => setEditForm((prev: InfrastructureData | null) => prev ? {...prev, deskripsi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.lat || ""}
                  onChange={(e) => setEditForm((prev: InfrastructureData | null) => prev ? {...prev, lat: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.long || ""}
                  onChange={(e) => setEditForm((prev: InfrastructureData | null) => prev ? {...prev, long: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Update
              </Button>
            </div>
          </>
        )

      case "facilities":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">No</label>
                <Input
                  value={editForm?.no || ""}
                  disabled
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nama</label>
                <Input
                  value={editForm?.nama || ""}
                  onChange={(e) => setEditForm((prev: FacilityData | null) => prev ? {...prev, nama: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Jenis</label>
                <Input
                  value={editForm?.jenis || ""}
                  onChange={(e) => setEditForm((prev: FacilityData | null) => prev ? {...prev, jenis: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <Select value={editForm?.status || "Aktif"} onValueChange={(value) => setEditForm((prev: FacilityData | null) => prev ? {...prev, status: value as any} : null)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                    <SelectItem value="Dalam Renovasi">Dalam Renovasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Lokasi</label>
              <Input
                value={editForm?.lokasi || ""}
                onChange={(e) => setEditForm((prev: FacilityData | null) => prev ? {...prev, lokasi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi</label>
              <Textarea
                value={editForm?.deskripsi || ""}
                onChange={(e) => setEditForm((prev: FacilityData | null) => prev ? {...prev, deskripsi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.lat || ""}
                  onChange={(e) => setEditForm((prev: FacilityData | null) => prev ? {...prev, lat: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.long || ""}
                  onChange={(e) => setEditForm((prev: FacilityData | null) => prev ? {...prev, long: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Update
              </Button>
            </div>
          </>
        )

      case "reports":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">No</label>
                <Input
                  value={editForm?.no || ""}
                  disabled
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Kategori</label>
                <Select value={editForm?.kategori || "Rambu Rusak/Hilang"} onValueChange={(value) => setEditForm((prev: ReportData | null) => prev ? {...prev, kategori: value as any} : null)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rambu Rusak/Hilang">Rambu Rusak/Hilang</SelectItem>
                    <SelectItem value="Marka Jalan Buram">Marka Jalan Buram</SelectItem>
                    <SelectItem value="Lampu Lalu Lintas Mati">Lampu Lalu Lintas Mati</SelectItem>
                    <SelectItem value="Penerangan Kurang">Penerangan Kurang</SelectItem>
                    <SelectItem value="Jalan Rusak/Berlubang">Jalan Rusak/Berlubang</SelectItem>
                    <SelectItem value="Potensi Kecelakaan">Potensi Kecelakaan</SelectItem>
                    <SelectItem value="Parkir Liar">Parkir Liar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Lokasi</label>
                <Input
                  value={editForm?.lokasi || ""}
                  onChange={(e) => setEditForm((prev: ReportData | null) => prev ? {...prev, lokasi: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <Select value={editForm?.status || "Diterima"} onValueChange={(value) => setEditForm((prev: ReportData | null) => prev ? {...prev, status: value as any} : null)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diterima">Diterima</SelectItem>
                    <SelectItem value="Dalam Peninjauan">Dalam Peninjauan</SelectItem>
                    <SelectItem value="Ditindaklanjuti">Ditindaklanjuti</SelectItem>
                    <SelectItem value="Selesai">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Pelapor</label>
                <Input
                  value={editForm?.pelapor || ""}
                  onChange={(e) => setEditForm((prev: ReportData | null) => prev ? {...prev, pelapor: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tanggal</label>
                <Input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={editForm?.tanggal || ""}
                  onChange={(e) => setEditForm((prev: ReportData | null) => prev ? {...prev, tanggal: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi</label>
              <Textarea
                value={editForm?.deskripsi || ""}
                onChange={(e) => setEditForm((prev: ReportData | null) => prev ? {...prev, deskripsi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.lat || ""}
                  onChange={(e) => setEditForm((prev: ReportData | null) => prev ? {...prev, lat: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.long || ""}
                  onChange={(e) => setEditForm((prev: ReportData | null) => prev ? {...prev, long: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Update
              </Button>
            </div>
          </>
        )

      case "blackspots":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">No</label>
              <Input
                value={editForm?.no || ""}
                disabled
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Lokasi</label>
              <Input
                value={editForm?.lokasi || ""}
                onChange={(e) => setEditForm((prev: BlackspotData | null) => prev ? {...prev, lokasi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Jenis</label>
              <Select value={editForm?.jenis || "Blackspot"} onValueChange={(value) => setEditForm((prev: BlackspotData | null) => prev ? {...prev, jenis: value as any} : null)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blackspot">Blackspot</SelectItem>
                  <SelectItem value="Potential Blackspot">Potential Blackspot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Total Kecelakaan</label>
              <Input
                value={editForm?.totalKecelakaan || ""}
                onChange={(e) => setEditForm((prev: BlackspotData | null) => prev ? {...prev, totalKecelakaan: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Deskripsi</label>
              <Textarea
                value={editForm?.deskripsi || ""}
                onChange={(e) => setEditForm((prev: BlackspotData | null) => prev ? {...prev, deskripsi: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.lat || ""}
                  onChange={(e) => setEditForm((prev: BlackspotData | null) => prev ? {...prev, lat: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editForm?.long || ""}
                  onChange={(e) => setEditForm((prev: BlackspotData | null) => prev ? {...prev, long: parseFloat(e.target.value) || 0} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Update
              </Button>
            </div>
          </>
        )

      case "users":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nama</label>
                <Input
                  value={editForm?.nama || ""}
                  onChange={(e) => setEditForm((prev: UserData | null) => prev ? {...prev, nama: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <Input
                  value={editForm?.email || ""}
                  onChange={(e) => setEditForm((prev: UserData | null) => prev ? {...prev, email: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <Input
                  value={editForm?.role || ""}
                  onChange={(e) => setEditForm((prev: UserData | null) => prev ? {...prev, role: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <Select value={editForm?.status || "active"} onValueChange={(value) => setEditForm((prev: UserData | null) => prev ? {...prev, status: value as any} : null)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Last Login</label>
              <Input
                value={editForm?.lastLogin || ""}
                onChange={(e) => setEditForm((prev: UserData | null) => prev ? {...prev, lastLogin: e.target.value} : null)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Update
              </Button>
            </div>
          </>
        )

      default:
        return <div>Form tidak tersedia</div>
    }
  }

  const renderViewForm = () => {
    if (!selectedItem) return <div>Data tidak ditemukan</div>

    switch (activeTab) {
      case "accidents":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-sm">No:</span>
                <p className="text-white font-medium">{selectedItem.no}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Tanggal:</span>
                <p className="text-white">{selectedItem.tanggal}</p>
              </div>
            </div>
            
            <div>
              <span className="text-slate-400 text-sm">Lokasi:</span>
              <p className="text-white">{selectedItem.lokasi}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-sm">Jenis:</span>
                <Badge className={getJenisColor(selectedItem.jenis)}>
                  {selectedItem.jenis}
                </Badge>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Korban:</span>
                <p className="text-white">{selectedItem.korban}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-sm">Kendaraan:</span>
              <p className="text-white">{selectedItem.kendaraan}</p>
            </div>

            <div>
              <span className="text-slate-400 text-sm">Deskripsi:</span>
              <p className="text-white">{selectedItem.deskripsi}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-sm">Latitude:</span>
                <p className="text-white">{selectedItem.lat.toFixed(6)}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Longitude:</span>
                <p className="text-white">{selectedItem.long.toFixed(6)}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                Tutup
              </Button>
              <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </>
        )

      case "infrastructure":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-sm">No:</span>
                <p className="text-white font-medium">{selectedItem.no}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Jenis:</span>
                <p className="text-white">{selectedItem.jenis}</p>
              </div>
            </div>
            
            <div>
              <span className="text-slate-400 text-sm">Lokasi:</span>
              <p className="text-white">{selectedItem.lokasi}</p>
            </div>

            <div>
              <span className="text-slate-400 text-sm">Status:</span>
              <Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge>
            </div>

            <div>
              <span className="text-slate-400 text-sm">Deskripsi:</span>
              <p className="text-white">{selectedItem.deskripsi}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-sm">Latitude:</span>
                <p className="text-white">{selectedItem.lat.toFixed(6)}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Longitude:</span>
                <p className="text-white">{selectedItem.long.toFixed(6)}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                Tutup
              </Button>
              <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </>
        )

      case "facilities":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-sm">No:</span>
                <p className="text-white font-medium">{selectedItem.no}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Nama:</span>
                <p className="text-white">{selectedItem.nama}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-sm">Jenis:</span>
                <p className="text-white">{selectedItem.jenis}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Status:</span>
                <Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-sm">Lokasi:</span>
              <p className="text-white">{selectedItem.lokasi}</p>
            </div>

            <div>
              <span className="text-slate-400 text-sm">Deskripsi:</span>
              <p className="text-white">{selectedItem.deskripsi}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-sm">Latitude:</span>
                <p className="text-white">{selectedItem.lat.toFixed(6)}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Longitude:</span>
                <p className="text-white">{selectedItem.long.toFixed(6)}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                Tutup
              </Button>
              <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </>
        )

      case "reports":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-sm">No:</span>
                <p className="text-white font-medium">{selectedItem.no}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Kategori:</span>
                <p className="text-white">{selectedItem.kategori}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-sm">Lokasi:</span>
                <p className="text-white">{selectedItem.lokasi}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Status:</span>
                <Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-sm">Pelapor:</span>
                <p className="text-white">{selectedItem.pelapor}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Tanggal:</span>
                <p className="text-white">{selectedItem.tanggal}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-sm">Deskripsi:</span>
              <p className="text-white">{selectedItem.deskripsi}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-sm">Latitude:</span>
                <p className="text-white">{selectedItem.lat.toFixed(6)}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Longitude:</span>
                <p className="text-white">{selectedItem.long.toFixed(6)}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                Tutup
              </Button>
              <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </>
        )

      case "blackspots":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-sm">No:</span>
                <p className="text-white font-medium">{selectedItem.no}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Jenis:</span>
                <Badge className={selectedItem.jenis === "Blackspot" ? "bg-red-500" : "bg-orange-500"}>
                  {selectedItem.jenis}
                </Badge>
              </div>
            </div>
            
            <div>
              <span className="text-slate-400 text-sm">Lokasi:</span>
              <p className="text-white">{selectedItem.lokasi}</p>
            </div>

            <div>
              <span className="text-slate-400 text-sm">Total Kecelakaan:</span>
              <p className="text-white font-medium">{selectedItem.totalKecelakaan || ""}</p>
            </div>

            <div>
              <span className="text-slate-400 text-sm">Deskripsi:</span>
              <p className="text-white">{selectedItem.deskripsi}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-sm">Latitude:</span>
                <p className="text-white">{selectedItem.lat.toFixed(6)}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Longitude:</span>
                <p className="text-white">{selectedItem.long.toFixed(6)}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                Tutup
              </Button>
              <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </>
        )

      case "users":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-sm">Nama:</span>
                <p className="text-white font-medium">{selectedItem.nama}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Email:</span>
                <p className="text-white">{selectedItem.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-sm">Role:</span>
                <Badge className={selectedItem.role === "admin" ? "bg-red-500" : "bg-blue-500"}>
                  {selectedItem.role}
                </Badge>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Status:</span>
                <Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-sm">Last Login:</span>
              <p className="text-white">{selectedItem.lastLogin}</p>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button className="bg-transparent hover:bg-slate-700" onClick={closeModal}>
                Tutup
              </Button>
              <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </>
        )

      default:
        return <div>Data tidak tersedia</div>
    }
  }

  // Render table based on active tab
  const renderTable = () => {
    switch (activeTab) {
      case "accidents":
        return (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left p-3 text-slate-300">
                  <Checkbox 
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-3 text-slate-300">No</th>
                <th className="text-left p-3 text-slate-300">Tanggal</th>
                <th className="text-left p-3 text-slate-300">Lokasi</th>
                <th className="text-left p-3 text-slate-300">Jenis</th>
                <th className="text-left p-3 text-slate-300">Kendaraan</th>
                <th className="text-left p-3 text-slate-300">Korban</th>
                <th className="text-left p-3 text-slate-300">Deskripsi</th>
                <th className="text-left p-3 text-slate-300">Lat</th>
                <th className="text-left p-3 text-slate-300">Long</th>
                <th className="text-left p-3 text-slate-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
                              {(filteredData as AccidentData[])
                  .filter(item =>
                    typeof item.jenis === 'string' &&
                    typeof item.kendaraan === 'string' &&
                    typeof item.korban === 'string'
                  )
                  .map((item, index) => (
                                      <motion.tr
                    key={`accidents-${item.id || item.no}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="p-3">
                      <Checkbox 
                        checked={selectedItems.includes(item.id!)}
                        onCheckedChange={() => handleSelectItem(item.id!)}
                      />
                    </td>
                    <td className="p-3 text-white font-medium">{item.no}</td>
                    <td className="p-3 text-white">{item.tanggal}</td>
                    <td className="p-3 text-slate-300 text-sm max-w-xs truncate" title={item.lokasi}>{item.lokasi}</td>
                    <td className="p-3"><Badge className={getJenisColor(item.jenis)}>{item.jenis}</Badge></td>
                    <td className="p-3 text-white text-sm">{item.kendaraan}</td>
                    <td className="p-3 text-white">{item.korban}</td>
                    <td className="p-3 text-slate-300 text-sm max-w-xs truncate" title={item.deskripsi}>{item.deskripsi}</td>
                    <td className="p-3 text-white text-sm">{item.lat?.toFixed(6)}</td>
                    <td className="p-3 text-white text-sm">{item.long?.toFixed(6)}</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => openModal("view", item)}><Eye className="w-4 h-4" /></Button>
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => openModal("edit", item)}><Edit className="w-4 h-4" /></Button>
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => handleDelete(item.id!)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        )
      case "infrastructure":
        return (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left p-3 text-slate-300">
                  <Checkbox 
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-3 text-slate-300">No</th>
                <th className="text-left p-3 text-slate-300">Jenis</th>
                <th className="text-left p-3 text-slate-300">Lokasi</th>
                <th className="text-left p-3 text-slate-300">Status</th>
                <th className="text-left p-3 text-slate-300">Deskripsi</th>
                <th className="text-left p-3 text-slate-300">Lat</th>
                <th className="text-left p-3 text-slate-300">Long</th>
                <th className="text-left p-3 text-slate-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
                              {(filteredData as InfrastructureData[])
                  .filter(item =>
                    typeof item.jenis === 'string' &&
                    typeof item.status === 'string'
                  )
                  .map((item, index) => (
                                      <motion.tr
                    key={`infrastructure-${item.id || item.no}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="p-3">
                      <Checkbox 
                        checked={selectedItems.includes(item.id!)}
                        onCheckedChange={() => handleSelectItem(item.id!)}
                      />
                    </td>
                    <td className="p-3 text-white font-medium">{item.no}</td>
                    <td className="p-3 text-white">{item.jenis}</td>
                    <td className="p-3 text-slate-300 text-sm max-w-xs truncate" title={item.lokasi}>{item.lokasi}</td>
                    <td className="p-3"><Badge className={getStatusColor(item.status)}>{item.status}</Badge></td>
                    <td className="p-3 text-slate-300 text-sm max-w-xs truncate" title={item.deskripsi}>{item.deskripsi}</td>
                    <td className="p-3 text-white text-sm">{item.lat?.toFixed(6)}</td>
                    <td className="p-3 text-white text-sm">{item.long?.toFixed(6)}</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => openModal("view", item)}><Eye className="w-4 h-4" /></Button>
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => openModal("edit", item)}><Edit className="w-4 h-4" /></Button>
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => handleDelete(item.id!)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        )
      case "facilities":
        return (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left p-3 text-slate-300">
                  <Checkbox 
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-3 text-slate-300">No</th>
                <th className="text-left p-3 text-slate-300">Nama</th>
                <th className="text-left p-3 text-slate-300">Jenis</th>
                <th className="text-left p-3 text-slate-300">Lokasi</th>
                <th className="text-left p-3 text-slate-300">Status</th>
                <th className="text-left p-3 text-slate-300">Deskripsi</th>
                <th className="text-left p-3 text-slate-300">Lat</th>
                <th className="text-left p-3 text-slate-300">Long</th>
                <th className="text-left p-3 text-slate-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
                              {(filteredData as FacilityData[])
                  .filter(item =>
                    typeof item.nama === 'string' &&
                    typeof item.jenis === 'string' &&
                    typeof item.status === 'string'
                  )
                  .map((item, index) => (
                                      <motion.tr
                    key={`facilities-${item.id || item.no}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="p-3">
                      <Checkbox 
                        checked={selectedItems.includes(item.id!)}
                        onCheckedChange={() => handleSelectItem(item.id!)}
                      />
                    </td>
                    <td className="p-3 text-white font-medium">{item.no}</td>
                    <td className="p-3 text-white">{item.nama}</td>
                    <td className="p-3 text-white">{item.jenis}</td>
                    <td className="p-3 text-slate-300 text-sm max-w-xs truncate" title={item.lokasi}>{item.lokasi}</td>
                    <td className="p-3"><Badge className={getStatusColor(item.status)}>{item.status}</Badge></td>
                    <td className="p-3 text-slate-300 text-sm max-w-xs truncate" title={item.deskripsi}>{item.deskripsi}</td>
                    <td className="p-3 text-white text-sm">{item.lat?.toFixed(6)}</td>
                    <td className="p-3 text-white text-sm">{item.long?.toFixed(6)}</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => openModal("view", item)}><Eye className="w-4 h-4" /></Button>
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => openModal("edit", item)}><Edit className="w-4 h-4" /></Button>
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => handleDelete(item.id!)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        )
      case "reports":
        return (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left p-3 text-slate-300">
                  <Checkbox 
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-3 text-slate-300">No</th>
                <th className="text-left p-3 text-slate-300">Kategori</th>
                <th className="text-left p-3 text-slate-300">Lokasi</th>
                <th className="text-left p-3 text-slate-300">Status</th>
                <th className="text-left p-3 text-slate-300">Pelapor</th>
                <th className="text-left p-3 text-slate-300">Tanggal</th>
                <th className="text-left p-3 text-slate-300">Deskripsi</th>
                <th className="text-left p-3 text-slate-300">Lat</th>
                <th className="text-left p-3 text-slate-300">Long</th>
                <th className="text-left p-3 text-slate-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
                              {(filteredData as ReportData[])
                  .filter(item =>
                    typeof item.kategori === 'string' &&
                    typeof item.pelapor === 'string' &&
                    typeof item.status === 'string'
                  )
                  .map((item, index) => (
                                      <motion.tr
                    key={`reports-${item.id || item.no}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="p-3">
                      <Checkbox 
                        checked={selectedItems.includes(item.id!)}
                        onCheckedChange={() => handleSelectItem(item.id!)}
                      />
                    </td>
                    <td className="p-3 text-white font-medium">{item.no}</td>
                    <td className="p-3 text-white">{item.kategori}</td>
                    <td className="p-3 text-slate-300 text-sm max-w-xs truncate" title={item.lokasi}>{item.lokasi}</td>
                    <td className="p-3"><Badge className={getStatusColor(item.status)}>{item.status}</Badge></td>
                    <td className="p-3 text-white text-sm">{item.pelapor}</td>
                    <td className="p-3 text-white text-sm">{item.tanggal}</td>
                    <td className="p-3 text-slate-300 text-sm max-w-xs truncate" title={item.deskripsi}>{item.deskripsi}</td>
                    <td className="p-3 text-white text-sm">{item.lat?.toFixed(6)}</td>
                    <td className="p-3 text-white text-sm">{item.long?.toFixed(6)}</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => openModal("view", item)}><Eye className="w-4 h-4" /></Button>
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => openModal("edit", item)}><Edit className="w-4 h-4" /></Button>
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => handleDelete(item.id!)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        )
      case "blackspots":
        return (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left p-3 text-slate-300">
                  <Checkbox 
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-3 text-slate-300">No</th>
                <th className="text-left p-3 text-slate-300">Lokasi</th>
                <th className="text-left p-3 text-slate-300">Jenis</th>
                <th className="text-left p-3 text-slate-300">Total Kecelakaan</th>
                <th className="text-left p-3 text-slate-300">Deskripsi</th>
                <th className="text-left p-3 text-slate-300">Lat</th>
                <th className="text-left p-3 text-slate-300">Long</th>
                <th className="text-left p-3 text-slate-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(filteredData as BlackspotData[])
                .filter(item =>
                  typeof item.lokasi === 'string' &&
                  typeof item.jenis === 'string'
                )
                .map((item, index) => (
                  <motion.tr
                    key={`blackspots-${item.id || item.no}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="p-3">
                      <Checkbox 
                        checked={selectedItems.includes(item.id!)}
                        onCheckedChange={() => handleSelectItem(item.id!)}
                      />
                    </td>
                    <td className="p-3 text-white font-medium">{item.no}</td>
                    <td className="p-3 text-slate-300 text-sm max-w-xs truncate" title={item.lokasi}>{item.lokasi}</td>
                    <td className="p-3"><Badge className={item.jenis === "Blackspot" ? "bg-red-500" : "bg-orange-500"}>{item.jenis}</Badge></td>
                    <td className="p-3 text-white text-sm font-medium">{item.totalKecelakaan || ""}</td>
                    <td className="p-3 text-slate-300 text-sm max-w-xs truncate" title={item.deskripsi}>{item.deskripsi}</td>
                    <td className="p-3 text-white text-sm">{item.lat?.toFixed(6)}</td>
                    <td className="p-3 text-white text-sm">{item.long?.toFixed(6)}</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => openModal("view", item)}><Eye className="w-4 h-4" /></Button>
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => openModal("edit", item)}><Edit className="w-4 h-4" /></Button>
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => handleDelete(item.id!)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        )
      case "users":
        return (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left p-3 text-slate-300">
                  <Checkbox 
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-3 text-slate-300">Nama</th>
                <th className="text-left p-3 text-slate-300">Email</th>
                <th className="text-left p-3 text-slate-300">Role</th>
                <th className="text-left p-3 text-slate-300">Status</th>
                <th className="text-left p-3 text-slate-300">Last Login</th>
                <th className="text-left p-3 text-slate-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
                              {(filteredData as UserData[])
                  .filter(item =>
                    typeof item.nama === 'string' &&
                    typeof item.email === 'string' &&
                    typeof item.role === 'string'
                  )
                  .map((item, index) => (
                                      <motion.tr
                    key={`users-${item.id || item.nama}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="p-3">
                      <Checkbox 
                        checked={selectedItems.includes(item.id!)}
                        onCheckedChange={() => handleSelectItem(item.id!)}
                      />
                    </td>
                    <td className="p-3 text-white font-medium">{item.nama}</td>
                    <td className="p-3 text-white">{item.email}</td>
                    <td className="p-3 text-white">{item.role}</td>
                    <td className="p-3"><Badge className={getStatusColor(item.status)}>{item.status}</Badge></td>
                    <td className="p-3 text-white text-sm">{item.lastLogin}</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => openModal("view", item)}><Eye className="w-4 h-4" /></Button>
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => openModal("edit", item)}><Edit className="w-4 h-4" /></Button>
                        <Button className="p-2 bg-transparent hover:bg-slate-700" onClick={() => handleDelete(item.id!)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        )
      default:
        return <div>Data tidak tersedia</div>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aktif":
        return "bg-green-500 text-white"
      case "Rusak":
      case "Tidak Aktif":
        return "bg-red-500 text-white"
      case "Dalam Perbaikan":
      case "Dalam Renovasi":
      case "Dalam Peninjauan":
      case "Ditindaklanjuti":
        return "bg-yellow-500 text-black"
      case "Selesai":
        return "bg-blue-500 text-white"
      default:
        return "bg-slate-500 text-white"
    }
  }

  const handleManualRenumber = async () => {
    setShowRenumberConfirm(true)
  }

  const confirmRenumber = async () => {
    
    setRenumbering(true)
    try {
      await renumberData()
      toast.success("Data berhasil diurutkan ulang!")
    } catch (error) {
      console.error('Error in manual renumber:', error)
      toast.error("Gagal mengurutkan ulang data!")
    } finally {
      setRenumbering(false)
      setShowRenumberConfirm(false)
    }
  }

  // Selection management functions
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([])
      setSelectAll(false)
    } else {
      const currentData = getCurrentData()
      const allIds = currentData.map(item => item.id).filter(Boolean) as string[]
      setSelectedItems(allIds)
      setSelectAll(true)
    }
  }

  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id))
      setSelectAll(false)
    } else {
      const newSelected = [...selectedItems, id]
      setSelectedItems(newSelected)
      const currentData = getCurrentData()
      const allIds = currentData.map(item => item.id).filter(Boolean) as string[]
      setSelectAll(newSelected.length === allIds.length)
    }
  }

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) {
      toast.error("Pilih data yang akan dihapus terlebih dahulu!")
      return
    }
    setShowDeleteConfirm(true)
  }

  const confirmBulkDelete = async () => {
    if (selectedItems.length === 0) return
    
    setBulkProcessing(true)
    setProcessingProgress({ current: 0, total: selectedItems.length })
    
    try {
      console.log(`Deleting ${selectedItems.length} items from tab: ${activeTab}`)
      
      // Delete items with progress tracking
      for (let i = 0; i < selectedItems.length; i++) {
        const id = selectedItems[i]
        
        switch (activeTab) {
          case "accidents":
            await deleteAccident(id)
            break
          case "infrastructure":
            await deleteInfrastructure(id)
            break
          case "facilities":
            await deleteFacility(id)
            break
          case "reports":
            await deleteReport(id)
            break
          case "blackspots":
            await deleteBlackspot(id)
            break
          case "users":
            await deleteUser(id)
            break
        }
        
        setProcessingProgress({ current: i + 1, total: selectedItems.length })
        
        // Add small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      console.log('Items deleted successfully, starting renumber process...')
      
      // Renumber data after deletion (except for users)
      if (activeTab !== 'users') {
        setProcessingProgress({ current: 0, total: 1 })
        await renumberData()
      }
      
      setShowDeleteConfirm(false)
      setSelectedItems([])
      setSelectAll(false)
      setBulkProcessing(false)
      setProcessingProgress({ current: 0, total: 0 })
      toast.success(`${selectedItems.length} data berhasil dihapus!`)
    } catch (error) {
      console.error('Error deleting data:', error)
      setBulkProcessing(false)
      setProcessingProgress({ current: 0, total: 0 })
      toast.error("Gagal menghapus data!")
    }
  }

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-slate-900">
        <AdminNavbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Panel Administrasi</h1>
          <p className="text-slate-300">Kelola data kecelakaan, infrastruktur, dan laporan masyarakat</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {activeTab === "accidents" && (
            <>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "all" 
                      ? "bg-red-500/20 border-red-500/40 shadow-lg shadow-red-500/20" 
                      : "bg-red-500/10 border-red-500/20 hover:bg-red-500/15"
                  }`}
                  onClick={() => handleCardClick("all")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Total Kecelakaan</p>
                        <p className="text-2xl font-bold text-white">{accidentData.length}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "Luka-luka" 
                      ? "bg-orange-500/20 border-orange-500/40 shadow-lg shadow-orange-500/20" 
                      : "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/15"
                  }`}
                  onClick={() => handleCardClick("Luka-luka")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Luka-luka</p>
                        <p className="text-2xl font-bold text-white">{accidentData.filter(a => a.jenis === "Luka-luka").length}</p>
                      </div>
                      <UsersIcon className="w-8 h-8 text-orange-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "Fatal" 
                      ? "bg-red-600/20 border-red-600/40 shadow-lg shadow-red-600/20" 
                      : "bg-red-600/10 border-red-600/20 hover:bg-red-600/15"
                  }`}
                  onClick={() => handleCardClick("Fatal")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Fatal</p>
                        <p className="text-2xl font-bold text-white">{accidentData.filter(a => a.jenis === "Fatal").length}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "Kerusakan" 
                      ? "bg-yellow-500/20 border-yellow-500/40 shadow-lg shadow-yellow-500/20" 
                      : "bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/15"
                  }`}
                  onClick={() => handleCardClick("Kerusakan")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Kerusakan</p>
                        <p className="text-2xl font-bold text-white">{accidentData.filter(a => a.jenis === "Kerusakan").length}</p>
                      </div>
                      <Car className="w-8 h-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {activeTab === "infrastructure" && (
            <>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "all" 
                      ? "bg-blue-500/20 border-blue-500/40 shadow-lg shadow-blue-500/20" 
                      : "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15"
                  }`}
                  onClick={() => handleCardClick("all")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Total Infrastruktur</p>
                        <p className="text-2xl font-bold text-white">{infrastructureData.length}</p>
                      </div>
                      <Settings className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "Aktif" 
                      ? "bg-green-500/20 border-green-500/40 shadow-lg shadow-green-500/20" 
                      : "bg-green-500/10 border-green-500/20 hover:bg-green-500/15"
                  }`}
                  onClick={() => handleCardClick("Aktif")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Aktif</p>
                        <p className="text-2xl font-bold text-white">{infrastructureData.filter(i => i.status === "Aktif").length}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "Rusak" 
                      ? "bg-red-500/20 border-red-500/40 shadow-lg shadow-red-500/20" 
                      : "bg-red-500/10 border-red-500/20 hover:bg-red-500/15"
                  }`}
                  onClick={() => handleCardClick("Rusak")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Rusak</p>
                        <p className="text-2xl font-bold text-white">{infrastructureData.filter(i => i.status === "Rusak").length}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "Dalam Perbaikan" 
                      ? "bg-orange-500/20 border-orange-500/40 shadow-lg shadow-orange-500/20" 
                      : "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/15"
                  }`}
                  onClick={() => handleCardClick("Dalam Perbaikan")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Dalam Perbaikan</p>
                        <p className="text-2xl font-bold text-white">{infrastructureData.filter(i => i.status === "Dalam Perbaikan").length}</p>
                      </div>
                      <Wrench className="w-8 h-8 text-orange-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {activeTab === "facilities" && (
            <>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "all" 
                      ? "bg-purple-500/20 border-purple-500/40 shadow-lg shadow-purple-500/20" 
                      : "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15"
                  }`}
                  onClick={() => handleCardClick("all")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Total Fasilitas</p>
                        <p className="text-2xl font-bold text-white">{facilityData.length}</p>
                      </div>
                      <Building className="w-8 h-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "Aktif" 
                      ? "bg-green-500/20 border-green-500/40 shadow-lg shadow-green-500/20" 
                      : "bg-green-500/10 border-green-500/20 hover:bg-green-500/15"
                  }`}
                  onClick={() => handleCardClick("Aktif")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Aktif</p>
                        <p className="text-2xl font-bold text-white">{facilityData.filter(f => f.status === "Aktif").length}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "Tidak Aktif" 
                      ? "bg-gray-500/20 border-gray-500/40 shadow-lg shadow-gray-500/20" 
                      : "bg-gray-500/10 border-gray-500/20 hover:bg-gray-500/15"
                  }`}
                  onClick={() => handleCardClick("Tidak Aktif")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Tidak Aktif</p>
                        <p className="text-2xl font-bold text-white">{facilityData.filter(f => f.status === "Tidak Aktif").length}</p>
                      </div>
                      <XCircle className="w-8 h-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "Dalam Renovasi" 
                      ? "bg-orange-500/20 border-orange-500/40 shadow-lg shadow-orange-500/20" 
                      : "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/15"
                  }`}
                  onClick={() => handleCardClick("Dalam Renovasi")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Dalam Renovasi</p>
                        <p className="text-2xl font-bold text-white">{facilityData.filter(f => f.status === "Dalam Renovasi").length}</p>
                      </div>
                      <Wrench className="w-8 h-8 text-orange-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {activeTab === "reports" && (
            <>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "all" 
                      ? "bg-blue-500/20 border-blue-500/40 shadow-lg shadow-blue-500/20" 
                      : "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15"
                  }`}
                  onClick={() => handleCardClick("all")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Total Laporan</p>
                        <p className="text-2xl font-bold text-white">{reportData.length}</p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "Diterima" 
                      ? "bg-orange-500/20 border-orange-500/40 shadow-lg shadow-orange-500/20" 
                      : "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/15"
                  }`}
                  onClick={() => handleCardClick("Diterima")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Diterima</p>
                        <p className="text-2xl font-bold text-white">{reportData.filter(r => r.status === "Diterima").length}</p>
                      </div>
                      <Clock className="w-8 h-8 text-orange-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "Dalam Peninjauan" 
                      ? "bg-yellow-500/20 border-yellow-500/40 shadow-lg shadow-yellow-500/20" 
                      : "bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/15"
                  }`}
                  onClick={() => handleCardClick("Dalam Peninjauan")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Dalam Peninjauan</p>
                        <p className="text-2xl font-bold text-white">{reportData.filter(r => r.status === "Dalam Peninjauan").length}</p>
                      </div>
                      <Search className="w-8 h-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "Ditindaklanjuti" 
                      ? "bg-blue-600/20 border-blue-600/40 shadow-lg shadow-blue-600/20" 
                      : "bg-blue-600/10 border-blue-600/20 hover:bg-blue-600/15"
                  }`}
                  onClick={() => handleCardClick("Ditindaklanjuti")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Ditindaklanjuti</p>
                        <p className="text-2xl font-bold text-white">{reportData.filter(r => r.status === "Ditindaklanjuti").length}</p>
                      </div>
                      <Loader2 className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "Selesai" 
                      ? "bg-green-500/20 border-green-500/40 shadow-lg shadow-green-500/20" 
                      : "bg-green-500/10 border-green-500/20 hover:bg-green-500/15"
                  }`}
                  onClick={() => handleCardClick("Selesai")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Selesai</p>
                        <p className="text-2xl font-bold text-white">{reportData.filter(r => r.status === "Selesai").length}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {activeTab === "blackspots" && (
            <>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "all" 
                      ? "bg-red-600/20 border-red-600/40 shadow-lg shadow-red-600/20" 
                      : "bg-red-600/10 border-red-600/20 hover:bg-red-600/15"
                  }`}
                  onClick={() => handleCardClick("all")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Total Titik Rawan</p>
                        <p className="text-2xl font-bold text-white">{blackspotData.length}</p>
                      </div>
                      <AlertOctagon className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "Blackspot" 
                      ? "bg-red-500/20 border-red-500/40 shadow-lg shadow-red-500/20" 
                      : "bg-red-500/10 border-red-500/20 hover:bg-red-500/15"
                  }`}
                  onClick={() => handleCardClick("Blackspot")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Blackspot</p>
                        <p className="text-2xl font-bold text-white">{blackspotData.filter(b => b.jenis === "Blackspot").length}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "Potential Blackspot" 
                      ? "bg-orange-500/20 border-orange-500/40 shadow-lg shadow-orange-500/20" 
                      : "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/15"
                  }`}
                  onClick={() => handleCardClick("Potential Blackspot")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Potential Blackspot</p>
                        <p className="text-2xl font-bold text-white">{blackspotData.filter(b => b.jenis === "Potential Blackspot").length}</p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-orange-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card 
                  className={`border-2 cursor-pointer transition-all duration-200 ${
                    cardFilter === "Blackspot" 
                      ? "bg-blue-500/20 border-blue-500/40 shadow-lg shadow-blue-500/20" 
                      : "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15"
                  }`}
                  onClick={() => handleCardClick("Blackspot")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Persentase Blackspot</p>
                        <p className="text-2xl font-bold text-white">
                          {blackspotData.length > 0 
                            ? `${Math.round((blackspotData.filter(b => b.jenis === "Blackspot").length / blackspotData.length) * 100)}%`
                            : "0%"
                          }
                        </p>
                      </div>
                      <Target className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {activeTab === "users" && (
            <>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card className="bg-purple-500/10 border-purple-500/20 border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Total User</p>
                        <p className="text-2xl font-bold text-white">{userData.length}</p>
                      </div>
                      <UsersIcon className="w-8 h-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card className="bg-green-500/10 border-green-500/20 border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Aktif</p>
                        <p className="text-2xl font-bold text-white">{userData.filter(u => u.status === "active").length}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card className="bg-gray-500/10 border-gray-500/20 border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Tidak Aktif</p>
                        <p className="text-2xl font-bold text-white">{userData.filter(u => u.status === "inactive").length}</p>
                      </div>
                      <XCircle className="w-8 h-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card className="bg-red-500/10 border-red-500/20 border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Admin</p>
                        <p className="text-2xl font-bold text-white">{userData.filter(u => u.role.includes("Admin")).length}</p>
                      </div>
                      <Shield className="w-8 h-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>

        {/* Vehicle Type Cards for Accidents Tab */}
        {activeTab === "accidents" && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Jenis Kendaraan</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {getVehicleTypes().map((vehicleType) => {
                const VehicleIcon = getVehicleIcon(vehicleType)
                const vehicleColor = getVehicleColor(vehicleType)
                const count = getAccidentCountByVehicle(vehicleType)
                
                return (
                  <motion.div key={vehicleType} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <Card 
                      className={`border-2 cursor-pointer transition-all duration-200 ${
                        cardFilter === vehicleType 
                          ? "bg-purple-500/20 border-purple-500/40 shadow-lg shadow-purple-500/20" 
                          : "bg-slate-700/50 border-slate-600/50 hover:bg-slate-600/50"
                      }`}
                      onClick={() => handleCardClick(vehicleType)}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center">
                          <VehicleIcon className={`w-6 h-6 ${vehicleColor} mb-2`} />
                          <p className="text-slate-400 text-xs mb-1">{vehicleType}</p>
                          <p className="text-lg font-bold text-white">{count}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ""}`} />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari data kecelakaan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white w-64"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  {getFilterOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(cardFilter && cardFilter !== "all") || filterStatus !== "all" || searchTerm ? (
                <Button 
                  onClick={resetFilters}
                  variant="outline"
                  className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Data
              </Button>
            </motion.div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Template
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleDownloadExcelTemplate(); }}>
                    <FileDown className="w-4 h-4 mr-2" />
                    Download Template Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadGeoJSONTemplate}>
                    <FileDown className="w-4 h-4 mr-2" />
                    Download Template GeoJSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700" disabled={importing || bulkProcessing}>
                    {importing || bulkProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {bulkProcessing ? "Memproses..." : "Importing..."}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleImportExcel} disabled={importing}>
                    Import Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleImportGeoJSON} disabled={importing}>
                    Import GeoJSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportExcel}>
                    Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportGeoJSON}>
                    Export GeoJSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {selectedItems.length > 0 && (
                <Button 
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={importing || renumbering || bulkProcessing}
                >
                  {bulkProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus {selectedItems.length} Data
                    </>
                  )}
                </Button>
              )}
              {activeTab !== 'users' && (
                <Button 
                  onClick={handleManualRenumber}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={importing || renumbering}
                >
                  {renumbering ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mengurutkan...
                    </>
                  ) : (
                    'Urutkan Nomor'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <Card className="bg-slate-800 border-slate-700 relative">
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              {renderTable()}
            </div>
            {(renumbering || bulkProcessing) && (
              <div className="absolute inset-0 bg-slate-800/80 flex items-center justify-center z-10">
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-white text-sm">
                    {renumbering ? "Mengurutkan nomor data..." : 
                     bulkProcessing ? `Memproses data... (${processingProgress.current}/${processingProgress.total})` : 
                     "Memproses..."}
                  </p>
                  {bulkProcessing && processingProgress.total > 0 && (
                    <div className="w-64 bg-slate-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(processingProgress.current / processingProgress.total) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Component for Data Management */}
      <Modal isOpen={selectedModal !== null} onClose={closeModal} title={
        selectedModal === "add" ? `Tambah Data ${getTabLabel(activeTab)}` : 
        selectedModal === "edit" ? `Edit Data ${getTabLabel(activeTab)}` : 
        `Detail Data ${getTabLabel(activeTab)}`
      }>
        {selectedModal === "add" && !isEditing ? (
          // Add new form - Dynamic based on active tab
          <div className="space-y-4">
            {renderAddForm()}
          </div>
        ) : isEditing ? (
          // Edit form - Dynamic based on active tab
          <div className="space-y-4">
            {renderEditForm()}
          </div>
        ) : (
          // View mode - Dynamic based on active tab
          <div className="space-y-4">
            {renderViewForm()}
          </div>
        )}
      </Modal>
      
      {/* Hidden file input for import functionality */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.geojson,.json"
        onChange={handleFileImport}
        style={{ display: 'none' }}
      />

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteConfirm} 
        onClose={() => {
          setShowDeleteConfirm(false)
          setItemToDelete(null)
        }} 
        title={itemToDelete ? "Konfirmasi Hapus" : "Konfirmasi Hapus Massal"}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {itemToDelete 
              ? "Apakah Anda yakin ingin menghapus data ini?" 
              : `Apakah Anda yakin ingin menghapus ${selectedItems.length} data yang dipilih?`
            }
          </p>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteConfirm(false)
                setItemToDelete(null)
              }}
            >
              Batal
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700" 
              onClick={itemToDelete ? confirmDelete : confirmBulkDelete}
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>

      {/* Renumber Confirmation Modal */}
      <Modal 
        isOpen={showRenumberConfirm} 
        onClose={() => setShowRenumberConfirm(false)} 
        title="Konfirmasi Urutkan Nomor"
      >
        <div className="space-y-4">
          <p className="text-gray-700">Apakah Anda yakin ingin mengurutkan ulang nomor data?</p>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowRenumberConfirm(false)}
            >
              Batal
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700" 
              onClick={confirmRenumber}
            >
              Urutkan
            </Button>
          </div>
        </div>
      </Modal>
      </div>
      <Toaster />
    </AdminRouteGuard>
  )
}
