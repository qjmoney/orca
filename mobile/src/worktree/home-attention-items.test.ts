import { describe, expect, it } from 'vitest'
import { collectHomeAttentionItems } from './home-attention-items'
import type { HomeWorktreeSummary, HostWorktreeInfo } from './home-worktree-info'

function worktree(id: string, overrides: Partial<HomeWorktreeSummary> = {}): HomeWorktreeSummary {
  return {
    worktreeId: id,
    repo: 'repo',
    branch: 'main',
    displayName: id,
    liveTerminalCount: 1,
    ...overrides
  }
}

function info(overrides: Partial<HostWorktreeInfo> = {}): HostWorktreeInfo {
  return {
    hostId: 'h1',
    totalWorktrees: 0,
    activeCount: 0,
    lastActiveWorktree: null,
    ...overrides
  }
}

describe('collectHomeAttentionItems', () => {
  it('flattens attention worktrees across hosts in host order', () => {
    const items = collectHomeAttentionItems(
      [
        { id: 'h1', name: 'Desktop' },
        { id: 'h2', name: 'Server' }
      ],
      {
        h1: info({ attentionWorktrees: [worktree('w1'), worktree('w2')] }),
        h2: info({ hostId: 'h2', attentionWorktrees: [worktree('w3')] })
      }
    )
    expect(items.map((i) => i.worktree.worktreeId)).toEqual(['w1', 'w2', 'w3'])
    expect(items[2].hostName).toBe('Server')
  })

  it('skips hosts with no info or empty attention lists', () => {
    const items = collectHomeAttentionItems(
      [
        { id: 'h1', name: 'Desktop' },
        { id: 'h2', name: 'Server' }
      ],
      { h1: info({ attentionWorktrees: [] }) }
    )
    expect(items).toEqual([])
  })
})
