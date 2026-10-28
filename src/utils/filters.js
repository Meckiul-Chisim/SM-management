// Searching, filtering and sorting posts and follow-ups.
//
// brandId "none" means "General workspace" (records with no brand).

export const ALL = 'all'
export const NO_BRAND = 'none'

const matchesBrand = (record, brandId) =>
  brandId === ALL || (brandId === NO_BRAND ? !record.brandId : record.brandId === brandId)

// Search looks at the title, text, platform and brand name, ignoring case.
export function filterPosts(posts, { search = '', brandId = ALL, platform = ALL, status = ALL } = {}, brands = []) {
  const query = search.trim().toLowerCase()
  const brandNames = new Map(brands.map((brand) => [brand.id, brand.name.toLowerCase()]))

  return posts.filter((post) => {
    if (!matchesBrand(post, brandId)) return false
    if (platform !== ALL && post.platform !== platform) return false
    if (status !== ALL && post.status !== status) return false
    if (!query) return true
    const haystack = [post.title, post.caption, post.platform, brandNames.get(post.brandId) || '']
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })
}

export function filterInteractions(items, { search = '', brandId = ALL, platform = ALL, status = ALL } = {}) {
  const query = search.trim().toLowerCase()
  return items.filter((item) => {
    if (!matchesBrand(item, brandId)) return false
    if (platform !== ALL && item.platform !== platform) return false
    if (status !== ALL && item.status !== status) return false
    if (!query) return true
    return [item.person, item.message, item.notes].join(' ').toLowerCase().includes(query)
  })
}

// Posts with a planned date come first (soonest first), then the rest, newest edit first.
export function sortPosts(posts) {
  return [...posts].sort((a, b) => {
    if (a.scheduledAt && b.scheduledAt) return a.scheduledAt.localeCompare(b.scheduledAt)
    if (a.scheduledAt) return -1
    if (b.scheduledAt) return 1
    return (b.updatedAt || '').localeCompare(a.updatedAt || '')
  })
}
