// Generate floating dossier items (offer letters and currency notes) based on candidate profile

import { mockCandidate, mockMarketData } from './mockData'
import { offerLetterTemplate, currencyNoteAssets } from './floatingAssets'

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
export function getFeaturedSkills(maxItems: number = 2): Array<{name: string; score: number; salary: string}> {
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
export function getCurrencyNotes(count: number = 2): Array<{value: number; denom: string; color: string}> {
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

// Fixed quadrant slots to ensure balanced distribution across the canvas
const quadrantSlots = [
  { anchorX: '26%', anchorY: '28%', baseRot: -5 },
  { anchorX: '78%', anchorY: '24%', baseRot: 6 },
  { anchorX: '32%', anchorY: '76%', baseRot: 7 },
  { anchorX: '74%', anchorY: '72%', baseRot: -6 }
]

// Generate the list of floating items to render
export function generateFloatingItems(): FloatingItemDef[] {
  const rawItems: Array<Omit<FloatingItemDef, 'anchorX' | 'anchorY' | 'baseRot'>> = []
  
  // Add 2 offer letters from top skills
  const featuredSkills = getFeaturedSkills(2)
  featuredSkills.forEach((skill, index) => {
    rawItems.push({
      type: 'offerLetter',
      id: `offer-${index}`,
      data: {
        skill: skill.name,
        salary: skill.salary,
        // Generate a reference code
        ref: `LC-${mockCandidate.id}-${skill.name.toUpperCase()}-0${index + 1}`
      },
      // Depth layer: alternate between foreground and mid
      depth: index % 2 === 0 ? 'foreground' : 'mid'
    })
  })
  
  // Add 2 currency notes
  const notes = getCurrencyNotes(2)
  notes.forEach((note, index) => {
    rawItems.push({
      type: 'currencyNote',
      id: `note-${index}`,
      data: note,
      // Depth layer: alternate
      depth: index % 2 === 0 ? 'mid' : 'background'
    })
  })
  
  // Shuffle for varied ordering
  for (let i = rawItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[rawItems[i], rawItems[j]] = [rawItems[j], rawItems[i]]
  }
  
  // Assign quadrant slots
  return rawItems.map((item, index) => ({
    ...item,
    anchorX: quadrantSlots[index % quadrantSlots.length].anchorX,
    anchorY: quadrantSlots[index % quadrantSlots.length].anchorY,
    baseRot: quadrantSlots[index % quadrantSlots.length].baseRot
  }))
}