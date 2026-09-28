import { PixelRatio, useWindowDimensions } from 'react-native'
import { resolveEffectiveScale } from './display-scale'
import { useDisplayScalePreference } from './display-scale-preference'

export type ScaledWindowDimensions = {
  /** Logical width the UI lays out in; equals window width when scale is 1. */
  width: number
  height: number
  /** Root transform factor applied to the logical layout. */
  scale: number
}

// Layout code must read the logical (post-scale) size — raw window dims describe
// the physical display and would defeat the upscale on far-view displays.
export function useScaledWindowDimensions(): ScaledWindowDimensions {
  const { width, height } = useWindowDimensions()
  const preference = useDisplayScalePreference()
  const scale = resolveEffectiveScale(PixelRatio.get(), preference)
  return { width: width / scale, height: height / scale, scale }
}
