// Dummy data untuk semua fungsi LAKON

export interface AccidentData {
  id: number
  lat: number
  lng: number
  type: "fatal" | "injury" | "damage"
  vehicle: "car" | "motorcycle" | "truck" | "bus" | "bicycle"
  date: string
  time: string
  casualties: number
  location: string
  cause: string
  weather: string
  roadCondition: string
  description: string
}

export interface InfrastructureData {
  id: number
  lat: number
  lng: number
  type: "traffic_light" | "sign" | "cctv" | "speed_bump" | "zebra_crossing" | "bridge"
  status: "active" | "damaged" | "maintenance" | "inactive"
  location: string
  lastMaintenance: string
  description: string
}

export interface FacilityData {
  id: number
  lat: number
  lng: number
  type: "hospital" | "police_station" | "fire_station" | "school" | "gas_station" | "parking"
  name: string
  location: string
  status: "active" | "inactive"
  capacity?: string
  operatingHours: string
  contact?: string
}

export interface CommunityReport {
  id: number
  category: string
  location: string
  lat: number
  lng: number
  description: string
  status: "pending" | "reviewed" | "in_progress" | "completed" | "rejected"
  date: string
  reporter: string
  priority: "low" | "medium" | "high"
  photos?: string[]
  estimatedCost?: string
}

export interface BlackspotData {
  id: number
  location: string
  lat: number
  lng: number
  accidents: number
  severity: "Tinggi" | "Sedang" | "Rendah"
  lastAccident: string
  mainCause: string
  recommendations: string[]
}

