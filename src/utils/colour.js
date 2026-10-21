// Small colour helpers used where a brand's own colour is shown.

// Returns white or near-black, whichever stays readable on the given hex colour.
export function readableTextColour(hex) {
  const value = String(hex || '').replace('#', '')
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return '#ffffff'

  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(full.slice(i, i + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.45 ? '#17231e' : '#ffffff'
}

// Used when a post or brand has no colour of its own.
export const DEFAULT_BRAND_COLOUR = '#2e6b4f'
