"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { BrowserProvider, type Eip1193Provider } from "@coti-io/coti-ethers"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, EyeOff, Loader2 } from "lucide-react"

// Define network types and their corresponding currency symbols
const NETWORK_CURRENCIES = {
  1: "ETH", // Ethereum Mainnet
  137: "MATIC", // Polygon Mainnet
  80001: "MATIC", // Polygon Mumbai Testnet
  42161: "ETH", // Arbitrum
  43114: "AVAX", // Avalanche
  56: "BNB", // Binance Smart Chain
  2632500: "COTI", // COTI network
}

// COTI Network Chain ID
const COTI_CHAIN_ID = 2632500


// Simple encryption for sessionStorage
// Note: This is still not highly secure but better than plaintext
const encryptData = (data: string, salt: string): string => {
  // This is a simple XOR encryption - not for production use
  // In production, use a proper encryption library
  let encrypted = ""
  for (let i = 0; i < data.length; i++) {
    encrypted += String.fromCharCode(data.charCodeAt(i) ^ salt.charCodeAt(i % salt.length))
  }
  return btoa(encrypted) // Base64 encode
}

const decryptData = (encryptedData: string, salt: string): string => {
  try {
    const data = atob(encryptedData) // Base64 decode
    let decrypted = ""
    for (let i = 0; i < data.length; i++) {
      decrypted += String.fromCharCode(data.charCodeAt(i) ^ salt.charCodeAt(i % salt.length))
    }
    return decrypted
  } catch (e) {
    console.error("Failed to decrypt data")
    return ""
  }
}

