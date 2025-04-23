"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useState } from "react"

export function QuickStartGuide() {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    const installCommand = "git clone https://coti/scaffolding"

  return (
    <div className="w-full max-w-4xl mx-auto bg-white text-gray-900 p-8 rounded-lg border border-gray-200 shadow-lg">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold mb-4">Quickstart</h1>
          <div className="h-px bg-gray-200 w-full my-6"></div>
          <h2 className="text-xl font-semibold mb-6">The best way to start your COTI project! 😎</h2>

          <p className="text-lg mb-8">
            COTI Scaffolding is the basic frontend project in <span className="text-blue-600 hover:underline cursor:pointer">NextJS</span> and <span className="text-blue-600 hover:underline cursor-pointer">TailwindCSS </span> 
            with the implementation of:
          </p>

          <ul className="space-y-4 mb-10">
            <li className="flex items-start gap-3">
              <span className="text-xl">🔥</span>
              <span>Connect Wallet to COTI Mainnet</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">✅</span>
              <span>Onboard account</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">🦄</span>
              <span>
                Use <span className="text-blue-600 hover:underline cursor-pointer">wagmi</span> and{" "}
                <span className="text-blue-600 hover:underline cursor-pointer">coti-ethers</span>
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6">Start</h2>
          <div className="h-px bg-gray-200 w-full my-6"></div>

          <p className="text-lg mb-8">
            You can clone the scaffolding with the following command:
          </p>

          <Card className="border-gray-200 bg-gray-50 text-gray-900">
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-4 py-1 border-b border-gray-200">
                <span className="font-medium text-sm">Installation</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-900 flex items-center gap-1.5"
                  onClick={() => copyToClipboard(installCommand)}
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <div className="p-4">
                <pre className="font-mono text-sm bg-gray-50 rounded-md">{installCommand}</pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