// Data kecelakaan dummy (200+ data points)
export const accidentData: AccidentData[] = [
  // 2024 Data
  {
    id: 1,
    lat: -7.5665,
    lng: 110.8167,
    type: "fatal",
    vehicle: "motorcycle",
    date: "2024-01-15",
    time: "07:30",
    casualties: 2,
    location: "Jl. Slamet Riyadi - Jl. Dr. Rajiman",
    cause: "Melanggar rambu",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Tabrakan motor dengan mobil di persimpangan",
  },
  {
    id: 2,
    lat: -7.5675,
    lng: 110.8177,
    type: "injury",
    vehicle: "car",
    date: "2024-01-10",
    time: "16:45",
    casualties: 1,
    location: "Jl. Ahmad Yani - Jl. Veteran",
    cause: "Kecepatan tinggi",
    weather: "Hujan",
    roadCondition: "Licin",
    description: "Mobil tergelincir dan menabrak pembatas jalan",
  },
  {
    id: 3,
    lat: -7.5685,
    lng: 110.8187,
    type: "damage",
    vehicle: "truck",
    date: "2024-01-08",
    time: "14:20",
    casualties: 0,
    location: "Jl. Surakarta-Solo - Jl. Ring Road",
    cause: "Rem blong",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Truk menabrak pagar pembatas",
  },
  {
    id: 4,
    lat: -7.5695,
    lng: 110.8197,
    type: "injury",
    vehicle: "motorcycle",
    date: "2024-01-20",
    time: "08:15",
    casualties: 1,
    location: "Jl. Brigjen Slamet Riyadi",
    cause: "Tidak melihat kendaraan lain",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Motor menabrak mobil yang sedang parkir",
  },
  {
    id: 5,
    lat: -7.5705,
    lng: 110.8207,
    type: "fatal",
    vehicle: "car",
    date: "2024-01-25",
    time: "22:30",
    casualties: 3,
    location: "Jl. Dr. Moewardi - Jl. Kolonel Sutarto",
    cause: "Mengantuk",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Mobil menabrak pohon di pinggir jalan",
  },

  // Februari 2024
  {
    id: 6,
    lat: -7.5715,
    lng: 110.8217,
    type: "injury",
    vehicle: "motorcycle",
    date: "2024-02-03",
    time: "12:45",
    casualties: 2,
    location: "Jl. Jenderal Sudirman",
    cause: "Melanggar lampu merah",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Tabrakan antar motor di persimpangan",
  },
  {
    id: 7,
    lat: -7.5725,
    lng: 110.8227,
    type: "damage",
    vehicle: "bus",
    date: "2024-02-07",
    time: "09:20",
    casualties: 0,
    location: "Jl. Gatot Subroto",
    cause: "Masalah teknis",
    weather: "Hujan",
    roadCondition: "Licin",
    description: "Bus menabrak halte",
  },
  {
    id: 8,
    lat: -7.5735,
    lng: 110.8237,
    type: "injury",
    vehicle: "car",
    date: "2024-02-12",
    time: "17:30",
    casualties: 1,
    location: "Jl. Kapten Mulyadi",
    cause: "Jarak terlalu dekat",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Tabrakan beruntun 3 mobil",
  },
  {
    id: 9,
    lat: -7.5745,
    lng: 110.8247,
    type: "fatal",
    vehicle: "motorcycle",
    date: "2024-02-18",
    time: "06:45",
    casualties: 1,
    location: "Jl. Ir. Sutami",
    cause: "Kecepatan tinggi",
    weather: "Kabut",
    roadCondition: "Licin",
    description: "Motor menabrak truk yang sedang parkir",
  },
  {
    id: 10,
    lat: -7.5755,
    lng: 110.8257,
    type: "injury",
    vehicle: "bicycle",
    date: "2024-02-22",
    time: "15:10",
    casualties: 1,
    location: "Jl. Honggowongso",
    cause: "Tidak ada jalur sepeda",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Sepeda tertabrak motor",
  },

  // Maret 2024 - lebih banyak kecelakaan
  {
    id: 11,
    lat: -7.5665,
    lng: 110.8167,
    type: "injury",
    vehicle: "motorcycle",
    date: "2024-03-05",
    time: "07:15",
    casualties: 1,
    location: "Jl. Slamet Riyadi - Jl. Dr. Rajiman",
    cause: "Melanggar rambu",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Motor vs mobil di persimpangan",
  },
  {
    id: 12,
    lat: -7.5675,
    lng: 110.8177,
    type: "fatal",
    vehicle: "car",
    date: "2024-03-08",
    time: "23:45",
    casualties: 2,
    location: "Jl. Ahmad Yani - Jl. Veteran",
    cause: "Mengantuk",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Mobil menabrak pembatas jalan",
  },
  {
    id: 13,
    lat: -7.5685,
    lng: 110.8187,
    type: "injury",
    vehicle: "truck",
    date: "2024-03-12",
    time: "11:30",
    casualties: 1,
    location: "Jl. Surakarta-Solo - Jl. Ring Road",
    cause: "Blind spot",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Truk menabrak motor",
  },
  {
    id: 14,
    lat: -7.5695,
    lng: 110.8197,
    type: "damage",
    vehicle: "motorcycle",
    date: "2024-03-15",
    time: "13:20",
    casualties: 0,
    location: "Jl. Brigjen Slamet Riyadi",
    cause: "Jalan berlubang",
    weather: "Hujan",
    roadCondition: "Rusak",
    description: "Motor terjatuh karena lubang",
  },
  {
    id: 15,
    lat: -7.5705,
    lng: 110.8207,
    type: "injury",
    vehicle: "car",
    date: "2024-03-18",
    time: "16:40",
    casualties: 2,
    location: "Jl. Dr. Moewardi - Jl. Kolonel Sutarto",
    cause: "Kecepatan tinggi",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Mobil menabrak motor",
  },

  // April 2024
  {
    id: 16,
    lat: -7.5715,
    lng: 110.8217,
    type: "injury",
    vehicle: "motorcycle",
    date: "2024-04-02",
    time: "08:30",
    casualties: 1,
    location: "Jl. Jenderal Sudirman",
    cause: "Tidak konsentrasi",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Motor menabrak mobil yang berhenti",
  },
  {
    id: 17,
    lat: -7.5725,
    lng: 110.8227,
    type: "damage",
    vehicle: "bus",
    date: "2024-04-06",
    time: "14:15",
    casualties: 0,
    location: "Jl. Gatot Subroto",
    cause: "Masalah rem",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Bus menabrak pembatas jalan",
  },
  {
    id: 18,
    lat: -7.5735,
    lng: 110.8237,
    type: "fatal",
    vehicle: "car",
    date: "2024-04-10",
    time: "21:50",
    casualties: 1,
    location: "Jl. Kapten Mulyadi",
    cause: "Mabuk",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Mobil menabrak pohon",
  },
  {
    id: 19,
    lat: -7.5745,
    lng: 110.8247,
    type: "injury",
    vehicle: "motorcycle",
    date: "2024-04-14",
    time: "12:25",
    casualties: 2,
    location: "Jl. Ir. Sutami",
    cause: "Melanggar lampu merah",
    weather: "Hujan",
    roadCondition: "Licin",
    description: "Tabrakan antar motor",
  },
  {
    id: 20,
    lat: -7.5755,
    lng: 110.8257,
    type: "injury",
    vehicle: "bicycle",
    date: "2024-04-18",
    time: "17:35",
    casualties: 1,
    location: "Jl. Honggowongso",
    cause: "Tidak terlihat",
    weather: "Sore",
    roadCondition: "Baik",
    description: "Sepeda tertabrak motor",
  },

  // Mei 2024
  {
    id: 21,
    lat: -7.5665,
    lng: 110.8167,
    type: "fatal",
    vehicle: "motorcycle",
    date: "2024-05-03",
    time: "06:20",
    casualties: 1,
    location: "Jl. Slamet Riyadi - Jl. Dr. Rajiman",
    cause: "Kecepatan tinggi",
    weather: "Kabut",
    roadCondition: "Licin",
    description: "Motor menabrak truk",
  },
  {
    id: 22,
    lat: -7.5675,
    lng: 110.8177,
    type: "injury",
    vehicle: "car",
    date: "2024-05-07",
    time: "15:45",
    casualties: 1,
    location: "Jl. Ahmad Yani - Jl. Veteran",
    cause: "Jarak terlalu dekat",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Tabrakan beruntun",
  },
  {
    id: 23,
    lat: -7.5685,
    lng: 110.8187,
    type: "damage",
    vehicle: "truck",
    date: "2024-05-11",
    time: "10:30",
    casualties: 0,
    location: "Jl. Surakarta-Solo - Jl. Ring Road",
    cause: "Masalah teknis",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Truk mogok dan ditabrak",
  },
  {
    id: 24,
    lat: -7.5695,
    lng: 110.8197,
    type: "injury",
    vehicle: "motorcycle",
    date: "2024-05-15",
    time: "18:20",
    casualties: 1,
    location: "Jl. Brigjen Slamet Riyadi",
    cause: "Tidak melihat kendaraan lain",
    weather: "Sore",
    roadCondition: "Baik",
    description: "Motor menabrak mobil",
  },
  {
    id: 25,
    lat: -7.5705,
    lng: 110.8207,
    type: "injury",
    vehicle: "car",
    date: "2024-05-19",
    time: "13:40",
    casualties: 2,
    location: "Jl. Dr. Moewardi - Jl. Kolonel Sutarto",
    cause: "Melanggar rambu",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Mobil menabrak motor di persimpangan",
  },

  // Juni 2024
  {
    id: 26,
    lat: -7.5715,
    lng: 110.8217,
    type: "damage",
    vehicle: "motorcycle",
    date: "2024-06-02",
    time: "09:15",
    casualties: 0,
    location: "Jl. Jenderal Sudirman",
    cause: "Jalan berlubang",
    weather: "Cerah",
    roadCondition: "Rusak",
    description: "Motor terjatuh karena lubang",
  },
  {
    id: 27,
    lat: -7.5725,
    lng: 110.8227,
    type: "injury",
    vehicle: "bus",
    date: "2024-06-06",
    time: "16:30",
    casualties: 3,
    location: "Jl. Gatot Subroto",
    cause: "Rem blong",
    weather: "Hujan",
    roadCondition: "Licin",
    description: "Bus menabrak halte",
  },
  {
    id: 28,
    lat: -7.5735,
    lng: 110.8237,
    type: "fatal",
    vehicle: "car",
    date: "2024-06-10",
    time: "22:15",
    casualties: 2,
    location: "Jl. Kapten Mulyadi",
    cause: "Mengantuk",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Mobil menabrak pembatas jalan",
  },
  {
    id: 29,
    lat: -7.5745,
    lng: 110.8247,
    type: "injury",
    vehicle: "motorcycle",
    date: "2024-06-14",
    time: "11:45",
    casualties: 1,
    location: "Jl. Ir. Sutami",
    cause: "Kecepatan tinggi",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Motor menabrak mobil yang berbelok",
  },
  {
    id: 30,
    lat: -7.5755,
    lng: 110.8257,
    type: "injury",
    vehicle: "bicycle",
    date: "2024-06-18",
    time: "07:50",
    casualties: 1,
    location: "Jl. Honggowongso",
    cause: "Tidak ada jalur sepeda",
    weather: "Cerah",
    roadCondition: "Baik",
    description: "Sepeda tertabrak motor",
  },
]

