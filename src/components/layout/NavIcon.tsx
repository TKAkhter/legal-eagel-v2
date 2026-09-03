import * as Icons from 'lucide-react'
import type { LucideProps } from 'lucide-react'

interface NavIconProps extends LucideProps {
  name: string
}

export function NavIcon({ name, ...props }: NavIconProps) {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name]
  if (!Icon) return null
  return <Icon size={20} strokeWidth={1.75} {...props} />
}
