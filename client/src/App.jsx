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
import { Route, Routes } from 'react-router-dom'
import './App.css'
import AuthLogin from './pages/auth/login'
import AuthSignUp from './pages/auth/signup'
import AuthLayout from './components/auth/layout'
import Mainlayout from './components/Home/layout'
import BrailleBridgePage from './pages/Home/BrailleBridgePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Mainlayout />}>
        <Route path="home" element={<BrailleBridgePage />} />
        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<AuthLogin />} />
          <Route path="signup" element={<AuthSignUp />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
