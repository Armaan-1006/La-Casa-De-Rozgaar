// Generate floating dossier items (offer letters and currency notes) based on candidate profile

import { mockCandidate } from './mockData'
import { currencyNoteAssets } from './floatingAssets'

// Helper to get a "handsome salary" from skill score (same as before but kept here)
const scoreSalaryMap: Record<number, string> = {
  1: '₹3.0L',
  2: '₹4.5L',
  3: '₹6.0L',
  4: '₹8.0L',
  5: '₹10L',
  6: '₹14L',
  7: '₹18L',
  8: '₹24L',
  9: '₹32L',
  10: '₹45L+',
}

export function getSalaryForScore(score: number): string {
  const rounded = Math.min(10, Math.max(1, Math.round(score)))
  return scoreSalaryMap[rounded] || '₹10L'
}

// Determine which skills to feature based on score (higher score = more likely to be featured)
export function getFeaturedSkills(maxItems: number = 3): Array<{name: string; score: number; salary: string}> {
  // Sort skills by score descending
  const sorted = [...mockCandidate.skills].sort((a, b) => b.score - a.score)
  // Take top N
  const top = sorted.slice(0, maxItems)
  return top.map(skill => ({
    name: skill.name,
    score: skill.score,
    salary: getSalaryForScore(skill.score)
  }))
}

// Pick currency notes based on overall candidate level (average skill score)
export function getCurrencyNotes(count: number = 3): Array<{value: number; denom: string; color: string}> {
  const avgScore = mockCandidate.skills.reduce((sum, s) => sum + s.score, 0) / mockCandidate.skills.length
  // Higher avgScore -> higher denomination notes
  const sortedNotes = [...currencyNoteAssets.denominations].sort((a, b) => {
    // Prefer higher value for higher avgScore
    if (avgScore > 7) return b.value - a.value
    if (avgScore > 5) return (b.value - a.value) * 0.5
    return a.value - b.value
  })
  return sortedNotes.slice(0, count).map(n => ({
    value: n.value,
    denom: `₹${n.value}`,
    color: n.color
  }))
}

export interface FloatingItemDef {
  type: 'offerLetter' | 'currencyNote'
  id: string
  data: any
  depth: 'foreground' | 'mid' | 'background'
  anchorX: string
  anchorY: string
  baseRot: number
}

// Perimeter full-screen slots for optimal immersion without cluttering the center content
const screenSlots: Array<{ anchorX: string; anchorY: string; baseRot: number; depth: 'foreground' | 'mid' | 'background' }> = [
  { anchorX: '12%', anchorY: '20%', baseRot: -7, depth: 'background' },
  { anchorX: '84%', anchorY: '18%', baseRot: 6, depth: 'foreground' },
  { anchorX: '15%', anchorY: '78%', baseRot: 5, depth: 'mid' },
  { anchorX: '82%', anchorY: '80%', baseRot: -6, depth: 'foreground' },
  { anchorX: '52%', anchorY: '12%', baseRot: 3, depth: 'background' },
  { anchorX: '88%', anchorY: '50%', baseRot: -4, depth: 'mid' }
]

// Generate the list of floating items to render
export function generateFloatingItems(): FloatingItemDef[] {
  const rawItems: Array<{ type: 'offerLetter' | 'currencyNote'; id: string; data: any }> = []
  
  // Add 3 offer letters from top skills
  const featuredSkills = getFeaturedSkills(3)
  featuredSkills.forEach((skill, index) => {
    rawItems.push({
      type: 'offerLetter',
      id: `offer-${index}`,
      data: {
        skill: skill.name,
        salary: skill.salary,
        ref: `LC-${mockCandidate.id}-${skill.name.toUpperCase()}-0${index + 1}`
      }
    })
  })
  
  // Add 3 currency notes
  const notes = getCurrencyNotes(3)
  notes.forEach((note, index) => {
    rawItems.push({
      type: 'currencyNote',
      id: `note-${index}`,
      data: note
    })
  })
  
  // Interleave and assign perimeter positions
  return screenSlots.map((slot, index) => {
    const raw = rawItems[index % rawItems.length]
    return {
      type: raw.type,
      id: `${raw.id}-${index}`,
      data: raw.data,
      depth: slot.depth,
      anchorX: slot.anchorX,
      anchorY: slot.anchorY,
      baseRot: slot.baseRot
    }
  })
}