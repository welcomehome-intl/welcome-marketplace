"use client"

import { Heart, Users, Globe2, TrendingUp, Shield, Handshake } from "lucide-react"

export function MissionSection() {
  const values = [
    {
      icon: Heart,
      title: "Cultural Connection",
      description: "Reconnecting the diaspora with their ancestral lands through meaningful investment opportunities."
    },
    {
      icon: Users,
      title: "Community First",
      description: "Building strong communities that support each other's journey to financial independence."
    },
    {
      icon: Globe2,
      title: "Global Access",
      description: "Making international real estate investment accessible to everyone, regardless of location."
    },
    {
      icon: TrendingUp,
      title: "Wealth Creation",
      description: "Creating sustainable pathways to generational wealth through innovative technology."
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Ensuring transparent, secure, and compliant investment processes."
    },
    {
      icon: Handshake,
      title: "Partnership",
      description: "Working together with local communities to create mutual value and growth."
    }
  ]

  return (
    <section className="py-32 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Mission Statement */}
        <div className="max-w-4xl mx-auto text-center mb-24">
          <h2 className="text-5xl md:text-6xl font-medium text-gray-900 mb-8 tracking-tight">
            Our Mission
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-normal">
            Building generational wealth while maintaining connection to cultural roots.
            A new approach to real estate investment.
          </p>
        </div>

        {/* Values Grid */}
        <div className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-gray-900" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed font-normal">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vision Statement */}
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-medium text-gray-900 mb-8">Our Vision</h3>
          <p className="text-lg text-gray-600 leading-relaxed font-normal">
            To become the leading platform for diaspora real estate investment, creating a global network
            where cultural heritage meets financial opportunity.
          </p>
        </div>
      </div>
    </section>
  )
}