"use client"

import { Button } from "@/app/components/ui/button"
import {
  Building2,
  Plane,
  ArrowRight,
  TrendingUp
} from "lucide-react"
import Link from "next/link"

export function ServicesSection() {
  const services = [
    {
      icon: Building2,
      title: "Fractional Real Estate",
      description: "Own premium real estate with as little as $100. Blockchain-enabled fractional ownership across multiple countries.",
      image: "🏢"
    },
    {
      icon: Plane,
      title: "Luxury Travel",
      description: "Exclusive experiences connecting you with your investments and cultural heritage. Stay in properties you own.",
      image: "✈️"
    },
    {
      icon: TrendingUp,
      title: "Wealth Management",
      description: "Comprehensive strategies for the global diaspora. Build generational wealth through diversified portfolios.",
      image: "📈"
    }
  ]

  return (
    <section id="services" className="py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center mb-24">
          <h2 className="text-5xl md:text-6xl font-medium text-gray-900 mb-8 tracking-tight">
            Our Services
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-normal">
            Comprehensive solutions to build wealth and strengthen cultural connections.
          </p>
        </div>

        {/* Main Services */}
        <div className="space-y-24 mb-32">
          {services.map((service, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16`}>
              {/* Image/Visual */}
              <div className="flex-1">
                <div className="aspect-video bg-gray-100 rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">{service.image}</div>
                    <p className="text-gray-600 font-medium">{service.title}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-6">
                  <service.icon className="w-8 h-8 text-gray-900" />
                </div>
                <h3 className="text-3xl md:text-4xl font-medium text-gray-900 mb-6 tracking-tight">
                  {service.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed font-normal mb-8">
                  {service.description}
                </p>
                <Link href="/dashboard">
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full font-medium transition-all duration-300">
                    Learn more
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-medium text-gray-900 mb-6 tracking-tight">
            Ready to start your journey?
          </h3>
          <p className="text-lg text-gray-600 mb-8 font-normal">
            Join investors building wealth while staying connected to their roots.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg font-medium rounded-full transition-all duration-300">
                Start investing today
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="text-gray-900 hover:bg-gray-50 px-8 py-4 text-lg font-medium rounded-full transition-all duration-300"
            >
              Schedule consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}