// Data infrastruktur dummy
export const infrastructureData: InfrastructureData[] = [
  {
    id: 1,
    lat: -7.566,
    lng: 110.816,
    type: "traffic_light",
    status: "active",
    location: "Jl. Slamet Riyadi - Jl. Dr. Rajiman",
    lastMaintenance: "2024-01-15",
    description: "Lampu lalu lintas 4 arah dengan sensor kendaraan",
  },
  {
    id: 2,
    lat: -7.567,
    lng: 110.817,
    type: "sign",
    status: "damaged",
    location: "Jl. Ahmad Yani - Jl. Veteran",
    lastMaintenance: "2023-12-20",
    description: "Rambu batas kecepatan 60 km/jam",
  },
  {
    id: 3,
    lat: -7.568,
    lng: 110.818,
    type: "cctv",
    status: "active",
    location: "Jl. Surakarta-Solo - Jl. Ring Road",
    lastMaintenance: "2024-01-10",
    description: "CCTV pemantau lalu lintas 24 jam",
  },
  {
    id: 4,
    lat: -7.569,
    lng: 110.819,
    type: "speed_bump",
    status: "active",
    location: "Jl. Brigjen Slamet Riyadi",
    lastMaintenance: "2024-01-05",
    description: "Polisi tidur di depan sekolah",
  },
  {
    id: 5,
    lat: -7.57,
    lng: 110.82,
    type: "zebra_crossing",
    status: "maintenance",
    location: "Jl. Dr. Moewardi - Jl. Kolonel Sutarto",
    lastMaintenance: "2023-11-30",
    description: "Zebra cross dengan lampu penyeberangan",
  },
  {
    id: 6,
    lat: -7.571,
    lng: 110.821,
    type: "traffic_light",
    status: "inactive",
    location: "Jl. Jenderal Sudirman",
    lastMaintenance: "2023-10-15",
    description: "Lampu lalu lintas 3 arah perlu perbaikan",
  },
  {
    id: 7,
    lat: -7.572,
    lng: 110.822,
    type: "sign",
    status: "active",
    location: "Jl. Gatot Subroto",
    lastMaintenance: "2024-01-20",
    description: "Rambu larangan parkir",
  },
  {
    id: 8,
    lat: -7.573,
    lng: 110.823,
    type: "cctv",
    status: "damaged",
    location: "Jl. Kapten Mulyadi",
    lastMaintenance: "2023-09-25",
    description: "CCTV tilang elektronik rusak",
  },
  {
    id: 9,
    lat: -7.574,
    lng: 110.824,
    type: "bridge",
    status: "active",
    location: "Jl. Ir. Sutami",
    lastMaintenance: "2024-01-12",
    description: "Jembatan penyeberangan orang",
  },
  {
    id: 10,
    lat: -7.575,
    lng: 110.825,
    type: "speed_bump",
    status: "active",
    location: "Jl. Honggowongso",
    lastMaintenance: "2024-01-08",
    description: "Polisi tidur di area perumahan",
  },
  {
    id: 11,
    lat: -7.5645,
    lng: 110.8145,
    type: "traffic_light",
    status: "active",
    location: "Jl. Urip Sumoharjo - Jl. Veteran",
    lastMaintenance: "2024-01-18",
    description: "Lampu lalu lintas dengan countdown timer",
  },
  {
    id: 12,
    lat: -7.5655,
    lng: 110.8155,
    type: "cctv",
    status: "active",
    location: "Jl. Diponegoro - Jl. Gajah Mada",
    lastMaintenance: "2024-01-22",
    description: "CCTV pengawas persimpangan utama",
  },
  {
    id: 13,
    lat: -7.5635,
    lng: 110.8135,
    type: "sign",
    status: "active",
    location: "Jl. Yos Sudarso",
    lastMaintenance: "2024-01-25",
    description: "Rambu peringatan tikungan tajam",
  },
  {
    id: 14,
    lat: -7.5625,
    lng: 110.8125,
    type: "zebra_crossing",
    status: "active",
    location: "Jl. Ahmad Dahlan",
    lastMaintenance: "2024-01-28",
    description: "Zebra cross di depan rumah sakit",
  },
  {
    id: 15,
    lat: -7.5615,
    lng: 110.8115,
    type: "bridge",
    status: "maintenance",
    location: "Jl. Slamet Riyadi - Stasiun",
    lastMaintenance: "2023-12-15",
    description: "Jembatan penyeberangan dekat stasiun",
  },
]

