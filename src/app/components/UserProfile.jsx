'use client'

import { getUser, updateUser } from '@/app/actions'

export default function UserProfile({ email }) {
  const handleUpdateCredits = async () => {
    await updateUser(email, { credits: 100 })
  }

  return (
    <div>
      <button onClick={handleUpdateCredits}>Add Credits</button>
    </div>
  )
} 