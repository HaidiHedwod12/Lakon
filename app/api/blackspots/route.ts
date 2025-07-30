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
    const blackspotsRef = db.collection('blackspots')
    const snapshot = await blackspotsRef.get()
    
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
    
    const blackspotsRef = db.collection('blackspots')
    const docRef = await blackspotsRef.add(blackspotData)
    
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