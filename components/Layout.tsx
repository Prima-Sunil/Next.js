import React from 'react'
import { AuthProvider } from '../context/AuthContext'

const Layout: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        {children}
      </div>
    </AuthProvider>
  )
}

export default Layout