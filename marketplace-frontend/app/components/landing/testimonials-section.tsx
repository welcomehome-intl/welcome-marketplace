"use client"

import { Star, Quote } from "lucide-react"
import { motion } from "framer-motion"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Okonkwo",
      role: "Property Investor",
      location: "London, UK",
      image: "SO",
      content: "Welcome Home made it incredibly easy to invest in property back home. The blockchain technology gives me complete transparency and peace of mind.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Real Estate Portfolio Manager",
      location: "New York, USA",
      image: "MC",
      content: "The fractional ownership model is revolutionary. I've diversified my portfolio across multiple properties with just a fraction of traditional investment.",
      rating: 5
    },
    {
      name: "Amara Johnson",
      role: "First-Time Investor",
      location: "Toronto, Canada",
      image: "AJ",
      content: "As someone new to real estate investment, the platform is intuitive and the support team is exceptional. I'm building wealth for my family's future.",
      rating: 5
    }
  ]

  return (
    <section className="py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-medium text-gray-900 mb-8 tracking-tight">
            Trusted by Investors Worldwide
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-normal">
            Join thousands of investors building generational wealth through blockchain-powered real estate.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 rounded-3xl p-8 hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-gray-300 mb-6" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-gray-900 text-gray-900" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 leading-relaxed font-normal mb-8">
                {testimonial.content}
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {testimonial.image}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-xs text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">5,000+</p>
            <p className="text-gray-600">Active Investors</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">$50M+</p>
            <p className="text-gray-600">Assets Under Management</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">150+</p>
            <p className="text-gray-600">Properties Listed</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">25+</p>
            <p className="text-gray-600">Countries Served</p>
          </div>
        </div>
      </div>
    </section>
  )
}