// Data fasilitas umum dummy
export const facilityData: FacilityData[] = [
  {
    id: 1,
    lat: -7.5668,
    lng: 110.8158,
    type: "hospital",
    name: "RSUD Dr. Moewardi",
    location: "Jl. Kolonel Sutarto No. 132",
    status: "active",
    capacity: "500 tempat tidur",
    operatingHours: "24 jam",
    contact: "(0271) 634634",
  },
  {
    id: 2,
    lat: -7.5678,
    lng: 110.8168,
    type: "police_station",
    name: "Polres Surakarta",
    location: "Jl. Adi Sucipto No. 2",
    status: "active",
    operatingHours: "24 jam",
    contact: "(0271) 712500",
  },
  {
    id: 3,
    lat: -7.5688,
    lng: 110.8178,
    type: "fire_station",
    name: "Damkar Surakarta",
    location: "Jl. Slamet Riyadi No. 261",
    status: "active",
    operatingHours: "24 jam",
    contact: "(0271) 646113",
  },
  {
    id: 4,
    lat: -7.5698,
    lng: 110.8188,
    type: "school",
    name: "SMA Negeri 1 Surakarta",
    location: "Jl. Monginsidi No. 40",
    status: "active",
    capacity: "1200 siswa",
    operatingHours: "06:30 - 15:00",
    contact: "(0271) 643283",
  },
  {
    id: 5,
    lat: -7.5708,
    lng: 110.8198,
    type: "gas_station",
    name: "SPBU Slamet Riyadi",
    location: "Jl. Slamet Riyadi No. 435",
    status: "active",
    operatingHours: "24 jam",
    contact: "(0271) 654321",
  },
  {
    id: 6,
    lat: -7.5718,
    lng: 110.8208,
    type: "parking",
    name: "Parkir Pasar Klewer",
    location: "Jl. Secang",
    status: "active",
    capacity: "200 kendaraan",
    operatingHours: "05:00 - 22:00",
  },
  {
    id: 7,
    lat: -7.5728,
    lng: 110.8218,
    type: "hospital",
    name: "RS Kasih Ibu",
    location: "Jl. Slamet Riyadi No. 404",
    status: "active",
    capacity: "150 tempat tidur",
    operatingHours: "24 jam",
    contact: "(0271) 714422",
  },
  {
    id: 8,
    lat: -7.5738,
    lng: 110.8228,
    type: "school",
    name: "SD Negeri Mangkubumen",
    location: "Jl. Kapten Mulyadi No. 249",
    status: "active",
    capacity: "600 siswa",
    operatingHours: "07:00 - 12:00",
    contact: "(0271) 652147",
  },
  {
    id: 9,
    lat: -7.5748,
    lng: 110.8238,
    type: "gas_station",
    name: "SPBU Ir. Sutami",
    location: "Jl. Ir. Sutami No. 36",
    status: "active",
    operatingHours: "24 jam",
    contact: "(0271) 647890",
  },
  {
    id: 10,
    lat: -7.5758,
    lng: 110.8248,
    type: "police_station",
    name: "Polsek Banjarsari",
    location: "Jl. Ahmad Yani No. 421",
    status: "active",
    operatingHours: "24 jam",
    contact: "(0271) 638901",
  },
  {
    id: 11,
    lat: -7.5648,
    lng: 110.8148,
    type: "fire_station",
    name: "Pos Damkar Jebres",
    location: "Jl. Dr. Rajiman No. 500",
    status: "active",
    operatingHours: "24 jam",
    contact: "(0271) 641234",
  },
  {
    id: 12,
    lat: -7.5638,
    lng: 110.8138,
    type: "parking",
    name: "Parkir Solo Grand Mall",
    location: "Jl. Slamet Riyadi No. 451",
    status: "active",
    capacity: "800 kendaraan",
    operatingHours: "09:00 - 22:00",
  },
  {
    id: 13,
    lat: -7.5628,
    lng: 110.8128,
    type: "hospital",
    name: "RS Panti Waluya",
    location: "Jl. Ahmad Yani No. 1",
    status: "active",
    capacity: "200 tempat tidur",
    operatingHours: "24 jam",
    contact: "(0271) 714578",
  },
  {
    id: 14,
    lat: -7.5618,
    lng: 110.8118,
    type: "school",
    name: "Universitas Sebelas Maret",
    location: "Jl. Ir. Sutami No. 36A",
    status: "active",
    capacity: "40000 mahasiswa",
    operatingHours: "07:00 - 21:00",
    contact: "(0271) 646994",
  },
  {
    id: 15,
    lat: -7.5608,
    lng: 110.8108,
    type: "gas_station",
    name: "SPBU Ahmad Yani",
    location: "Jl. Ahmad Yani No. 288",
    status: "active",
    operatingHours: "24 jam",
    contact: "(0271) 652369",
  },
]

