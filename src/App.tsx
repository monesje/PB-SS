import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ComparePage from './pages/ComparePage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const devOverride = import.meta.env.VITE_DEV_OVERRIDE === 'true'

  return (
    <AuthProvider>
      <ThemeProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {!devOverride && <Route path="/login" element={<LoginPage />} />}
            <Route path="/compare/:roleId" element={<ComparePage />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={!devOverride}>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Layout>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App