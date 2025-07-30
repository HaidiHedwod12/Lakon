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
    const accidentsRef = collection(db, 'accidents')
    const snapshot = await getDocs(accidentsRef)
    
    const accidents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json({ success: true, data: accidents })
  } catch (error: any) {
    console.error('Error fetching accidents:', error)
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
    const { id, ...accidentData } = body
    
    const accidentsRef = collection(db, 'accidents')
    const docRef = await addDoc(accidentsRef, accidentData)
    
    const newAccident = {
      id: docRef.id,
      ...accidentData
    }
    
    return NextResponse.json({ success: true, data: newAccident })
  } catch (error: any) {
    console.error('Error adding accident:', error)
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
    
    const accidentRef = doc(db, 'accidents', id)
    await updateDoc(accidentRef, updateData)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating accident:', error)
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
    
    const accidentRef = doc(db, 'accidents', id)
    await deleteDoc(accidentRef)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting accident:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
} 