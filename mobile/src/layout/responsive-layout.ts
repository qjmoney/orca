import {
  getResponsiveLayoutMetrics,
  type ResponsiveLayoutMetrics
} from './responsive-layout-metrics'
import { useScaledWindowDimensions } from './use-scaled-window-dimensions'

export type ResponsiveLayout = ResponsiveLayoutMetrics

export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useScaledWindowDimensions()
  return getResponsiveLayoutMetrics(width, height)
}