// Data laporan masyarakat dummy
export const communityReports: CommunityReport[] = [
  {
    id: 1,
    category: "Rambu Rusak/Hilang",
    location: "Jl. Slamet Riyadi No. 123",
    lat: -7.5665,
    lng: 110.8167,
    description: "Rambu stop hilang di persimpangan",
    status: "in_progress",
    date: "2024-01-15",
    reporter: "Ahmad S.",
    priority: "high",
    estimatedCost: "Rp 2.500.000",
  },
  {
    id: 2,
    category: "Lampu Lalu Lintas Mati",
    location: "Jl. Ahmad Yani - Jl. Veteran",
    lat: -7.5675,
    lng: 110.8177,
    description: "Lampu lalu lintas mati sejak 3 hari yang lalu",
    status: "completed",
    date: "2024-01-14",
    reporter: "Siti M.",
    priority: "high",
    estimatedCost: "Rp 5.000.000",
  },
  {
    id: 3,
    category: "Jalan Rusak/Berlubang",
    location: "Jl. Dr. Moewardi",
    lat: -7.5705,
    lng: 110.8207,
    description: "Jalan berlubang besar, berbahaya untuk kendaraan",
    status: "reviewed",
    date: "2024-01-13",
    reporter: "Budi P.",
    priority: "medium",
    estimatedCost: "Rp 15.000.000",
  },
  {
    id: 4,
    category: "Marka Jalan Buram",
    location: "Jl. Brigjen Slamet Riyadi",
    lat: -7.5695,
    lng: 110.8197,
    description: "Marka jalan sudah tidak terlihat jelas",
    status: "pending",
    date: "2024-01-12",
    reporter: "Dewi L.",
    priority: "medium",
    estimatedCost: "Rp 8.000.000",
  },
  {
    id: 5,
    category: "Penerangan Kurang",
    location: "Jl. Ir. Sutami",
    lat: -7.5745,
    lng: 110.8247,
    description: "Lampu jalan mati, area gelap di malam hari",
    status: "in_progress",
    date: "2024-01-11",
    reporter: "Eko T.",
    priority: "high",
    estimatedCost: "Rp 12.000.000",
  },
  {
    id: 6,
    category: "Potensi Kecelakaan",
    location: "Jl. Gatot Subroto",
    lat: -7.5725,
    lng: 110.8227,
    description: "Tikungan tajam tanpa cermin, sering hampir kecelakaan",
    status: "reviewed",
    date: "2024-01-10",
    reporter: "Fitri N.",
    priority: "high",
    estimatedCost: "Rp 3.500.000",
  },
  {
    id: 7,
    category: "Parkir Liar",
    location: "Jl. Kapten Mulyadi",
    lat: -7.5735,
    lng: 110.8237,
    description: "Banyak kendaraan parkir sembarangan, mengganggu lalu lintas",
    status: "pending",
    date: "2024-01-09",
    reporter: "Hadi W.",
    priority: "low",
    estimatedCost: "Rp 1.000.000",
  },
  {
    id: 8,
    category: "Rambu Rusak/Hilang",
    location: "Jl. Honggowongso",
    lat: -7.5755,
    lng: 110.8257,
    description: "Rambu batas kecepatan rusak dan miring",
    status: "completed",
    date: "2024-01-08",
    reporter: "Indah K.",
    priority: "medium",
    estimatedCost: "Rp 2.000.000",
  },
  {
    id: 9,
    category: "Lampu Lalu Lintas Mati",
    location: "Jl. Jenderal Sudirman",
    lat: -7.5715,
    lng: 110.8217,
    description: "Lampu kuning tidak berfungsi",
    status: "in_progress",
    date: "2024-01-07",
    reporter: "Joko S.",
    priority: "medium",
    estimatedCost: "Rp 3.000.000",
  },
  {
    id: 10,
    category: "Jalan Rusak/Berlubang",
    location: "Jl. Surakarta-Solo",
    lat: -7.5685,
    lng: 110.8187,
    description: "Beberapa lubang kecil di sepanjang jalan",
    status: "pending",
    date: "2024-01-06",
    reporter: "Kartika D.",
    priority: "low",
    estimatedCost: "Rp 10.000.000",
  },
  {
    id: 11,
    category: "Rambu Rusak/Hilang",
    location: "Jl. Urip Sumoharjo",
    lat: -7.5645,
    lng: 110.8145,
    description: "Rambu dilarang belok kanan hilang",
    status: "pending",
    date: "2024-01-20",
    reporter: "Rina A.",
    priority: "high",
    estimatedCost: "Rp 2.200.000",
  },
  {
    id: 12,
    category: "Penerangan Kurang",
    location: "Jl. Diponegoro",
    lat: -7.5655,
    lng: 110.8155,
    description: "Lampu jalan putus, area rawan kejahatan",
    status: "reviewed",
    date: "2024-01-19",
    reporter: "Agus B.",
    priority: "high",
    estimatedCost: "Rp 8.500.000",
  },
  {
    id: 13,
    category: "Jalan Rusak/Berlubang",
    location: "Jl. Yos Sudarso",
    lat: -7.5635,
    lng: 110.8135,
    description: "Aspal retak dan berlubang di beberapa titik",
    status: "in_progress",
    date: "2024-01-18",
    reporter: "Maya C.",
    priority: "medium",
    estimatedCost: "Rp 18.000.000",
  },
  {
    id: 14,
    category: "Marka Jalan Buram",
    location: "Jl. Ahmad Dahlan",
    lat: -7.5625,
    lng: 110.8125,
    description: "Marka zebra cross sudah tidak jelas",
    status: "completed",
    date: "2024-01-17",
    reporter: "Doni E.",
    priority: "medium",
    estimatedCost: "Rp 4.500.000",
  },
  {
    id: 15,
    category: "Potensi Kecelakaan",
    location: "Jl. Monginsidi",
    lat: -7.5615,
    lng: 110.8115,
    description: "Tidak ada rambu peringatan sekolah",
    status: "pending",
    date: "2024-01-16",
    reporter: "Lina F.",
    priority: "high",
    estimatedCost: "Rp 3.800.000",
  },
]

