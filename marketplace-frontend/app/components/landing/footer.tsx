"use client"

import Link from "next/link"
import { Home } from "lucide-react"

export function Footer() {
  const sections = [
    {
      title: "Services",
      links: [
        { name: "Fractional Real Estate", href: "/dashboard" },
        { name: "Luxury Travel", href: "#services" },
        { name: "Wealth Management", href: "#services" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "#about" },
        { name: "Contact", href: "#contact" },
        { name: "Support", href: "/support" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Investment Disclaimer", href: "/disclaimer" }
      ]
    }
  ]

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Logo */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Home className="w-6 h-6 text-gray-900" />
              <span className="text-lg font-medium text-gray-900">Welcome Home</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Building new pathways to wealth through blockchain-powered real estate.
            </p>
          </div>

          {/* Link Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-medium text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-xs text-gray-600">
            © 2024 Welcome Home International Group. All rights reserved.
          </div>
          <div className="text-xs text-gray-600">
            Securities offered through registered broker-dealers. Real estate investments involve risk.
          </div>
        </div>
      </div>
    </footer>
  )
}