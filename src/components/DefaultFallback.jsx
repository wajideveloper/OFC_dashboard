import React from 'react'

const DefaultFallback = () => {
  return (
    <div className='flex flex-grow justify-center items-center absolute right-0 top-0 bottom-0 left-0'>
      <h1 className='text-gray-500 animate-pulse font-black italic text-4xl'>
        Fiber Optic Dashboard
      </h1>
    </div>
  )
}

export default DefaultFallback