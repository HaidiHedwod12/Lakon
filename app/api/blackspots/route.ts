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
    const blackspotsRef = collection(db, 'blackspots')
    const snapshot = await getDocs(blackspotsRef)
    
    const blackspots = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json({ success: true, data: blackspots })
  } catch (error: any) {
    console.error('Error fetching blackspots:', error)
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
    const { id, ...blackspotData } = body
    
    const blackspotsRef = collection(db, 'blackspots')
    const docRef = await addDoc(blackspotsRef, blackspotData)
    
    const newBlackspot = {
      id: docRef.id,
      ...blackspotData
    }
    
    return NextResponse.json({ success: true, data: newBlackspot })
  } catch (error: any) {
    console.error('Error adding blackspot:', error)
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
    
    const blackspotRef = doc(db, 'blackspots', id)
    await updateDoc(blackspotRef, updateData)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating blackspot:', error)
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
    
    const blackspotRef = doc(db, 'blackspots', id)
    await deleteDoc(blackspotRef)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting blackspot:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
} 