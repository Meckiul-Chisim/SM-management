import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { routes } from './router.jsx'
import { ToastProvider } from '../context/ToastProvider.jsx'
import { WorkspaceProvider } from '../context/WorkspaceProvider.jsx'
import { STORAGE_KEY } from '../data/constants.js'
import { buildBackup } from '../data/backup.js'
import { createSampleWorkspace } from '../data/sampleData.js'

beforeAll(() => {
  // jsdom has no canvas or matchMedia; the animated background and theme code need both.
  HTMLCanvasElement.prototype.getContext = () => null
  window.matchMedia = window.matchMedia || ((query) => ({
    matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  }))
  window.scrollTo = vi.fn()
})

function renderApp(path = '/dashboard') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <WorkspaceProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </WorkspaceProvider>,
  )
  return router
}

const saved = () => JSON.parse(window.localStorage.getItem(STORAGE_KEY))

describe('navigation', () => {
  it('opens each page from the sidebar and sets the tab title', async () => {
    const user = userEvent.setup()
    renderApp()
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    for (const [name, heading] of [
      ['Brands & accounts', 'Brands & accounts'],
      ['Content studio', 'Content studio'],
      ['Content calendar', 'Content calendar'],
      ['Engagement', 'Engagement'],
      ['Settings', 'Settings'],
      ['Dashboard', 'Dashboard'],
    ]) {
      await user.click(within(nav).getByRole('link', { name }))
      expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
      expect(document.title).toContain(heading)
    }
  })

  it('shows a not-found page for unknown addresses and keeps old addresses working', async () => {
    const router = renderApp('/nope')
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    await router.navigate('/inquiries')
    expect(await screen.findByRole('heading', { level: 1, name: 'Engagement' })).toBeInTheDocument()
  })
})

describe('theme', () => {
  it('switches theme, updates the page and remembers the choice', async () => {
    const user = userEvent.setup()
    document.documentElement.dataset.theme = 'light'
    renderApp()
    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('haven-theme')).toBe('dark')
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }))
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})

