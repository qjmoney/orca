import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const mobileRoot = fileURLToPath(new URL('../..', import.meta.url))

// Why: raw useWindowDimensions returns the physical display size, which bypasses
// the far-view upscale (display-scale.ts) — every layout consumer must read the
// logical size through use-scaled-window-dimensions instead.
const ALLOWED_FILES = new Set([
  'src/layout/use-scaled-window-dimensions.ts',
  'src/layout/window-dimensions-boundary.test.ts'
])

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? sourceFiles(path) : [path]
  })
}

describe('window dimensions boundary', () => {
  it('keeps useWindowDimensions out of layout consumers', () => {
    const offenders = [
      ...sourceFiles(join(mobileRoot, 'app')),
      ...sourceFiles(join(mobileRoot, 'src'))
    ]
      .filter((path) => /\.[jt]sx?$/.test(path))
      // tests mock react-native's hook; they are not layout consumers
      .filter((path) => !/\.test\.[jt]sx?$/.test(path))
      .filter((path) => !ALLOWED_FILES.has(relative(mobileRoot, path)))
      .filter((path) => /\buseWindowDimensions\b/.test(readFileSync(path, 'utf8')))
      .map((path) => relative(mobileRoot, path))
    expect(offenders).toEqual([])
  })
})
