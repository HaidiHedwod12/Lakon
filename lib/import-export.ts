import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Function to convert various date formats to DD/MM/YYYY
const convertDateFormat = (dateValue: any): string => {
  if (!dateValue) return '';
  
  // If it's already a string in DD/MM/YYYY format, return as is
  if (typeof dateValue === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateValue)) {
    return dateValue;
  }
  
  let date: Date | null = null;
  
  // Handle Excel date numbers (serial numbers)
  if (typeof dateValue === 'number') {
    // Excel dates are counted from January 1, 1900
    const excelEpoch = new Date(1900, 0, 1);
    date = new Date(excelEpoch.getTime() + (dateValue - 1) * 24 * 60 * 60 * 1000);
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'string') {
    // Try to parse various date string formats
    const parsedDate = new Date(dateValue);
    if (isNaN(parsedDate.getTime())) {
      // If parsing fails, try common formats
      const formats = [
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // MM-DD-YYYY or DD-MM-YYYY
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY or DD/MM/YYYY
        /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, // YYYY/MM/DD
      ];
      
      for (const format of formats) {
        const match = dateValue.match(format);
        if (match) {
          const [, year, month, day] = match;
          // Assume DD/MM/YYYY format for ambiguous cases
          if (year.length === 4) {
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else {
            date = new Date(parseInt(day), parseInt(month) - 1, parseInt(year));
          }
          break;
        }
      }
      
      if (!date) {
        return dateValue; // Return original if can't parse
      }
    } else {
      date = parsedDate;
    }
  } else {
    return dateValue.toString(); // Return as string if can't handle
  }
  
  // Format as DD/MM/YYYY
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

export interface AccidentData {
  id?: string;
  no: string;
  tanggal: string;
  lokasi: string;
  jenis: "Fatal" | "Luka-luka" | "Kerusakan";
  kendaraan: string;
  korban: string;
  deskripsi: string;
  lat: number;
  long: number;
}

export interface InfrastructureData {
  id?: string;
  no: string;
  jenis: string;
  lokasi: string;
  status: "Aktif" | "Rusak" | "Dalam Perbaikan";
  deskripsi: string;
  lat: number;
  long: number;
}

export interface FacilityData {
  id?: string;
  no: string;
  nama: string;
  jenis: string;
  lokasi: string;
  status: "Aktif" | "Tidak Aktif" | "Dalam Renovasi";
  deskripsi: string;
  lat: number;
  long: number;
}

export interface ReportData {
  id?: string;
  no: string;
  kategori: "Rambu Rusak/Hilang" | "Marka Jalan Buram" | "Lampu Lalu Lintas Mati" | "Penerangan Kurang" | "Jalan Rusak/Berlubang" | "Potensi Kecelakaan" | "Parkir Liar";
  lokasi: string;
  status: "Selesai" | "Dalam Proses" | "Menunggu";
  pelapor: string;
  tanggal: string;
  deskripsi: string;
  lat: number;
  long: number;
}

// Download template Excel
export const downloadExcelTemplate = (dataType: string = 'accidents') => {
  try {
    let templateData: any[] = [];
    
    if (dataType === 'accidents') {
      templateData = [
        {
          no: "001",
          tanggal: "15/01/2024",
          lokasi: "Jl. Slamet Riyadi No. 123",
          jenis: "Luka-luka",
          kendaraan: "Mobil, Motor",
          korban: "2 orang",
          deskripsi: "Tabrakan antara mobil dan motor di persimpangan",
          lat: -7.5665,
          long: 110.8167
        }
      ];
    } else if (dataType === 'infrastructure') {
      templateData = [
        {
          no: "001",
          jenis: "Lampu Lalu Lintas",
          lokasi: "Jl. Slamet Riyadi - Jl. Dr. Rajiman",
          status: "Aktif",
          deskripsi: "Lampu lalu lintas 4 arah dengan sensor kendaraan",
          lat: -7.5665,
          long: 110.8167
        }
      ];
    } else if (dataType === 'facilities') {
      templateData = [
        {
          no: "001",
          nama: "RSUD Dr. Moewardi",
          jenis: "Rumah Sakit",
          lokasi: "Jl. Kolonel Sutarto No. 132",
          status: "Aktif",
          deskripsi: "Rumah sakit umum daerah",
          lat: -7.5668,
          long: 110.8158
        }
      ];
    } else if (dataType === 'reports') {
      templateData = [
        {
          no: "001",
          kategori: "Rambu Rusak/Hilang",
          lokasi: "Jl. Slamet Riyadi No. 123",
          status: "Diterima",
          pelapor: "Ahmad S.",
          tanggal: "15/01/2024",
          deskripsi: "Rambu stop hilang di persimpangan",
          lat: -7.5665,
          long: 110.8167
        }
      ];
    } else if (dataType === 'blackspots') {
      templateData = [
        {
          no: "001",
          lokasi: "Jl. Slamet Riyadi - Jl. Dr. Rajiman",
          jenis: "Blackspot",
          totalKecelakaan: "23",
          deskripsi: "Titik rawan kecelakaan dengan 23 kejadian",
          lat: -7.5665,
          long: 110.8167
        }
      ];
    } else if (dataType === 'users') {
      templateData = [
        {
          nama: "Ahmad S.",
          email: "ahmad@example.com",
          role: "user",
          status: "active",
          lastLogin: "2024-01-15"
        }
      ];
    }

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(dataBlob, `template_${dataType}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error downloading Excel template:', error);
    return false;
  }
};

// Download template GeoJSON
export const downloadGeoJSONTemplate = (dataType: string = 'accidents') => {
  try {
    let templateData: any[] = [];
    
    if (dataType === 'accidents') {
      templateData = [
        {
          no: "001",
          tanggal: "15/01/2024",
          lokasi: "Jl. Slamet Riyadi No. 123",
          jenis: "Luka-luka",
          kendaraan: "Mobil, Motor",
          korban: "2 orang",
          deskripsi: "Tabrakan antara mobil dan motor di persimpangan",
          lat: -7.5665,
          long: 110.8167
        }
      ];
    } else if (dataType === 'infrastructure') {
      templateData = [
        {
          no: "001",
          jenis: "Lampu Lalu Lintas",
          lokasi: "Jl. Slamet Riyadi - Jl. Dr. Rajiman",
          status: "Aktif",
          deskripsi: "Lampu lalu lintas 4 arah dengan sensor kendaraan",
          lat: -7.5665,
          long: 110.8167
        }
      ];
    } else if (dataType === 'facilities') {
      templateData = [
        {
          no: "001",
          nama: "RSUD Dr. Moewardi",
          jenis: "Rumah Sakit",
          lokasi: "Jl. Kolonel Sutarto No. 132",
          status: "Aktif",
          deskripsi: "Rumah sakit umum daerah",
          lat: -7.5668,
          long: 110.8158
        }
      ];
    } else if (dataType === 'reports') {
      templateData = [
        {
          no: "001",
          kategori: "Rambu Rusak/Hilang",
          lokasi: "Jl. Slamet Riyadi No. 123",
          status: "Diterima",
          pelapor: "Ahmad S.",
          tanggal: "15/01/2024",
          deskripsi: "Rambu stop hilang di persimpangan",
          lat: -7.5665,
          long: 110.8167
        }
      ];
    } else if (dataType === 'blackspots') {
      templateData = [
        {
          no: "001",
          lokasi: "Jl. Slamet Riyadi - Jl. Dr. Rajiman",
          jenis: "Blackspot",
          totalKecelakaan: "23",
          deskripsi: "Titik rawan kecelakaan dengan 23 kejadian",
          lat: -7.5665,
          long: 110.8167
        }
      ];
    } else if (dataType === 'users') {
      templateData = [
        {
          nama: "Ahmad S.",
          email: "ahmad@example.com",
          role: "user",
          status: "active",
          lastLogin: "2024-01-15"
        }
      ];
    }

    const geoJSON = {
      type: "FeatureCollection",
      features: templateData.map(item => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [item.long, item.lat]
        },
        properties: {
          no: item.no,
          tanggal: item.tanggal,
          lokasi: item.lokasi,
          jenis: item.jenis,
          kendaraan: item.kendaraan,
          korban: item.korban,
          deskripsi: item.deskripsi,
          nama: item.nama,
          status: item.status,
          kategori: item.kategori,
          pelapor: item.pelapor,
          totalKecelakaan: item.totalKecelakaan,
          email: item.email,
          role: item.role,
          lastLogin: item.lastLogin
        }
      }))
    };

    const dataStr = JSON.stringify(geoJSON, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    saveAs(dataBlob, `template_${dataType}.geojson`);
    return true;
  } catch (error) {
    console.error('Error downloading GeoJSON template:', error);
    return false;
  }
};

// Export to Excel
export const exportToExcel = (data: any[], filename: string, dataType: string = 'accidents') => {
  try {
    // Remove id field for export (not needed in Excel)
    const exportData = data.map(item => {
      const { id, ...rest } = item;
      return rest;
    });

    // Arrange columns based on data type to match web display order
    let arrangedData = exportData;
    
    if (dataType === 'accidents') {
      // Order: No, Tanggal, Lokasi, Jenis, Kendaraan, Korban, Deskripsi, Lat, Long
      arrangedData = exportData.map(item => ({
        no: item.no,
        tanggal: item.tanggal,
        lokasi: item.lokasi,
        jenis: item.jenis,
        kendaraan: item.kendaraan,
        korban: item.korban,
        deskripsi: item.deskripsi,
        lat: item.lat,
        long: item.long
      }));
    } else if (dataType === 'infrastructure') {
      // Order: No, Jenis, Lokasi, Status, Deskripsi, Lat, Long
      arrangedData = exportData.map(item => ({
        no: item.no,
        jenis: item.jenis,
        lokasi: item.lokasi,
        status: item.status,
        deskripsi: item.deskripsi,
        lat: item.lat,
        long: item.long
      }));
    } else if (dataType === 'facilities') {
      // Order: No, Nama, Jenis, Lokasi, Status, Deskripsi, Lat, Long
      arrangedData = exportData.map(item => ({
        no: item.no,
        nama: item.nama,
        jenis: item.jenis,
        lokasi: item.lokasi,
        status: item.status,
        deskripsi: item.deskripsi,
        lat: item.lat,
        long: item.long
      }));
    } else if (dataType === 'reports') {
      // Order: No, Kategori, Lokasi, Status, Pelapor, Tanggal, Deskripsi, Lat, Long
      arrangedData = exportData.map(item => ({
        no: item.no,
        kategori: item.kategori,
        lokasi: item.lokasi,
        status: item.status,
        pelapor: item.pelapor,
        tanggal: item.tanggal,
        deskripsi: item.deskripsi,
        lat: item.lat,
        long: item.long
      }));
    } else if (dataType === 'blackspots') {
      // Order: No, Lokasi, Jenis, Total Kecelakaan, Deskripsi, Lat, Long
      arrangedData = exportData.map(item => ({
        no: item.no,
        lokasi: item.lokasi,
        jenis: item.jenis,
        totalKecelakaan: item.totalKecelakaan,
        deskripsi: item.deskripsi,
        lat: item.lat,
        long: item.long
      }));
    } else if (dataType === 'users') {
      // Order: Nama, Email, Role, Status, Last Login
      arrangedData = exportData.map(item => ({
        nama: item.nama,
        email: item.email,
        role: item.role,
        status: item.status,
        lastLogin: item.lastLogin
      }));
    }

    const ws = XLSX.utils.json_to_sheet(arrangedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(dataBlob, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

// Export to GeoJSON
export const exportToGeoJSON = (data: any[], filename: string) => {
  try {
    const geoJSON = {
      type: "FeatureCollection",
      features: data.map(item => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [item.long, item.lat]
        },
        properties: {
          no: item.no,
          tanggal: item.tanggal,
          lokasi: item.lokasi,
          jenis: item.jenis,
          kendaraan: item.kendaraan,
          korban: item.korban,
          deskripsi: item.deskripsi,
          // Additional fields for other data types
          nama: item.nama,
          status: item.status,
          kategori: item.kategori,
          pelapor: item.pelapor
        }
      }))
    };

    const dataStr = JSON.stringify(geoJSON, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    saveAs(dataBlob, `${filename}.geojson`);
    return true;
  } catch (error) {
    console.error('Error exporting to GeoJSON:', error);
    return false;
  }
};

// Import from Excel with auto-continue numbering
export const importFromExcel = (file: File, existingData: any[] = [], dataType: string = 'accidents'): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Find the highest number in existing data
        const existingNumbers = existingData.map(item => parseInt(item.no)).filter(num => !isNaN(num));
        const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
        
        // Validate and clean data with auto-continue numbering based on data type
        const validatedData = jsonData.map((item: any, index: number) => {
          const newNumber = maxNumber + index + 1;
          
          if (dataType === 'accidents') {
            return {
              no: String(newNumber).padStart(3, '0'),
              tanggal: convertDateFormat(item.tanggal),
              lokasi: String(item.lokasi || ''),
              jenis: String(item.jenis || 'Luka-luka'),
              kendaraan: String(item.kendaraan || ''),
              korban: String(item.korban || ''), // Ensure korban is always string
              deskripsi: String(item.deskripsi || ''),
              lat: parseFloat(item.lat) || 0,
              long: parseFloat(item.long) || 0
            };
          } else if (dataType === 'infrastructure') {
            return {
              no: String(newNumber).padStart(3, '0'),
              jenis: String(item.jenis || ''),
              lokasi: String(item.lokasi || ''),
              status: String(item.status || 'Aktif'),
              deskripsi: String(item.deskripsi || ''),
              lat: parseFloat(item.lat) || 0,
              long: parseFloat(item.long) || 0
            };
          } else if (dataType === 'facilities') {
            return {
              no: String(newNumber).padStart(3, '0'),
              nama: String(item.nama || ''),
              jenis: String(item.jenis || ''),
              lokasi: String(item.lokasi || ''),
              status: String(item.status || 'Aktif'),
              deskripsi: String(item.deskripsi || ''),
              lat: parseFloat(item.lat) || 0,
              long: parseFloat(item.long) || 0
            };
          } else if (dataType === 'reports') {
            return {
              no: String(newNumber).padStart(3, '0'),
              kategori: String(item.kategori || 'Rambu Rusak/Hilang'),
              lokasi: String(item.lokasi || ''),
              status: String(item.status || 'Diterima'),
              pelapor: String(item.pelapor || ''),
              tanggal: convertDateFormat(item.tanggal),
              deskripsi: String(item.deskripsi || ''),
              lat: parseFloat(item.lat) || 0,
              long: parseFloat(item.long) || 0
            };
          } else if (dataType === 'blackspots') {
            return {
              no: String(newNumber).padStart(3, '0'),
              lokasi: String(item.lokasi || ''),
              jenis: String(item.jenis || 'Blackspot'),
              totalKecelakaan: String(item.totalKecelakaan || ''), // Ensure totalKecelakaan is always string
              deskripsi: String(item.deskripsi || ''),
              lat: parseFloat(item.lat) || 0,
              long: parseFloat(item.long) || 0
            };
          } else if (dataType === 'users') {
            return {
              nama: String(item.nama || ''),
              email: String(item.email || ''),
              role: String(item.role || 'user'),
              status: String(item.status || 'active'),
              lastLogin: String(item.lastLogin || new Date().toISOString().split('T')[0])
            };
          } else {
            // Default to accidents structure
            return {
              no: String(newNumber).padStart(3, '0'),
              tanggal: convertDateFormat(item.tanggal),
              lokasi: String(item.lokasi || ''),
              jenis: String(item.jenis || 'Luka-luka'),
              kendaraan: String(item.kendaraan || ''),
              korban: String(item.korban || ''), // Ensure korban is always string
              deskripsi: String(item.deskripsi || ''),
              lat: parseFloat(item.lat) || 0,
              long: parseFloat(item.long) || 0
            };
          }
        });
        
        resolve(validatedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// Import from GeoJSON with auto-continue numbering
export const importFromGeoJSON = (file: File, existingData: any[] = [], dataType: string = 'accidents'): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const geoJSON = JSON.parse(content);
        
        if (geoJSON.type !== 'FeatureCollection' || !Array.isArray(geoJSON.features)) {
          throw new Error('Invalid GeoJSON format');
        }
        
        // Find the highest number in existing data
        const existingNumbers = existingData.map(item => parseInt(item.no)).filter(num => !isNaN(num));
        const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
        
        const importedData = geoJSON.features.map((feature: any, index: number) => {
          const properties = feature.properties || {};
          const coordinates = feature.geometry?.coordinates || [0, 0];
          const newNumber = maxNumber + index + 1;
          
          if (dataType === 'accidents') {
            return {
              no: String(newNumber).padStart(3, '0'),
              tanggal: String(properties.tanggal || ''),
              lokasi: String(properties.lokasi || ''),
              jenis: String(properties.jenis || 'Luka-luka'),
              kendaraan: String(properties.kendaraan || ''),
              korban: String(properties.korban || ''), // Ensure korban is always string
              deskripsi: String(properties.deskripsi || ''),
              lat: coordinates[1] || 0, // GeoJSON uses [long, lat] order
              long: coordinates[0] || 0
            };
          } else if (dataType === 'infrastructure') {
            return {
              no: String(newNumber).padStart(3, '0'),
              jenis: String(properties.jenis || ''),
              lokasi: String(properties.lokasi || ''),
              status: String(properties.status || 'Aktif'),
              deskripsi: String(properties.deskripsi || ''),
              lat: coordinates[1] || 0,
              long: coordinates[0] || 0
            };
          } else if (dataType === 'facilities') {
            return {
              no: String(newNumber).padStart(3, '0'),
              nama: String(properties.nama || ''),
              jenis: String(properties.jenis || ''),
              lokasi: String(properties.lokasi || ''),
              status: String(properties.status || 'Aktif'),
              deskripsi: String(properties.deskripsi || ''),
              lat: coordinates[1] || 0,
              long: coordinates[0] || 0
            };
          } else if (dataType === 'reports') {
            return {
              no: String(newNumber).padStart(3, '0'),
              kategori: String(properties.kategori || 'Rambu Rusak/Hilang'),
              lokasi: String(properties.lokasi || ''),
              status: String(properties.status || 'Diterima'),
              pelapor: String(properties.pelapor || ''),
              tanggal: String(properties.tanggal || ''),
              deskripsi: String(properties.deskripsi || ''),
              lat: coordinates[1] || 0,
              long: coordinates[0] || 0
            };
          } else if (dataType === 'blackspots') {
            return {
              no: String(newNumber).padStart(3, '0'),
              lokasi: String(properties.lokasi || ''),
              jenis: String(properties.jenis || 'Blackspot'),
              totalKecelakaan: String(properties.totalKecelakaan || ''), // Ensure totalKecelakaan is always string
              deskripsi: String(properties.deskripsi || ''),
              lat: coordinates[1] || 0,
              long: coordinates[0] || 0
            };
          } else if (dataType === 'users') {
            return {
              nama: String(properties.nama || ''),
              email: String(properties.email || ''),
              role: String(properties.role || 'user'),
              status: String(properties.status || 'active'),
              lastLogin: String(properties.lastLogin || new Date().toISOString().split('T')[0])
            };
          } else {
            // Default to accidents structure
            return {
              no: String(newNumber).padStart(3, '0'),
              tanggal: String(properties.tanggal || ''),
              lokasi: String(properties.lokasi || ''),
              jenis: String(properties.jenis || 'Luka-luka'),
              kendaraan: String(properties.kendaraan || ''),
              korban: String(properties.korban || ''), // Ensure korban is always string
              deskripsi: String(properties.deskripsi || ''),
              lat: coordinates[1] || 0,
              long: coordinates[0] || 0
            };
          }
        });
        
        resolve(importedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}; 