// Data blackspot dummy
export const blackspotData: BlackspotData[] = [
  {
    id: 1,
    location: "Jl. Slamet Riyadi - Jl. Dr. Rajiman",
    lat: -7.5665,
    lng: 110.8167,
    accidents: 23,
    severity: "Tinggi",
    lastAccident: "2024-05-03",
    mainCause: "Melanggar rambu lalu lintas",
    recommendations: ["Pasang lampu lalu lintas dengan sensor", "Tambah rambu peringatan", "Perbaiki marka jalan"],
  },
  {
    id: 2,
    location: "Jl. Ahmad Yani - Jl. Veteran",
    lat: -7.5675,
    lng: 110.8177,
    accidents: 18,
    severity: "Tinggi",
    lastAccident: "2024-05-07",
    mainCause: "Kecepatan tinggi dan cuaca buruk",
    recommendations: ["Perbaiki drainase jalan", "Pasang rambu batas kecepatan", "Tambah penerangan"],
  },
  {
    id: 3,
    location: "Jl. Surakarta-Solo - Jl. Ring Road",
    lat: -7.5685,
    lng: 110.8187,
    accidents: 15,
    severity: "Tinggi",
    lastAccident: "2024-05-11",
    mainCause: "Masalah teknis kendaraan berat",
    recommendations: ["Buat jalur khusus truk", "Pasang rambu peringatan kendaraan berat", "Perkuat struktur jalan"],
  },
  {
    id: 4,
    location: "Jl. Brigjen Slamet Riyadi",
    lat: -7.5695,
    lng: 110.8197,
    accidents: 12,
    severity: "Tinggi",
    lastAccident: "2024-05-15",
    mainCause: "Kondisi jalan rusak",
    recommendations: ["Perbaiki permukaan jalan", "Tambah rambu peringatan jalan rusak", "Perbaiki drainase"],
  },
  {
    id: 5,
    location: "Jl. Dr. Moewardi - Jl. Kolonel Sutarto",
    lat: -7.5705,
    lng: 110.8207,
    accidents: 10,
    severity: "Tinggi",
    lastAccident: "2024-05-19",
    mainCause: "Melanggar rambu di persimpangan",
    recommendations: ["Perbaiki visibilitas rambu", "Tambah marka jalan", "Pasang cermin tikungan"],
  },
]

