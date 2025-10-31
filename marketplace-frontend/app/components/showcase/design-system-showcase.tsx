"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import {
  ModernCard,
  ModernCardHeader,
  ModernCardTitle,
  ModernCardDescription,
  ModernCardContent,
  MetricCard
} from "../ui/modern-card"
import {
  ModernInput,
  FloatingLabelInput,
  SearchInput
} from "../ui/modern-input"
import {
  ModernBadge,
  StatusBadge,
  NotificationBadge,
  PropertyTypeBadge
} from "../ui/modern-badge"
import {
  Building2,
  DollarSign,
  TrendingUp,
  Users,
  Search,
  Mail,
  Lock,
  Star,
  Zap,
  Shield,
  Heart,
  Download,
  Share,
  Settings
} from "lucide-react"

export function DesignSystemShowcase() {
  const [inputValue, setInputValue] = useState("")
  const [floatingValue, setFloatingValue] = useState("")
  const [searchValue, setSearchValue] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-teal-50/30 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
            Modern Design System
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Enhanced UI components with modern aesthetics, maintaining the signature teal color scheme
          </p>
        </div>

        {/* Button Showcase */}
        <ModernCard variant="glass" className="space-y-6">
          <ModernCardHeader>
            <ModernCardTitle size="lg" gradient>Button Variants</ModernCardTitle>
            <ModernCardDescription>
              Modern button components with enhanced interactions and visual feedback
            </ModernCardDescription>
          </ModernCardHeader>

          <ModernCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Primary Buttons */}
              <div className="space-y-4">
                <h4 className="font-semibold text-neutral-700">Primary Styles</h4>
                <div className="space-y-3">
                  <Button variant="default" leftIcon={<Building2 className="h-4 w-4" />}>
                    Default Button
                  </Button>
                  <Button variant="gradient" leftIcon={<Zap className="h-4 w-4" />}>
                    Gradient Button
                  </Button>
                  <Button variant="glow" leftIcon={<Star className="h-4 w-4" />}>
                    Glow Button
                  </Button>
                  <Button variant="soft" leftIcon={<Shield className="h-4 w-4" />}>
                    Soft Button
                  </Button>
                </div>
              </div>

              {/* Secondary Buttons */}
              <div className="space-y-4">
                <h4 className="font-semibold text-neutral-700">Secondary Styles</h4>
                <div className="space-y-3">
                  <Button variant="outline" leftIcon={<Heart className="h-4 w-4" />}>
                    Outline Button
                  </Button>
                  <Button variant="ghost" leftIcon={<Download className="h-4 w-4" />}>
                    Ghost Button
                  </Button>
                  <Button variant="secondary" leftIcon={<Share className="h-4 w-4" />}>
                    Secondary Button
                  </Button>
                  <Button variant="link" leftIcon={<Settings className="h-4 w-4" />}>
                    Link Button
                  </Button>
                </div>
              </div>

              {/* Button Sizes & States */}
              <div className="space-y-4">
                <h4 className="font-semibold text-neutral-700">Sizes & States</h4>
                <div className="space-y-3">
                  <Button size="sm" variant="gradient">Small Button</Button>
                  <Button size="default" variant="gradient">Default Button</Button>
                  <Button size="lg" variant="gradient">Large Button</Button>
                  <Button size="xl" variant="gradient">Extra Large</Button>
                  <Button loading variant="default">Loading...</Button>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Card Showcase */}
        <ModernCard variant="elevated" className="space-y-6">
          <ModernCardHeader>
            <ModernCardTitle size="lg" gradient>Card Variants</ModernCardTitle>
            <ModernCardDescription>
              Modern card designs with glass morphism and enhanced depth
            </ModernCardDescription>
          </ModernCardHeader>

          <ModernCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ModernCard variant="default" hover>
                <ModernCardHeader>
                  <ModernCardTitle>Default Card</ModernCardTitle>
                  <ModernCardDescription>Clean and minimal design</ModernCardDescription>
                </ModernCardHeader>
                <ModernCardContent>
                  <p className="text-sm text-neutral-600">
                    Perfect for general content display with subtle shadows and clean borders.
                  </p>
                </ModernCardContent>
              </ModernCard>

              <ModernCard variant="glass" hover>
                <ModernCardHeader>
                  <ModernCardTitle>Glass Card</ModernCardTitle>
                  <ModernCardDescription>Modern glassmorphism effect</ModernCardDescription>
                </ModernCardHeader>
                <ModernCardContent>
                  <p className="text-sm text-neutral-600">
                    Beautiful glass effect with backdrop blur for a premium appearance.
                  </p>
                </ModernCardContent>
              </ModernCard>

              <ModernCard variant="gradient" hover>
                <ModernCardHeader>
                  <ModernCardTitle>Gradient Card</ModernCardTitle>
                  <ModernCardDescription>Subtle gradient background</ModernCardDescription>
                </ModernCardHeader>
                <ModernCardContent>
                  <p className="text-sm text-neutral-600">
                    Soft gradient background that maintains excellent readability.
                  </p>
                </ModernCardContent>
              </ModernCard>

              <ModernCard variant="bordered" hover>
                <ModernCardHeader>
                  <ModernCardTitle>Bordered Card</ModernCardTitle>
                  <ModernCardDescription>Enhanced border interactions</ModernCardDescription>
                </ModernCardHeader>
                <ModernCardContent>
                  <p className="text-sm text-neutral-600">
                    Interactive borders that respond to hover states with color transitions.
                  </p>
                </ModernCardContent>
              </ModernCard>

              <ModernCard variant="soft" hover>
                <ModernCardHeader>
                  <ModernCardTitle>Soft Card</ModernCardTitle>
                  <ModernCardDescription>Gentle and approachable</ModernCardDescription>
                </ModernCardHeader>
                <ModernCardContent>
                  <p className="text-sm text-neutral-600">
                    Soft colors and subtle backdrop effects for a welcoming feel.
                  </p>
                </ModernCardContent>
              </ModernCard>

              <ModernCard variant="glow" hover>
                <ModernCardHeader>
                  <ModernCardTitle>Glow Card</ModernCardTitle>
                  <ModernCardDescription>Subtle glow effects</ModernCardDescription>
                </ModernCardHeader>
                <ModernCardContent>
                  <p className="text-sm text-neutral-600">
                    Gentle glow effects that enhance visual hierarchy and focus.
                  </p>
                </ModernCardContent>
              </ModernCard>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Metric Cards */}
        <ModernCard variant="glass" className="space-y-6">
          <ModernCardHeader>
            <ModernCardTitle size="lg" gradient>Metric Cards</ModernCardTitle>
            <ModernCardDescription>
              Specialized cards for displaying key performance indicators
            </ModernCardDescription>
          </ModernCardHeader>

          <ModernCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Value"
                value="$2.4M"
                change={{ value: 12.5, period: "vs last month", isPositive: true }}
                icon={<DollarSign className="h-5 w-5" />}
                variant="gradient"
              />

              <MetricCard
                title="Properties"
                value="24"
                change={{ value: 8.2, period: "vs last month", isPositive: true }}
                icon={<Building2 className="h-5 w-5" />}
                variant="glow"
              />

              <MetricCard
                title="ROI"
                value="8.7%"
                change={{ value: -2.1, period: "vs last month", isPositive: false }}
                icon={<TrendingUp className="h-5 w-5" />}
                variant="elevated"
              />

              <MetricCard
                title="Investors"
                value="1,247"
                change={{ value: 15.3, period: "vs last month", isPositive: true }}
                icon={<Users className="h-5 w-5" />}
                variant="soft"
              />
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Input Showcase */}
        <ModernCard variant="elevated" className="space-y-6">
          <ModernCardHeader>
            <ModernCardTitle size="lg" gradient>Input Components</ModernCardTitle>
            <ModernCardDescription>
              Modern input fields with enhanced validation and interactive states
            </ModernCardDescription>
          </ModernCardHeader>

          <ModernCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Standard Inputs */}
              <div className="space-y-6">
                <h4 className="font-semibold text-neutral-700">Standard Inputs</h4>

                <ModernInput
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  leftIcon={<Mail className="h-4 w-4" />}
                  helperText="We'll never share your email"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />

                <ModernInput
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  showPasswordToggle
                  helperText="Minimum 8 characters required"
                />

                <ModernInput
                  label="Success State"
                  placeholder="This field is valid"
                  success="Great! This looks good."
                  leftIcon={<Shield className="h-4 w-4" />}
                />

                <ModernInput
                  label="Error State"
                  placeholder="This field has an error"
                  error="This field is required"
                  leftIcon={<Mail className="h-4 w-4" />}
                />
              </div>

              {/* Special Inputs */}
              <div className="space-y-6">
                <h4 className="font-semibold text-neutral-700">Special Variants</h4>

                <FloatingLabelInput
                  label="Floating Label"
                  placeholder="Watch the label float"
                  value={floatingValue}
                  onChange={(e) => setFloatingValue(e.target.value)}
                />

                <SearchInput
                  placeholder="Search properties..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClear={() => setSearchValue("")}
                />

                <ModernInput
                  variant="ghost"
                  label="Ghost Variant"
                  placeholder="Minimal underline style"
                />

                <ModernInput
                  variant="soft"
                  label="Soft Variant"
                  placeholder="Gentle background style"
                />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Badge Showcase */}
        <ModernCard variant="glass" className="space-y-6">
          <ModernCardHeader>
            <ModernCardTitle size="lg" gradient>Badge Components</ModernCardTitle>
            <ModernCardDescription>
              Modern badges for status, categories, and notifications
            </ModernCardDescription>
          </ModernCardHeader>

          <ModernCardContent>
            <div className="space-y-8">
              {/* Standard Badges */}
              <div className="space-y-4">
                <h4 className="font-semibold text-neutral-700">Standard Badges</h4>
                <div className="flex flex-wrap gap-3">
                  <ModernBadge variant="default">Default</ModernBadge>
                  <ModernBadge variant="secondary">Secondary</ModernBadge>
                  <ModernBadge variant="success">Success</ModernBadge>
                  <ModernBadge variant="warning">Warning</ModernBadge>
                  <ModernBadge variant="error">Error</ModernBadge>
                  <ModernBadge variant="info">Info</ModernBadge>
                  <ModernBadge variant="gradient">Gradient</ModernBadge>
                  <ModernBadge variant="outline">Outline</ModernBadge>
                  <ModernBadge variant="soft">Soft</ModernBadge>
                  <ModernBadge variant="glow">Glow</ModernBadge>
                </div>
              </div>

              {/* Badge Sizes */}
              <div className="space-y-4">
                <h4 className="font-semibold text-neutral-700">Badge Sizes</h4>
                <div className="flex items-center gap-3">
                  <ModernBadge size="xs" variant="gradient">Extra Small</ModernBadge>
                  <ModernBadge size="sm" variant="gradient">Small</ModernBadge>
                  <ModernBadge size="default" variant="gradient">Default</ModernBadge>
                  <ModernBadge size="lg" variant="gradient">Large</ModernBadge>
                </div>
              </div>

              {/* Status Badges */}
              <div className="space-y-4">
                <h4 className="font-semibold text-neutral-700">Status Badges</h4>
                <div className="flex flex-wrap gap-3">
                  <StatusBadge status="active" />
                  <StatusBadge status="inactive" />
                  <StatusBadge status="pending" />
                  <StatusBadge status="approved" />
                  <StatusBadge status="denied" />
                  <StatusBadge status="expired" />
                </div>
              </div>

              {/* Property Type Badges */}
              <div className="space-y-4">
                <h4 className="font-semibold text-neutral-700">Property Type Badges</h4>
                <div className="flex flex-wrap gap-3">
                  <PropertyTypeBadge propertyType="residential" />
                  <PropertyTypeBadge propertyType="commercial" />
                  <PropertyTypeBadge propertyType="industrial" />
                  <PropertyTypeBadge propertyType="mixed-use" />
                  <PropertyTypeBadge propertyType="land" />
                </div>
              </div>

              {/* Interactive Badges */}
              <div className="space-y-4">
                <h4 className="font-semibold text-neutral-700">Interactive Badges</h4>
                <div className="flex flex-wrap gap-3">
                  <ModernBadge
                    variant="soft"
                    icon={<Star className="h-3 w-3" />}
                  >
                    With Icon
                  </ModernBadge>
                  <ModernBadge variant="default" dot>
                    With Dot
                  </ModernBadge>
                  <ModernBadge
                    variant="outline"
                    removable
                    onRemove={() => console.log("Badge removed")}
                  >
                    Removable
                  </ModernBadge>

                  {/* Notification Badge Demo */}
                  <div className="relative inline-flex">
                    <Button variant="ghost" size="icon">
                      <Building2 className="h-4 w-4" />
                    </Button>
                    <NotificationBadge count={3} />
                  </div>

                  <div className="relative inline-flex">
                    <Button variant="ghost" size="icon">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <NotificationBadge count={127} max={99} variant="success" />
                  </div>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Color Palette */}
        <ModernCard variant="elevated" className="space-y-6">
          <ModernCardHeader>
            <ModernCardTitle size="lg" gradient>Enhanced Color Palette</ModernCardTitle>
            <ModernCardDescription>
              Extended teal-based color system with semantic variations
            </ModernCardDescription>
          </ModernCardHeader>

          <ModernCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Teal Palette */}
              <div className="space-y-3">
                <h4 className="font-semibold text-neutral-700">Teal (Primary)</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 border"></div>
                    <span className="text-sm">teal-50</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-100"></div>
                    <span className="text-sm">teal-100</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-300"></div>
                    <span className="text-sm">teal-300</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500"></div>
                    <span className="text-sm">teal-500</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-700"></div>
                    <span className="text-sm">teal-700</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-900"></div>
                    <span className="text-sm">teal-900</span>
                  </div>
                </div>
              </div>

              {/* Success Palette */}
              <div className="space-y-3">
                <h4 className="font-semibold text-neutral-700">Success</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success-50 border"></div>
                    <span className="text-sm">success-50</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success-100"></div>
                    <span className="text-sm">success-100</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success-300"></div>
                    <span className="text-sm">success-300</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success-500"></div>
                    <span className="text-sm">success-500</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success-700"></div>
                    <span className="text-sm">success-700</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success-900"></div>
                    <span className="text-sm">success-900</span>
                  </div>
                </div>
              </div>

              {/* Warning Palette */}
              <div className="space-y-3">
                <h4 className="font-semibold text-neutral-700">Warning</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warning-50 border"></div>
                    <span className="text-sm">warning-50</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warning-100"></div>
                    <span className="text-sm">warning-100</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warning-300"></div>
                    <span className="text-sm">warning-300</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warning-500"></div>
                    <span className="text-sm">warning-500</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warning-700"></div>
                    <span className="text-sm">warning-700</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warning-900"></div>
                    <span className="text-sm">warning-900</span>
                  </div>
                </div>
              </div>

              {/* Error Palette */}
              <div className="space-y-3">
                <h4 className="font-semibold text-neutral-700">Error</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-error-50 border"></div>
                    <span className="text-sm">error-50</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-error-100"></div>
                    <span className="text-sm">error-100</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-error-300"></div>
                    <span className="text-sm">error-300</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-error-500"></div>
                    <span className="text-sm">error-500</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-error-700"></div>
                    <span className="text-sm">error-700</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-error-900"></div>
                    <span className="text-sm">error-900</span>
                  </div>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>
    </div>
  )
}