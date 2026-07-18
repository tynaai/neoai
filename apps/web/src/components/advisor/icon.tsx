import {
  Baby,
  BedDouble,
  Crown,
  Leaf,
  Moon,
  PiggyBank,
  Ruler,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Sun,
  Wallet,
  Wind,
  type LucideIcon,
} from 'lucide-react'

// Resolve a lucide icon by the string name stored in mock data.
const iconMap: Record<string, LucideIcon> = {
  Baby,
  BedDouble,
  Crown,
  Leaf,
  Moon,
  PiggyBank,
  Ruler,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Sun,
  Wallet,
  Wind,
}

export function DynamicIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon = iconMap[name] ?? Sparkles
  return <Icon className={className} aria-hidden />
}
