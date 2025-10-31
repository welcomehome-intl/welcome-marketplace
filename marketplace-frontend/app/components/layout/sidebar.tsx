"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Activity, Settings, HelpCircle, Instagram, Linkedin, Shield, FileText, Wallet } from "lucide-react"
import { cn } from "@/app/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { motion } from "framer-motion"
import { useAccount } from "wagmi"

const sidebarItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Portfolio",
    href: "/portfolio",
    icon: Wallet,
  },
  {
    name: "KYC",
    href: "/kyc",
    icon: FileText,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: Activity,
  },
  {
    name: "Admin",
    href: "/admin",
    icon: Shield,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { address, isConnected } = useAccount()

  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : 'Not Connected'

  const avatarInitials = address
    ? address.slice(2, 4).toUpperCase()
    : '??'

  return (
    <div className="flex h-screen w-64 flex-col bg-black">
      {/* User Profile */}
      <div className="flex flex-col items-center justify-center p-6 text-white">
        <Avatar className="h-16 w-16 mb-3">
          <AvatarFallback className="bg-primary text-white text-lg">{avatarInitials}</AvatarFallback>
        </Avatar>
        <h3 className="text-sm font-semibold">{displayAddress}</h3>
        <p className="text-xs text-gray-300">
          {isConnected ? 'Wallet Connected' : 'No wallet connected'}
        </p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-200 transition-all duration-300 hover:bg-gray-900 hover:text-white hover:translate-x-1 mb-2",
                  isActive && "bg-gray-900 text-white shadow-lg"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Help Section */}
      <div className="p-4">
        <div className="rounded-lg bg-primary p-4 text-center mb-4">
          <HelpCircle className="h-8 w-8 text-white mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-white mb-1">Need help?</h4>
          <p className="text-xs text-white/80 mb-3">Talk to us</p>
          <Button size="sm" variant="secondary" className="w-full">
            Support
          </Button>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-2 mb-4">
          <button className="rounded-lg bg-gray-800 p-2 text-white hover:bg-gray-700">
            <Instagram className="h-4 w-4" />
          </button>
          <button className="rounded-lg bg-gray-800 p-2 text-white hover:bg-gray-700">
            <Linkedin className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}