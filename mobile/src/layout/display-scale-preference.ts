import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSyncExternalStore } from 'react'

// 'auto' scales only far-view displays; a number pins the root upscale factor
// for mirroring/casting apps whose virtual display reports a normal density.
export type DisplayScalePreference = 'auto' | number

const STORAGE_KEY = 'orca:displayScale'

let current: DisplayScalePreference = 'auto'
let loadStarted = false
const listeners = new Set<() => void>()

function notify(): void {
  listeners.forEach((listener) => listener())
}

function parseStored(raw: string | null): DisplayScalePreference {
  if (raw === null || raw === 'auto') {
    return 'auto'
  }
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed >= 1 && parsed <= 4 ? parsed : 'auto'
}

export function getDisplayScalePreference(): DisplayScalePreference {
  return current
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  if (!loadStarted) {
    loadStarted = true
    void AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      current = parseStored(raw)
      notify()
    })
  }
  return () => {
    listeners.delete(listener)
  }
}

export function setDisplayScalePreference(next: DisplayScalePreference): void {
  current = next
  notify()
  void AsyncStorage.setItem(STORAGE_KEY, String(next))
}

export function useDisplayScalePreference(): DisplayScalePreference {
  return useSyncExternalStore(subscribe, getDisplayScalePreference)
}
