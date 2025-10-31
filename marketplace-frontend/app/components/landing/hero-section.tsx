"use client"

import { Button } from "@/app/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-medium text-gray-900 mb-8 leading-tight tracking-tight">
            Welcome Home
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl font-normal leading-relaxed">
            Building new pathways to wealth through blockchain-powered real estate
            for the global diaspora.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-20">
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg font-medium rounded-full transition-all duration-300">
                  Start Investing
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </Link>
            <Link href="#services">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  className="text-gray-900 hover:bg-gray-50 px-8 py-4 text-lg font-medium rounded-full transition-all duration-300"
                >
                  Learn more
                </Button>
              </motion.div>
            </Link>
          </div>

          {/* Hero Image Placeholder */}
          <div className="w-full max-w-5xl mx-auto mb-20">
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🏡</div>
                <p className="text-gray-600 font-medium">Fractional Real Estate Ownership</p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl text-center">
            <div className="space-y-2">
              <h3 className="text-xl font-medium text-gray-900">Fractional Ownership</h3>
              <p className="text-gray-600">Own a piece of premium real estate starting from $100</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-medium text-gray-900">Blockchain Security</h3>
              <p className="text-gray-600">Transparent and secure transactions on the blockchain</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-medium text-gray-900">Global Access</h3>
              <p className="text-gray-600">Invest in properties worldwide from anywhere</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}