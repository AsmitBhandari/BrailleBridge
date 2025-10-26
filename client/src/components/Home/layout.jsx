import React from 'react'
import { useNavigate, Outlet, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logoutUser } from '../../store/authSlice'
import Logo from '../common/logo'
import { Button } from '../ui/button'
import Footer from '../common/footer'
import { User, History } from 'lucide-react'

const Mainlayout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/home')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-gray-50 to-gray-100">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between shadow-sm bg-white sticky top-0 z-10">
        <Link to="/home" className="flex items-center">
          <Logo />
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Link to="/home/dashboard">
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
              <Link to="/home/history">
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </Button>
              </Link>
              <Link to="/home/profile">
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/auth/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
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