describe('brands', () => {
  it('creates a brand, rejects a duplicate, and saves it', async () => {
    const user = userEvent.setup()
    renderApp('/brands')
    await user.click(screen.getByRole('button', { name: /add brand/i }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Create brand' }))
    expect(within(dialog).getByText('Enter a brand or client name.')).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText(/brand or client name/i), 'northstar studio')
    await user.click(within(dialog).getByRole('button', { name: 'Create brand' }))
    expect(within(dialog).getByText(/already exists/)).toBeInTheDocument()

    await user.clear(within(dialog).getByLabelText(/brand or client name/i))
    await user.type(within(dialog).getByLabelText(/brand or client name/i), 'Fresh Co')
    await user.click(within(dialog).getByRole('button', { name: 'Create brand' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Fresh Co' })).toBeInTheDocument()
    expect(saved().brands.some((brand) => brand.name === 'Fresh Co')).toBe(true)
  })

  it('warns about linked records and keeps them by default when deleting', async () => {
    const user = userEvent.setup()
    renderApp('/brands')
    await user.click(screen.getByRole('button', { name: 'Delete Northstar Studio' }))
    const dialog = screen.getByRole('alertdialog')
    expect(within(dialog).getByText(/This brand has/)).toHaveTextContent('2 posts and 1 follow-up')
    expect(within(dialog).getByText(/moved to General workspace/)).toBeInTheDocument()
    // Safe choice is focused first.
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus()
    await user.click(within(dialog).getByRole('button', { name: 'Delete brand' }))
    expect(screen.queryByRole('heading', { name: 'Northstar Studio' })).not.toBeInTheDocument()
    expect(saved().posts.find((post) => post.id === 'post-welcome').brandId).toBe('')
  })

  it('can delete a brand together with its records', async () => {
    const user = userEvent.setup()
    renderApp('/brands')
    await user.click(screen.getByRole('button', { name: 'Delete Northstar Studio' }))
    const dialog = screen.getByRole('alertdialog')
    await user.click(within(dialog).getByRole('checkbox'))
    await user.click(within(dialog).getByRole('button', { name: 'Delete brand and records' }))
    expect(saved().posts.some((post) => post.brandId === 'brand-northstar')).toBe(false)
    expect(saved().posts.some((post) => post.id === 'post-welcome')).toBe(false)
  })
})

describe('modal accessibility', () => {
  it('closes with Escape and returns focus to the button that opened it', async () => {
    const user = userEvent.setup()
    renderApp('/brands')
    const opener = screen.getByRole('button', { name: /add brand/i })
    await user.click(opener)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText(/brand or client name/i)).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })

  it('keeps Tab inside the dialog', async () => {
    const user = userEvent.setup()
    renderApp('/brands')
    await user.click(screen.getByRole('button', { name: /add brand/i }))
    const dialog = screen.getByRole('dialog')
    for (let index = 0; index < 30; index += 1) {
      await user.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })
})

describe('posts', () => {
  it('creates a post with validation, then finds it with search and filters', async () => {
    const user = userEvent.setup()
    renderApp('/content')
    await user.click(screen.getAllByRole('button', { name: /new post/i })[0])
    const dialog = screen.getByRole('dialog')

    await user.click(within(dialog).getByRole('button', { name: 'Save post' }))
    expect(within(dialog).getByText('Add a title or some post text.')).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText('Internal title'), 'Zebra launch')
    await user.selectOptions(within(dialog).getByLabelText('Status'), 'Planned')
    await user.click(within(dialog).getByRole('button', { name: 'Save post' }))
    expect(within(dialog).getByText('Choose a date and time for a planned post.')).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText(/planned date and time/i), '2026-12-31T09:30')
    await user.click(within(dialog).getByRole('button', { name: 'Save post' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(saved().posts[0]).toMatchObject({ title: 'Zebra launch', status: 'Planned', scheduledAt: '2026-12-31T09:30' })

    await user.type(screen.getByRole('searchbox'), 'zebra')
    expect(screen.getAllByRole('article')).toHaveLength(1)
    await user.clear(screen.getByRole('searchbox'))
    await user.selectOptions(screen.getByLabelText('Status', { selector: 'select' }), 'Published')
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByText('Autumn collection preview')).toBeInTheDocument()
  })

  it('changes a status in place and edits a post', async () => {
    const user = userEvent.setup()
    renderApp('/content')
    await user.selectOptions(screen.getByLabelText('Status of Weekend edit'), 'Published')
    expect(saved().posts.find((post) => post.id === 'post-weekend').status).toBe('Published')
  })
})

describe('follow-ups', () => {
  it('shows overdue items first, and marks done and reopens', async () => {
    const user = userEvent.setup()
    renderApp('/engagement')
    const articles = screen.getAllByRole('article')
    expect(within(articles[0]).getByText('Jordan Lee')).toBeInTheDocument()
    expect(within(articles[0]).getByText(/Overdue by 1 day/)).toBeInTheDocument()

    await user.click(within(articles[0]).getByRole('button', { name: /mark done/i }))
    expect(saved().interactions.find((item) => item.id === 'interaction-overdue').status).toBe('Done')
    await user.click(screen.getByRole('button', { pressed: false, name: /^Done/ }))
    await user.click(screen.getAllByRole('button', { name: /reopen/i })[0])
    expect(saved().interactions.filter((item) => item.status === 'Done')).toHaveLength(1)
  })
})

describe('calendar', () => {
  it('moves between months and across the year boundary', async () => {
    const user = userEvent.setup()
    renderApp('/calendar')
    const title = () => screen.getByRole('heading', { level: 2, name: /\d{4}/ }).textContent
    const start = title()
    await user.click(screen.getByRole('button', { name: 'Next month' }))
    expect(title()).not.toBe(start)
    await user.click(screen.getByRole('button', { name: 'Today' }))
    expect(title()).toBe(start)
  })
})

describe('settings: import and persistence', () => {
  async function chooseFile(user, text) {
    const input = screen.getByLabelText('Choose a backup file')
    await user.upload(input, new File([text], 'backup.json', { type: 'application/json' }))
  }

  it('rejects an invalid backup and leaves the workspace unchanged', async () => {
    const user = userEvent.setup()
    renderApp('/settings')
    await chooseFile(user, JSON.stringify({ brands: [], posts: [], interactions: [] }))
    await screen.findByText(/was not imported/)
    expect(saved().brands).toHaveLength(2)
  })

  it('previews a valid backup and replaces the workspace only after confirming', async () => {
    const user = userEvent.setup()
    renderApp('/settings')
    const backup = buildBackup({ ...createSampleWorkspace(), workspaceName: 'Imported', brands: [], posts: [], interactions: [] })
    await chooseFile(user, JSON.stringify(backup))
    expect(await screen.findByText(/Ready to import/)).toBeInTheDocument()
    expect(saved().workspaceName).toBe('Haven') // nothing replaced yet
    await user.click(screen.getByRole('button', { name: 'Replace my workspace' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Replace workspace' }))
    expect(saved().workspaceName).toBe('Imported')
    expect(saved().posts).toHaveLength(0)
  })

  it('removes only sample data and then deletes everything on request', async () => {
    const user = userEvent.setup()
    renderApp('/settings')
    await user.click(screen.getByRole('button', { name: 'Remove sample data' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove sample data' }))
    expect(saved().brands).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Remove sample data' })).toBeDisabled()
  })

  it('renames the workspace and shows it in the sidebar', async () => {
    const user = userEvent.setup()
    renderApp('/settings')
    const field = screen.getByLabelText('Workspace name')
    await user.clear(field)
    await user.click(screen.getByRole('button', { name: 'Save name' }))
    expect(screen.getByText('Workspace name cannot be empty.')).toBeInTheDocument()
    await user.type(field, 'Studio One')
    await user.click(screen.getByRole('button', { name: 'Save name' }))
    expect(saved().workspaceName).toBe('Studio One')
  })
})
