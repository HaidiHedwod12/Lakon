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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const accidentRef = db.collection('accidents').doc(params.id)
    const doc = await accidentRef.get()
    
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Accident not found' },
        { status: 404 }
      )
    }
    
    const accident = {
      id: doc.id,
      ...doc.data()
    }
    
    return NextResponse.json({ success: true, data: accident })
  } catch (error: any) {
    console.error('Error fetching accident:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    
    // Remove id field if present to avoid conflicts
    const { id, ...updateData } = body
    
    const accidentRef = db.collection('accidents').doc(params.id)
    await accidentRef.update(updateData)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating accident:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const accidentRef = db.collection('accidents').doc(params.id)
    await accidentRef.delete()
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting accident:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
} 