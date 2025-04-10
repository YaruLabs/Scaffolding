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
        <div className="">
            <ConnectButton/>
        </div>
      </div>
    </header>
  )
}
