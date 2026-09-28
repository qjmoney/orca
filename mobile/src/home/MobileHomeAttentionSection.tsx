import { ChevronRight } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { AgentSpinner } from '../components/AgentSpinner'
import { colors, spacing } from '../theme/mobile-theme'
import type { HomeAttentionItem } from '../worktree/home-attention-items'

export function MobileHomeAttentionSection(props: {
  items: HomeAttentionItem[]
  onOpen: (item: HomeAttentionItem) => void
}) {
  if (props.items.length === 0) {
    return null
  }
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Needs attention</Text>
      <View style={styles.card}>
        {props.items.map((item, index) => (
          <Pressable
            key={`${item.hostId}:${item.worktree.worktreeId}`}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.worktree.displayName || item.worktree.repo} on ${item.hostName}, waiting on input`}
            style={({ pressed }) => [
              styles.row,
              index > 0 && styles.rowBorder,
              pressed && styles.rowPressed
            ]}
            onPress={() => props.onOpen(item)}
          >
            <AgentSpinner status="permission" />
            <View style={styles.main}>
              <Text style={styles.name} numberOfLines={1}>
                {item.worktree.displayName || item.worktree.repo}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {item.hostName}
                {item.worktree.repo ? ` · ${item.worktree.repo}` : ''}
              </Text>
            </View>
            <ChevronRight size={16} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.lg },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs
  },
  card: {
    backgroundColor: 'rgba(26,26,26,0.6)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.borderSubtle },
  rowPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  main: { flex: 1, minWidth: 0 },
  name: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 1 }
})
