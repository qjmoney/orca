import { useEffect } from 'react'
import { PixelRatio, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { resolveEffectiveScale } from './display-scale'
import { useDisplayScalePreference } from './display-scale-preference'

// Emits a [display] logcat line whenever window metrics, insets, or the scale
// preference change. Exists to diagnose secondary-display bugs (car casts, DeX)
// where the wrong metrics silently produce a shrunken or clipped layout — the
// dumps alone never showed what the app actually saw.
export function useDisplayDiagnostics(): void {
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const preference = useDisplayScalePreference()
  const pixelRatio = PixelRatio.get()
  const fontScale = PixelRatio.getFontScale()
  const scale = resolveEffectiveScale(pixelRatio, preference)

  useEffect(() => {
    console.log('[display] metrics', {
      width,
      height,
      pixelRatio,
      fontScale,
      preference,
      effectiveScale: scale,
      logicalWidth: width / scale,
      logicalHeight: height / scale,
      insetTop: insets.top,
      insetBottom: insets.bottom,
      insetLeft: insets.left,
      insetRight: insets.right
    })
  }, [
    width,
    height,
    pixelRatio,
    fontScale,
    preference,
    scale,
    insets.top,
    insets.bottom,
    insets.left,
    insets.right
  ])
}
