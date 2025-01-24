import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Basic login logic
    login({ email })
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <form onSubmit={handleLogin} className="bg-white shadow-md rounded px-8 pt-6 pb-8">
          <h2 className="text-2xl mb-4">Login</h2>
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
            Login
          </button>
          <Link href="/signup" className="block text-center mt-4">
            Create an Account
          </Link>
        </form>
      </div>
    </div>
  )
}