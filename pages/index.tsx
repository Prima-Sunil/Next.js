import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl mb-4">Welcome to File Upload App</h1>
        <div className="space-x-4">
          <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded">
            Login
          </Link>
          <Link href="/signup" className="bg-green-500 text-white px-4 py-2 rounded">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}