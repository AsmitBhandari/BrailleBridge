import React from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import Logo from '../common/logo'
import { Button } from '../ui/button'
import Footer from '../common/footer'

const Mainlayout = () => {
  const navigate = useNavigate()
 const onNavigate = (path) => {
    navigate(`/${path}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-gray-50 to-gray-100">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between shadow-sm bg-white sticky top-0 z-10">
        <Logo />

        <nav className="flex items-center gap-3">
          <Button
            className="rounded-xl text-sm font-medium  hover:bg-grey-200 transition-all duration-200"
            onClick={() => onNavigate('auth/login')}
          >
            Login
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  )
}

export default Mainlayout