export function Navbar() {

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [aesKey, setAesKey] = useState<string | null>(null)
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [userBalance, setUserBalance] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAesKey, setShowAesKey] = useState(false)
  const [networkId, setNetworkId] = useState<number | null>(null)
  const [salt, setSalt] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return // Asegura que estamos en el cliente
  
    let existingSalt = sessionStorage.getItem("coti_session_salt")
  
    if (!existingSalt) {
      existingSalt = crypto.randomUUID().replace(/-/g, "").slice(0, 32)
      sessionStorage.setItem("coti_session_salt", existingSalt)
    }
  
    setSalt(existingSalt)
  }, [])

  // Load saved data on component mount
  useEffect(() => {
    if (!salt) return // Esperar a que el salt esté disponible
  
    try {
      const encryptedAesKey = sessionStorage.getItem("coti_aes_key")
      const savedUserAddress = sessionStorage.getItem("coti_user_address")
      const savedUserBalance = sessionStorage.getItem("coti_user_balance")
      const savedNetworkId = sessionStorage.getItem("coti_network_id")
  
      if (encryptedAesKey) {
        const decryptedAesKey = decryptData(encryptedAesKey, salt)
        setAesKey(decryptedAesKey)
      }
  
      if (savedUserAddress) setUserAddress(savedUserAddress)
      if (savedUserBalance) setUserBalance(savedUserBalance)
      if (savedNetworkId) setNetworkId(Number.parseInt(savedNetworkId))
    } catch (err) {
      console.error("Error loading saved data:", err)
    }
  }, [salt])

  // Function to detect network and get its currency symbol
  const getNetworkCurrency = (chainId: number): string => {
    return NETWORK_CURRENCIES[chainId as keyof typeof NETWORK_CURRENCIES] || "ETH"
  }

  const handleOnboard = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if ethereum is available in the window object
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new BrowserProvider(window.ethereum as Eip1193Provider)

        // Get network information
        const network = await provider.getNetwork()
        const chainId = Number(network.chainId)
       
        setNetworkId(chainId)

        // Check if user is on COTI network
        if (chainId !== COTI_CHAIN_ID) {
          setError(
            `To perform onboarding, you must be connected to the COTI network (ID: ${COTI_CHAIN_ID}). You are currently on the network with ID: ${chainId}.`,
          )
          return // Stop the onboarding process
        }

        // Save network ID to sessionStorage
        sessionStorage.setItem("coti_network_id", chainId.toString())

        const signer = await provider.getSigner()
        await signer.generateOrRecoverAes()

        const onboardInfo = signer.getUserOnboardInfo()
        if (onboardInfo?.aesKey) {
          // Set AES key in state
          setAesKey(onboardInfo.aesKey)
          if(!salt) {
            throw new Error("Salt not provided");
          }
          // Encrypt and save AES key to sessionStorage
          const encryptedAesKey = encryptData(onboardInfo.aesKey, salt)
          sessionStorage.setItem("coti_aes_key", encryptedAesKey)

          // Get user address
          const address = await signer.getAddress()
          setUserAddress(address)
          sessionStorage.setItem("coti_user_address", address)

          // Get user balance
          const balance = await provider.getBalance(address)
          const balanceStr = balance.toString()
          setUserBalance(balanceStr)
          sessionStorage.setItem("coti_user_balance", balanceStr)

          console.log("AES Key generated successfully")
        } else {
          setError("Failed to retrieve AES key")
        }
      } else {
        setError("Ethereum provider not found. Please install MetaMask or another wallet.")
      }
    } catch (err) {
      console.error("Onboarding error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAesKeyVisibility = () => {
    setShowAesKey(!showAesKey)
  }

  const formatBalance = (balance: string) => {
    try {
      // Convert wei to ETH/MATIC/etc (1 unit = 10^18 wei)
      const balanceInUnit = Number.parseFloat(balance) / 1e18
      const currencySymbol = networkId ? getNetworkCurrency(networkId) : "ETH"
      return `${balanceInUnit.toFixed(4)} ${currencySymbol}`
    } catch (error) {
      return balance
    }
  }

  // Function to mask the AES key
  const maskAesKey = (key: string) => {
    return "**************************" + key.substring(key.length - 4)
  }

  // Function to clear saved data (for testing or logout)
  const clearSavedData = () => {
    sessionStorage.removeItem("coti_aes_key")
    sessionStorage.removeItem("coti_user_address")
    sessionStorage.removeItem("coti_user_balance")
    sessionStorage.removeItem("coti_network_id")
    setAesKey(null)
    setUserAddress(null)
    setUserBalance(null)
    setNetworkId(null)
  }

  return (
    <>
      <header className="w-full border-b border-gray-100">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="font-medium text-2xl">
            🏗️ COTI Scaffolding
          </Link>
          <div className="flex space-x-4">
            <button
              className={`rounded-xl px-2 font-semibold shadow-md text-md transform transition-transform duration-200 hover:scale-110 ${aesKey ? "bg-green-500 text-white shadow-xl" : "bg-blue-500 text-white"
                }`}
              onClick={() => setIsModalOpen(true)}
            >
              {aesKey ? (
                <>
                  <span className="m-1">Onboarded 😎</span>
                </>
              ) : (
                <>
                  🔑 <span className="m-1">Onboard</span>
                </>
              )}
            </button>
            <ConnectButton />
          </div>
        </div>
      </header>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>COTI Onboarding</DialogTitle>
            <DialogDescription>Generate your AES key for COTI services.</DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {!aesKey && !isLoading && !error && (
              <div className="flex flex-col items-center space-y-4">
                <p className="text-center text-sm">Click the button below to generate your AES key.</p>
                <Button onClick={handleOnboard} className="w-1/3 bg-blue-500 font-semibold shadow-md text-md hover:bg-blue-500 transform transition-transform duration-200 hover:scale-110">
                  Onboard
                </Button>
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-center text-sm">Processing your onboarding request...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-center text-sm text-red-600">{error}</p>
                <Button onClick={handleOnboard} className="w-full">
                  Try Again
                </Button>
              </div>
            )}

            {aesKey && userAddress && (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-green-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div className="space-y-3 mt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Your Address</p>
                    <p className="text-sm font-mono break-all">{userAddress}</p>
                  </div>

                  {userBalance && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Your Balance</p>
                      <p className="text-sm">{formatBalance(userBalance)}</p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-500">Your AES Key</p>
                      <Button variant="ghost" size="sm" onClick={toggleAesKeyVisibility} className="h-8 w-8 p-0">
                        {showAesKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm font-mono break-all">{showAesKey ? aesKey : maskAesKey(aesKey)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              onClick={clearSavedData}
              className={aesKey ? "opacity-100 bg-red-500 hover:bg-red-400" : "opacity-0 pointer-events-none"}
            >
              Reset Data
            </Button>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
