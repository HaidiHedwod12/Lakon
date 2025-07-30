import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

export async function GET() {
  try {
    const accidentsRef = db.collection('accidents')
    const snapshot = await accidentsRef.get()
    
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
    
    const accidentsRef = db.collection('accidents')
    const docRef = await accidentsRef.add(accidentData)
    
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