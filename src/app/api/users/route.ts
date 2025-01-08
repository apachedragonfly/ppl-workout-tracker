import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { User } from '@/lib/types'
import { Db, MongoClient } from 'mongodb'

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const users = await db.collection('users').find({}).toArray();
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const client: MongoClient = await clientPromise
    const db: Db = client.db(process.env.MONGODB_DB_NAME || 'your_db_name')
    const body: User = await request.json()
    const result = await db.collection<User>("users").insertOne(body)
    return NextResponse.json(result)
  } catch (e) {
    console.error('Database error:', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 