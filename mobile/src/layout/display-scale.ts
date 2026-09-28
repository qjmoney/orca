// Secondary displays (car head-units, TVs, cast sessions such as Tesor) report
// mdpi/hdpi densities on a large canvas, so dp-sized UI lands physically tiny.
// Anything below this pixel ratio is treated as a far-view display and upscaled.
export const FAR_VIEW_MAX_PIXEL_RATIO = 1.6
// Effective px-per-dp the layout is upscaled to on a far-view display — roughly
// a mid-range phone held at arm's length, readable on a dashboard screen.
export const FAR_VIEW_TARGET_PIXEL_RATIO = 2.4

export function resolveDisplayScale(pixelRatio: number): number {
  if (pixelRatio <= 0) {
    return 1
  }
  return pixelRatio < FAR_VIEW_MAX_PIXEL_RATIO ? FAR_VIEW_TARGET_PIXEL_RATIO / pixelRatio : 1
}

// A numeric preference pins the factor — some virtual displays inherit the
// phone density (Samsung base_density_for_external_displays), so auto-detection
// cannot tell them apart from a real phone.
export function resolveEffectiveScale(pixelRatio: number, preference: 'auto' | number): number {
  return preference === 'auto' ? resolveDisplayScale(pixelRatio) : preference
}
