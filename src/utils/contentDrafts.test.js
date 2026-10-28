import { describe, expect, it } from 'vitest'
import { createPlatformDraft } from './contentDrafts.js'
import { PLATFORMS } from '../data/constants.js'

describe('template draft helper', () => {
  it('requires a topic', () => {
    expect(() => createPlatformDraft({ topic: '   ' })).toThrow()
  })

  it('writes something for every platform and keeps X within 280 characters', () => {
    for (const platform of PLATFORMS) {
      const draft = createPlatformDraft({ topic: 'a '.repeat(60) + 'weekly content planning', platform, brandName: 'Acme' })
      expect(draft.title.length).toBeGreaterThan(0)
      expect(draft.caption.length).toBeGreaterThan(0)
      if (platform === 'X') expect(draft.caption.length).toBeLessThanOrEqual(280)
    }
  })

  it('gives different wording for each variant', () => {
    const texts = [0, 1, 2].map((variant) => createPlatformDraft({ topic: 'content planning', variant }).caption)
    expect(new Set(texts).size).toBe(3)
  })

  it('never describes itself as AI-generated', () => {
    const draft = createPlatformDraft({ topic: 'content planning' })
    expect(draft.disclosure).toMatch(/not AI/i)
    expect(draft.source).not.toMatch(/\bAI\b/)
  })
})
