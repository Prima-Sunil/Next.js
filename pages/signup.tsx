import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // Basic signup logic
    router.push('/login')
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <form onSubmit={handleSignup} className="bg-white shadow-md rounded px-8 pt-6 pb-8">
          <h2 className="text-2xl mb-4">Sign Up</h2>
          <input 
            type="email" 
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />
          <input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />
          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            Sign Up
          </button>
          <Link href="/login" className="block text-center mt-4">
            Already have an account? Login
          </Link>
        </form>
      </div>
    </div>
  )
}
