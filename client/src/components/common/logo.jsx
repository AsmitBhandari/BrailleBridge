import React from 'react'
import { Link } from 'react-router-dom'

const Logo = () => {
  return (
    <Link to="/home" className="flex items-center gap-3">
      <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-blue-800 text-white text-lg font-bold">
        BB
      </div>
      <div>
        <div className="text-lg font-semibold text-slate-900">BrailleBridge</div>
        <div className="text-xs text-slate-500">AI-Powered Braille Translator</div>
      </div>
    </Link>
  )
}

export default Logo
