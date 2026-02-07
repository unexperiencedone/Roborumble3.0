"use client"

import React from 'react'
import Navbar from '../components/Navbar'
import StarryBackground from '../components/Patrons/StarryBackground'
import Patrons from '../components/Patrons/Patrons'
import Footer from '../components/Footer'

const Page = () => {
  return (
    <main className="min-h-screen relative w-full overflow-hidden bg-black">
      
      {/* 1. Navbar (Sabse upar fixed) */}
      <Navbar />

      {/* 2. Background Layer (Peeche Fixed) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarryBackground />
      </div>

      {/* 3. Main Content Wrapper */}
      <div className="relative z-10 w-full pt-24 pb-10">
        <Patrons />
      </div>

       <Footer />
      
    </main>
  )
}

export default Page
