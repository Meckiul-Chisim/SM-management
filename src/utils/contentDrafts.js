// Starter copy built from local templates.
//
// This is NOT AI: nothing is sent anywhere and nothing is "understood". Fixed
// sentence patterns are filled with the topic, audience, goal and tone the person
// typed. `variant` picks a different pattern (0, 1, 2...) so pressing "Try another
// version" gives genuinely different wording. The result is a starting point to edit.

export const GOALS = ['Awareness', 'Engagement', 'Traffic', 'Leads', 'Sales']
export const TONES = ['Friendly', 'Professional', 'Direct', 'Bold', 'Educational']
export const VARIANT_COUNT = 3

const X_LIMIT = 280

const clean = (value) => String(value || '').trim().replace(/\s+/g, ' ')
const pick = (options, variant) => options[variant % options.length]

// Each goal has several ways to open. `t` is the topic; later mentions say "it"
// or "this" so the topic is not repeated in every sentence.
const hooks = {
  Awareness: (t) => [
    `A clearer way to think about ${t}.`,
    `Most people overlook this part of ${t}.`,
    `If ${t} is new to you, start here.`,
  ],
  Engagement: (t) => [
    `Let's talk about ${t}.`,
    `Quick question about ${t}:`,
    `What is your take on ${t}?`,
  ],
  Traffic: (t) => [
    `Want to go deeper on ${t}?`,
    `We put together a closer look at ${t}.`,
    `There is more to ${t} than one post can cover.`,
  ],
  Leads: (t) => [
    `Working on ${t}? Here is a useful place to start.`,
    `Thinking about ${t} but not sure where to begin?`,
    `If ${t} is on your list this month, this is for you.`,
  ],
  Sales: (t) => [
    `Weighing up your options for ${t}?`,
    `Ready to make progress on ${t}?`,
    `Choosing the right approach to ${t} matters.`,
  ],
}

const bodies = {
  Friendly: (a) => [
    `It does not have to be complicated. Pick one small step and share it with ${a}.`,
    `Start simple, keep it honest, and build from there.`,
    `A small, useful idea usually beats a big, vague one.`,
  ],
  Professional: (a) => [
    `For ${a}, a considered approach starts with a clear goal and one practical next step.`,
    `Define the outcome first, then choose the action that supports it.`,
    `A measured plan, reviewed regularly, tends to outlast a rushed one.`,
  ],
  Direct: () => [
    `Decide the outcome you want. Make the next step specific. Then do it.`,
    `Keep it short, useful and easy to act on.`,
    `One goal. One action. Review what happened.`,
  ],
  Bold: () => [
    `You do not need to overcomplicate this. One clear idea, made useful, is enough.`,
    `Stop waiting for the perfect moment. Start with what you have.`,
    `Pick a direction and commit to it for a week.`,
  ],
  Educational: () => [
    `Break it into three parts: the goal, the action, and how you will know it worked.`,
    `Step one: define success. Step two: take one action. Step three: review.`,
    `Start with what you want to learn, then choose a small way to test it.`,
  ],
}

const defaultCtas = {
  Awareness: ['Save this for later.', 'Share it with someone who needs it.', 'Follow along for more.'],
  Engagement: ['What would you add? Tell us below.', 'Share your experience in the comments.', 'Agree or disagree? We would like to hear it.'],
  Traffic: ['Read more when you are ready.', 'Take a closer look at the next step.', 'Follow the link to continue.'],
  Leads: ['Send a message to talk it through.', 'Get in touch to discuss what you need.', 'Reply to start a conversation.'],
  Sales: ['Look at the options and choose what fits.', 'See what is available and pick your next step.', 'Ready when you are.'],
}

// Hashtags come only from words the person typed (topic and brand name).
function hashtagsFrom(topic, brandName) {
  const words = `${topic} ${brandName}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3)
  return [...new Set(words)].slice(0, 3).map((word) => `#${word}`).join(' ')
}

function shorten(text, limit) {
  if (text.length <= limit) return text
  const cut = text.slice(0, limit - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length).trimEnd()}…`
}

export function createPlatformDraft({
  topic,
  audience = '',
  goal = 'Engagement',
  tone = 'Friendly',
  cta = '',
  platform = 'Instagram',
  brandName = '',
  variant = 0,
}) {
  const subject = clean(topic)
  if (!subject) throw new Error('Add an idea or topic first.')

  const who = clean(audience) || 'your audience'
  const hook = pick((hooks[goal] || hooks.Engagement)(subject), variant)
  const body = pick((bodies[tone] || bodies.Friendly)(who), variant)
  const action = clean(cta) || pick(defaultCtas[goal] || defaultCtas.Engagement, variant)
  const brand = clean(brandName)
  const tags = hashtagsFrom(subject, brand)

  let title
  let caption

  switch (platform) {
    case 'LinkedIn':
      title = pick([`${subject}: a practical starting point`, `Notes on ${subject}`, `${subject}, in three steps`], variant)
      caption = `${hook}\n\n${body}\n\nA simple way to move forward:\n1. Decide what a useful outcome looks like.\n2. Choose one action you can take this week.\n3. Review what you learn and adjust.\n\n${action}`
      break
    case 'X':
      title = `A thought on ${subject}`
      caption = shorten(`${hook} ${body} ${action}`, X_LIMIT)
      break
    case 'YouTube':
      title = pick([`A practical look at ${subject}`, `${subject}: where to start`, `${subject} explained simply`], variant)
      caption = `${hook}\n\nIn this video for ${who}:\n• The goal to keep in mind\n• A practical first step\n• What to look at next\n\n${action}\n\n(Add your own examples and timestamps before publishing.)`
      break
    case 'TikTok':
      title = pick([`Quick idea: ${subject}`, `${subject} in 30 seconds`, `Try this with ${subject}`], variant)
      caption = `HOOK: ${hook}\n\n${body}\n\nShow one real example, say why it matters to ${who}, and end on a single next step.\n\n${action}${tags ? `\n\n${tags}` : ''}`
      break
    case 'Facebook':
      title = pick([`Let's talk about ${subject}`, `A question about ${subject}`, `${subject}: share your view`], variant)
      caption = `${hook}\n\n${body}\n\n${action}`
      break
    case 'Pinterest':
      title = pick([`${subject}: ideas to save`, `${subject} inspiration`, `Plan ${subject}`], variant)
      caption = `${hook} Start with one clear goal, collect ideas that fit your style, and shortlist what to try first.\n\n${action}`
      break
    default:
      title = pick([`${subject}: a simple idea`, `Try this with ${subject}`, `${subject}, simplified`], variant)
      caption = `${hook}\n\n${body}\n\nShare one clear, useful example and make the next step easy to follow.\n\n${action}${tags ? `\n\n${tags}` : ''}`
  }

  return {
    title,
    caption: brand && platform !== 'X' ? `${caption}\n\n— ${brand}` : caption,
    platform,
    variant,
    source: 'Built-in template',
    disclosure: 'Starter text from local templates, not AI. Review it, add real details, and check any claims before publishing.',
  }
}
