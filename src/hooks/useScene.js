import { useState, useMemo } from 'react'
import { getSceneById } from '../data/scenes.js'

/**
 * Optional: aktueller Teil, Szene und Wechsel.
 * @param {number} initialPart - Start-Teil (z. B. 1)
 * @returns {{ scene, currentPart, setCurrentPart }}
 */
export function useScene(initialPart = 1) {
  const [currentPart, setCurrentPart] = useState(initialPart)
  const scene = useMemo(() => getSceneById(currentPart), [currentPart])
  return { scene, currentPart, setCurrentPart }
}
