import type { HomeWorktreeSummary, HostWorktreeInfo } from './home-worktree-info'

export type HomeAttentionItem = {
  hostId: string
  hostName: string
  worktree: HomeWorktreeSummary
}

/** Flattens every host's waiting-on-input worktrees into one Home list, in host order. */
export function collectHomeAttentionItems(
  hosts: readonly { id: string; name: string }[],
  worktreeInfo: Record<string, HostWorktreeInfo>
): HomeAttentionItem[] {
  const items: HomeAttentionItem[] = []
  for (const host of hosts) {
    for (const worktree of worktreeInfo[host.id]?.attentionWorktrees ?? []) {
      items.push({ hostId: host.id, hostName: host.name, worktree })
    }
  }
  return items
}
