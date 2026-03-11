import type { ReactNode } from 'react'

export interface TypeConfig {
  label: string
  color: string
  bgColor: string
  icon: ReactNode
}

const IconIrritant = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
)

const IconCoupDeCoeur = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
)

const IconSuggestion = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7Z" />
    <path d="M9 21h6" />
  </svg>
)

const IconQuestion = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
)

const IconNeutre = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 15h8" />
  </svg>
)

export const TYPE_ORDER = [
  'Irritant / Point de rupture',
  'Élément apprécié / Coup de coeur',
  'Question récurrente',
  'Demande / Suggestion',
  'Remarque neutre',
] as const

export const TYPE_CONFIG: Record<string, TypeConfig> = {
  'Irritant / Point de rupture': {
    label: 'Problème',
    color: '#F87171',
    bgColor: 'bg-red-100',
    icon: <IconIrritant />,
  },
  'Élément apprécié / Coup de coeur': {
    label: 'Coup de cœur',
    color: '#34D399',
    bgColor: 'bg-emerald-100',
    icon: <IconCoupDeCoeur />,
  },
  'Demande / Suggestion': {
    label: 'Suggestion',
    color: '#60A5FA',
    bgColor: 'bg-blue-100',
    icon: <IconSuggestion />,
  },
  'Question récurrente': {
    label: 'Question',
    color: '#A78BFA',
    bgColor: 'bg-violet-100',
    icon: <IconQuestion />,
  },
  'Remarque neutre': {
    label: 'Neutre',
    color: '#94A3B8',
    bgColor: 'bg-slate-100',
    icon: <IconNeutre />,
  },
}

export function getTypeConfig(type: string): TypeConfig {
  return (
    TYPE_CONFIG[type] ?? {
      label: type,
      color: '#64748B',
      bgColor: 'bg-slate-100',
      icon: <IconNeutre />,
    }
  )
}
