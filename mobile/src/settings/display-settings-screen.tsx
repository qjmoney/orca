import { View, Text, StyleSheet, Pressable, ScrollView, PixelRatio } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Check, ChevronLeft } from 'lucide-react-native'
import { colors, radii, spacing, typography } from '../theme/mobile-theme'
import {
  setDisplayScalePreference,
  useDisplayScalePreference,
  type DisplayScalePreference
} from '../layout/display-scale-preference'
import { useScaledWindowDimensions } from '../layout/use-scaled-window-dimensions'

const OPTIONS: { label: string; value: DisplayScalePreference; description: string }[] = [
  { label: 'Auto', value: 'auto', description: 'Upscale only far-view (low-density) displays' },
  { label: '1x', value: 1, description: 'Phone default — no upscaling' },
  { label: '1.5x', value: 1.5, description: 'Slightly larger UI' },
  { label: '2x', value: 2, description: 'Large UI for distant screens' },
  { label: '2.4x', value: 2.4, description: 'Maximum — car head-units and casts' }
]

export default function DisplaySettingsScreen({ onBack }: { onBack?: () => void }) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const preference = useDisplayScalePreference()
  const { width, height, scale } = useScaledWindowDimensions()
  const pixelRatio = PixelRatio.get()

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backButton}
          onPress={onBack ?? (() => router.back())}
        >
          <ChevronLeft size={22} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.heading}>Display</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.groupHeading}>UI SCALE</Text>
        <Text style={styles.groupDescription}>
          Scales the whole interface on this device. Pick a fixed value for mirroring apps (car
          head-units, casts) whose virtual display reports a normal phone density — Auto cannot
          detect those.
        </Text>
        <View style={[styles.section, styles.sectionTopGap]}>
          {OPTIONS.map((option, index) => {
            const selected = preference === option.value
            return (
              <Pressable
                key={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setDisplayScalePreference(option.value)}
                style={[styles.optionRow, index > 0 && styles.optionRowBorder]}
              >
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>{option.label}</Text>
                  <Text style={styles.rowSublabel}>{option.description}</Text>
                </View>
                {selected && <Check size={18} color={colors.textSecondary} />}
              </Pressable>
            )
          })}
        </View>

        <Text style={styles.groupHeading}>THIS DISPLAY</Text>
        <View style={[styles.section, styles.sectionTopGap]}>
          <View style={styles.optionRow}>
            <View style={styles.rowContent}>
              <Text style={styles.rowSublabel}>
                {Math.round(width * scale)} × {Math.round(height * scale)} dp physical ·{' '}
                {Math.round(width)} × {Math.round(height)} dp logical · pixel ratio {pixelRatio} ·
                effective scale {scale.toFixed(2)}x
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
    paddingHorizontal: spacing.lg
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.sm
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary
  },
  groupHeading: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs
  },
  groupDescription: {
    fontSize: typography.bodySize - 1,
    color: colors.textSecondary,
    lineHeight: 20,
    paddingHorizontal: spacing.xs
  },
  section: {
    backgroundColor: colors.bgPanel,
    borderRadius: radii.card,
    overflow: 'hidden'
  },
  sectionTopGap: {
    marginTop: spacing.sm
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2
  },
  optionRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle
  },
  rowContent: {
    flex: 1
  },
  rowLabel: {
    fontSize: typography.bodySize,
    fontWeight: '500',
    color: colors.textPrimary
  },
  rowSublabel: {
    fontSize: typography.bodySize - 2,
    color: colors.textSecondary,
    marginTop: 2
  }
})
