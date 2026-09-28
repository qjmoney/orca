import { describe, expect, it } from 'vitest'
import {
  FAR_VIEW_MAX_PIXEL_RATIO,
  FAR_VIEW_TARGET_PIXEL_RATIO,
  resolveDisplayScale
} from './display-scale'

describe('resolveDisplayScale', () => {
  it('leaves phone/tablet densities untouched', () => {
    expect(resolveDisplayScale(3.75)).toBe(1)
    expect(resolveDisplayScale(2)).toBe(1)
    expect(resolveDisplayScale(FAR_VIEW_MAX_PIXEL_RATIO)).toBe(1)
  })

  it('upscales far-view displays to the target ratio', () => {
    // Tesla-style 1920x1200 @160dpi cast: 1.0 -> 2.4x
    expect(resolveDisplayScale(1)).toBeCloseTo(2.4)
    expect(resolveDisplayScale(1.33)).toBeCloseTo(2.4 / 1.33)
    expect(resolveDisplayScale(1)).toBeCloseTo(FAR_VIEW_TARGET_PIXEL_RATIO)
  })

  it('treats a broken/zero ratio as no scale', () => {
    expect(resolveDisplayScale(0)).toBe(1)
  })
})
