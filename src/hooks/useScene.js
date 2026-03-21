import { useState, useMemo, useEffect } from 'react'
import { getSceneById } from '../data/scenes.js'

/**
 * Optional: aktueller Teil, Szene und Wechsel.
 * @param {number} initialPart - Start-Teil (z. B. 1)
 * @returns {{ scene, currentPart, setCurrentPart }}
 */
export function useScene(initialPart = 1) {
  const [currentPart, setCurrentPart] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('currentPart')
      if (stored !== null) return Number(stored)
    }
    return initialPart
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('currentPart', currentPart)
    }
  }, [currentPart])

  const scene = useMemo(() => getSceneById(currentPart), [currentPart])
  return { scene, currentPart, setCurrentPart }
}
