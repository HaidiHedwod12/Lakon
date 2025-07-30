import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  status: "Diterima" | "Dalam Peninjauan" | "Ditindaklanjuti" | "Selesai";
  pelapor: string;
  tanggal: string;
  deskripsi: string;
  lat: number;
  long: number;
}

export interface BlackspotData {
  id?: string;
  no: string;
  lokasi: string;
  jenis: "Blackspot" | "Potential Blackspot";
  totalKecelakaan: string;
  deskripsi: string;
  lat: number;
  long: number;
}

export interface UserData {
  id?: string;
  nama: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  lastLogin: string;
}

type DataType = AccidentData | InfrastructureData | FacilityData | ReportData | BlackspotData | UserData;

export const useFirebase = (collectionName: string) => {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use API routes for all collections
  const getData = async () => {
    setLoading(true);
    setError(null);
    
    const apiEndpoints = {
      'accidents': '/api/accidents',
      'infrastructure': '/api/infrastructure', 
      'facilities': '/api/facilities',
      'reports': '/api/reports',
      'blackspots': '/api/blackspots',
      'users': '/api/users'
    };
    
    const endpoint = apiEndpoints[collectionName as keyof typeof apiEndpoints];
    
    if (endpoint) {
      try {
        const res = await fetch(endpoint);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || 'Unknown error');
        }
      } catch (err: any) {
        setError(`Error fetching ${collectionName}: ` + err.message);
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Fallback: Firestore SDK for other collections
    try {
      const collectionRef = collection(db, collectionName);
      let q;
      try {
        q = query(collectionRef, orderBy('no'));
      } catch (error) {
        q = query(collectionRef);
      }
      const querySnapshot = await getDocs(q);
      const dataArray: DataType[] = [];
      querySnapshot.forEach((doc: any) => {
        const docData = doc.data();
        const dataWithId = { id: doc.id, ...docData } as DataType;
        dataArray.push(dataWithId);
      });
      setData(dataArray);
    } catch (err: any) {
      setError(`Error fetching ${collectionName}: ` + err);
    } finally {
      setLoading(false);
    }
  };

  const addData = async (dataToAdd: Omit<DataType, 'id'>) => {
    setLoading(true);
    setError(null);
    
    const apiEndpoints = {
      'accidents': '/api/accidents',
      'infrastructure': '/api/infrastructure', 
      'facilities': '/api/facilities',
      'reports': '/api/reports',
      'blackspots': '/api/blackspots',
      'users': '/api/users'
    };
    
    const endpoint = apiEndpoints[collectionName as keyof typeof apiEndpoints];
    
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToAdd)
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Unknown error');
        await getData();
        return json.data?.id;
      } catch (err: any) {
        setError(`Error adding ${collectionName}: ` + err.message);
        throw err;
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Fallback: Firestore SDK for other collections
    try {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, dataToAdd);
      await getData();
      return docRef.id;
    } catch (err: any) {
      setError(`Error adding ${collectionName}: ` + err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (id: string, dataToUpdate: Partial<DataType>) => {
    setLoading(true);
    setError(null);
    
    const apiEndpoints = {
      'accidents': '/api/accidents',
      'infrastructure': '/api/infrastructure', 
      'facilities': '/api/facilities',
      'reports': '/api/reports',
      'blackspots': '/api/blackspots',
      'users': '/api/users'
    };
    
    const endpoint = apiEndpoints[collectionName as keyof typeof apiEndpoints];
    
    if (endpoint) {
      try {
        const res = await fetch(`${endpoint}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToUpdate)
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Unknown error');
        await getData();
      } catch (err: any) {
        setError(`Error updating ${collectionName}: ` + err.message);
        throw err;
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Fallback: Firestore SDK for other collections
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, dataToUpdate);
      await getData();
    } catch (err: any) {
      setError(`Error updating ${collectionName}: ` + err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async (id: string) => {
    setLoading(true);
    setError(null);
    
    const apiEndpoints = {
      'accidents': '/api/accidents',
      'infrastructure': '/api/infrastructure', 
      'facilities': '/api/facilities',
      'reports': '/api/reports',
      'blackspots': '/api/blackspots',
      'users': '/api/users'
    };
    
    const endpoint = apiEndpoints[collectionName as keyof typeof apiEndpoints];
    
    if (endpoint) {
      try {
        const res = await fetch(`${endpoint}/${id}`, {
          method: 'DELETE'
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Unknown error');
        await getData();
      } catch (err: any) {
        setError(`Error deleting ${collectionName}: ` + err.message);
        throw err;
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Fallback: Firestore SDK for other collections
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      await getData();
    } catch (err: any) {
      setError(`Error deleting ${collectionName}: ` + err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [collectionName]);

  return {
    data,
    loading,
    error,
    getData,
    addData,
    updateData,
    deleteData
  };
}; 