"use client"

import { useState } from "react"
import Link from "next/link"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export function Navbar() {

  return (
    <header className="w-full border-b border-gray-100">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="font-medium text-2xl">
          🏗️ COTI Scaffolding
        </Link>
        <div className="flex space-x-4">
            <button className="rounded-xl bg-blue-500 px-2 text-white font-semibold text-md hover:transition-100">
                🔑 <span className="m-1">Onboard</span>
            </button>
            <ConnectButton/>
        </div>
      </div>
    </header>
  )
}
