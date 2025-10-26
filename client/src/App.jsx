// import { Route, Routes } from 'react-router-dom'
// import './App.css'
// import AuthLogin from './pages/auth/login'
// import AuthSignUp from './pages/auth/signup'
// import AuthLayout from './components/auth/layout'
// import Mainlayout from './components/Home/layout'
// import BrailleBridgePage from './pages/Home/BrailleBridgePage'

// function App() {
//   return (
//     <div>
//       <Routes>
//         <Route path="/*" element={<Mainlayout />} >
//           <Route index element={<BrailleBridgePage />} />
//         </Route>
//         <Route path="/auth" element={<AuthLayout />} >
//           <Route path="login" element={<AuthLogin />} />
//           <Route path="signup" element={<AuthSignUp />} />
//         </Route>
//       </Routes>
//     </div>
//   )
// }

// export default App
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { store } from './store/store'
import { verifyToken } from './store/authSlice'
import './App.css'
import AuthLogin from './pages/auth/login'
import AuthSignUp from './pages/auth/signup'
import AuthLayout from './components/auth/layout'
import Mainlayout from './components/Home/layout'
import BrailleBridgePage from './pages/Home/BrailleBridgePage'
import Dashboard from './pages/Dashboard/Dashboard'
import Profile from './pages/Profile/Profile'
import HistoryPage from './pages/History/History'

function AppContent() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Verify token on app startup
    const token = localStorage.getItem('token')
    if (token) {
      dispatch(verifyToken())
    }
  }, [dispatch])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Mainlayout />}>
          <Route index element={<BrailleBridgePage />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<AuthLogin />} />
          <Route path="signup" element={<AuthSignUp />} />
        </Route>
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App