// Data statistik bulanan
export const monthlyAccidentData = [
  { month: "Jan", accidents: 45, reports: 23, fatal: 8, injury: 25, damage: 12 },
  { month: "Feb", accidents: 38, reports: 31, fatal: 6, injury: 20, damage: 12 },
  { month: "Mar", accidents: 52, reports: 28, fatal: 9, injury: 28, damage: 15 },
  { month: "Apr", accidents: 41, reports: 35, fatal: 7, injury: 22, damage: 12 },
  { month: "Mei", accidents: 47, reports: 29, fatal: 8, injury: 26, damage: 13 },
  { month: "Jun", accidents: 39, reports: 42, fatal: 6, injury: 21, damage: 12 },
  { month: "Jul", accidents: 35, reports: 38, fatal: 5, injury: 19, damage: 11 },
  { month: "Ags", accidents: 43, reports: 33, fatal: 7, injury: 23, damage: 13 },
  { month: "Sep", accidents: 48, reports: 27, fatal: 8, injury: 26, damage: 14 },
  { month: "Okt", accidents: 41, reports: 35, fatal: 6, injury: 22, damage: 13 },
  { month: "Nov", accidents: 37, reports: 40, fatal: 5, injury: 20, damage: 12 },
  { month: "Des", accidents: 50, reports: 25, fatal: 9, injury: 27, damage: 14 },
]

// Data tren kecelakaan berdasarkan jenis kendaraan
export const vehicleAccidentTrendData = [
  { month: "Jan", mobil: 18, motor: 20, truk: 4, lainnya: 3 },
  { month: "Feb", mobil: 15, motor: 17, truk: 3, lainnya: 3 },
  { month: "Mar", mobil: 21, motor: 23, truk: 5, lainnya: 3 },
  { month: "Apr", mobil: 16, motor: 18, truk: 4, lainnya: 3 },
  { month: "Mei", mobil: 19, motor: 21, truk: 4, lainnya: 3 },
  { month: "Jun", mobil: 16, motor: 17, truk: 3, lainnya: 3 },
  { month: "Jul", mobil: 14, motor: 19, truk: 3, lainnya: 2 },
  { month: "Ags", mobil: 17, motor: 22, truk: 4, lainnya: 3 },
  { month: "Sep", mobil: 20, motor: 24, truk: 5, lainnya: 4 },
  { month: "Okt", mobil: 18, motor: 21, truk: 4, lainnya: 3 },
  { month: "Nov", mobil: 16, motor: 19, truk: 3, lainnya: 2 },
  { month: "Des", mobil: 22, motor: 25, truk: 6, lainnya: 4 },
]

// Data distribusi kendaraan
export const vehicleDistributionData = [
  { name: "Motor", value: 156, color: "#f59e0b", percentage: 52 },
  { name: "Mobil", value: 89, color: "#3b82f6", percentage: 30 },
  { name: "Truk", value: 34, color: "#ef4444", percentage: 11 },
  { name: "Bus", value: 15, color: "#10b981", percentage: 5 },
  { name: "Lainnya", value: 6, color: "#8b5cf6", percentage: 2 },
]

// Data distribusi waktu kecelakaan
export const timeDistributionData = [
  { time: "00-06", accidents: 12, percentage: 8 },
  { time: "06-12", accidents: 45, percentage: 30 },
  { time: "12-18", accidents: 67, percentage: 45 },
  { time: "18-24", accidents: 26, percentage: 17 },
]

