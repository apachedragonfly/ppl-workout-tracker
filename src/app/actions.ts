'use server'

import { MongoClient, Db } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { User } from '@/lib/types'

const getDb = async (): Promise<Db> => {
  const client: MongoClient = await clientPromise
  return client.db(process.env.MONGODB_DB_NAME || 'your_db_name')
}

export async function getUser(email: string): Promise<User | null> {
  const db = await getDb()
  return await db.collection<User>("users").findOne({ email })
}

export async function updateUser(email: string, data: Partial<User>) {
  const db = await getDb()
  return await db.collection<User>("users").updateOne(
    { email },
    { $set: data }
  )
} 