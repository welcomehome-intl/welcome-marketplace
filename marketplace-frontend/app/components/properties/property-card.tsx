import Image from "next/image"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { MapPin, Home, Download } from "lucide-react"
import { formatCurrency } from "@/app/lib/utils"

interface PropertyCardProps {
  property: {
    id: number
    name: string
    location: string
    size: string
    price: number
    image: string
  }
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
      {/* Property Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={property.image}
          alt={property.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm">
            {property.size}
          </Badge>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">{property.name}</h4>
            <p className="text-sm text-gray-700 flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {property.location}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-700">Price</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(property.price)}</p>
          </div>
          <button className="rounded-lg border p-2 hover:bg-gray-50">
            <Download className="h-4 w-4" />
          </button>
        </div>

        {/* Status */}
        <div className="mt-3 flex gap-2">
          <Badge variant="success" className="text-xs">
            12% p.a
          </Badge>
          <Badge variant="outline" className="text-xs">
            2000 tokens
          </Badge>
        </div>
      </div>
    </Card>
  )
}