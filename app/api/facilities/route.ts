import { NextRequest, NextResponse } from 'next/server'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKkhnOVJM-FCylGi-2yVFjc-2-Jj_KVTQ",
  authDomain: "lakon-laporan-kecelakaan.firebaseapp.com",
  projectId: "lakon-laporan-kecelakaan",
  storageBucket: "lakon-laporan-kecelakaan.firebasestorage.app",
  messagingSenderId: "487670358518",
  appId: "1:487670358518:web:0a541911901d2e007f67d7"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export async function GET() {
  try {
    const facilitiesRef = collection(db, 'facilities')
    const snapshot = await getDocs(facilitiesRef)
    
    const facilities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json({ success: true, data: facilities })
  } catch (error: any) {
    console.error('Error fetching facilities:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Remove id field if present to avoid conflicts
    const { id, ...facilityData } = body
    
    const facilitiesRef = collection(db, 'facilities')
    const docRef = await addDoc(facilitiesRef, facilityData)
    
    const newFacility = {
      id: docRef.id,
      ...facilityData
    }
    
    return NextResponse.json({ success: true, data: newFacility })
  } catch (error: any) {
    console.error('Error adding facility:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }
    
    const facilityRef = doc(db, 'facilities', id)
    await updateDoc(facilityRef, updateData)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating facility:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }
    
    const facilityRef = doc(db, 'facilities', id)
    await deleteDoc(facilityRef)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting facility:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
} 