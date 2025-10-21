import React from 'react'
import { Outlet } from 'react-router-dom'
import cover from '../../assets/cover.png'
import { Card } from '../ui/card'

const AuthLayout = () => {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <Card className='max-w-3xl w-full mx-4 shadow-xl rounded-3xl'>
        <div className='flex flex-col lg:flex-row items-center justify-center'>

          {/* Left Section - Cover Image */}
          <div className='hidden lg:flex lg:w-[45%] items-center justify-center  rounded-l-3xl p-5 h-[480px]'>
            <div className='bg-white rounded-2xl shadow-md p-4 flex items-center justify-center w-full h-full'>
              <img
                src={cover}
                alt="cover"
                className='w-full h-full object-contain rounded-xl'
              />
            </div>
          </div>

          {/* Right Section - Form */}
          <div className='flex-1 flex items-center justify-center p-6 h-[480px]'>
            <div className='bg-white rounded-2xl shadow-md p-6 w-full max-w-sm h-full flex items-center justify-center'>
              <Outlet />
            </div>
          </div>

        </div>
      </Card>
    </div>
  )
}

export default AuthLayout