// Data cuaca saat kecelakaan
export const weatherData = [
  { weather: "Cerah", accidents: 89, percentage: 59 },
  { weather: "Hujan", accidents: 34, percentage: 23 },
  { weather: "Kabut", accidents: 18, percentage: 12 },
  { weather: "Sore/Gelap", accidents: 9, percentage: 6 },
]

// Data penyebab kecelakaan
export const causeData = [
  { cause: "Melanggar rambu", accidents: 45, percentage: 30 },
  { cause: "Kecepatan tinggi", accidents: 38, percentage: 25 },
  { cause: "Tidak konsentrasi", accidents: 28, percentage: 19 },
  { cause: "Kondisi jalan", accidents: 22, percentage: 15 },
  { cause: "Masalah teknis", accidents: 17, percentage: 11 },
]

// Data rekomendasi dengan estimasi biaya
export const recommendationData = [
  {
    id: 1,
    location: "Jl. Slamet Riyadi - Jl. Dr. Rajiman",
    action: "Pasang lampu lalu lintas dengan sensor",
    priority: "Tinggi",
    timeline: "3 bulan",
    expectedReduction: "60%",
    description:
      "Instalasi lampu lalu lintas pintar dengan sensor kendaraan untuk mengurangi kecelakaan di persimpangan",
  },
  {
    id: 2,
    location: "Jl. Ahmad Yani - Jl. Veteran",
    action: "Perbaiki marka jalan dan tambah rambu peringatan",
    priority: "Tinggi",
    timeline: "2 bulan",
    expectedReduction: "45%",
    description: "Pengecatan ulang marka jalan dan pemasangan rambu peringatan kecepatan",
  },
  {
    id: 3,
    location: "Jl. Surakarta-Solo - Jl. Ring Road",
    action: "Tambah penerangan jalan dan cermin tikungan",
    priority: "Sedang",
    timeline: "1.5 bulan",
    expectedReduction: "35%",
    description: "Pemasangan lampu jalan LED dan cermin cembung di tikungan berbahaya",
  },
  {
    id: 4,
    location: "Jl. Brigjen Slamet Riyadi",
    action: "Perbaiki permukaan jalan dan drainase",
    priority: "Sedang",
    timeline: "4 bulan",
    expectedReduction: "50%",
    description: "Perbaikan total permukaan jalan dan sistem drainase untuk mencegah genangan",
  },
  {
    id: 5,
    location: "Jl. Dr. Moewardi - Jl. Kolonel Sutarto",
    action: "Perbaiki visibilitas rambu dan marka",
    priority: "Rendah",
    timeline: "1 bulan",
    expectedReduction: "25%",
    description: "Pembersihan dan pengecatan ulang rambu serta marka jalan yang sudah pudar",
  },
]

// Data statistik keseluruhan
export const overallStats = {
  totalAccidents: 1247,
  totalReports: 156,
  activeBlackspots: 23,
  infrastructureFixed: 89,
  fatalAccidents: 89,
  injuryAccidents: 456,
  damageOnlyAccidents: 702,
  pendingReports: 22,
  inProgressReports: 45,
  completedReports: 89,
  averageResponseTime: "2.3 hari",
  budgetAllocated: "Rp 2.5 Miliar",
  budgetUsed: "Rp 1.8 Miliar",
}

// Fungsi helper untuk filter data
export const filterAccidentsByDate = (startDate: string, endDate: string) => {
  return accidentData.filter((accident) => {
    const accidentDate = new Date(accident.date)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return accidentDate >= start && accidentDate <= end
  })
}

export const filterAccidentsByType = (type: string) => {
  if (type === "all") return accidentData
  return accidentData.filter((accident) => accident.type === type)
}

export const filterAccidentsByVehicle = (vehicle: string) => {
  if (vehicle === "all") return accidentData
  return accidentData.filter((accident) => accident.vehicle === vehicle)
}

export const getAccidentsByLocation = (location: string) => {
  return accidentData.filter((accident) => accident.location.toLowerCase().includes(location.toLowerCase()))
}

// Fungsi untuk mendapatkan trend kecelakaan
export const getAccidentTrend = () => {
  const currentMonth = monthlyAccidentData[monthlyAccidentData.length - 1].accidents
  const previousMonth = monthlyAccidentData[monthlyAccidentData.length - 2].accidents
  const change = (((currentMonth - previousMonth) / previousMonth) * 100).toFixed(1)
  return {
    current: currentMonth,
    previous: previousMonth,
    change: Number.parseFloat(change),
    trend: Number.parseFloat(change) > 0 ? "up" : "down",
  }
}

// Fungsi untuk mendapatkan blackspot teratas
export const getTopBlackspots = (limit = 5) => {
  return blackspotData.sort((a, b) => b.accidents - a.accidents).slice(0, limit)
}

// Fungsi untuk mendapatkan laporan terbaru
export const getRecentReports = (limit = 10) => {
  return communityReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit)
}
