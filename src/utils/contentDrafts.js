const goalHooks = {
  Awareness: ({ topic }) => `A clearer way to think about ${topic}.`,
  Engagement: ({ topic }) => `Let's talk about ${topic}.`,
  Traffic: ({ topic }) => `Want to explore ${topic} further?`,
  Leads: ({ topic, audience }) => `Working on ${topic}? Here's a useful place to start.`,
  Sales: ({ topic }) => `Considering your options for ${topic}?`,
}

const toneOpeners = {
  Friendly: ({ topic, audience }) => `If ${topic} has been on your mind, you're in the right place. Here's a simple idea to get started.`,
  Professional: ({ topic, audience }) => `For ${audience}, a considered approach to ${topic} starts with a clear goal and a practical next step.`,
  Direct: ({ topic, audience }) => `Start with the outcome you want from ${topic}. Keep the next step specific, useful, and easy to act on.`,
  Bold: ({ topic, audience }) => `You don't need to overcomplicate ${topic}. Start with one clear idea, make it useful, and build from there.`,
  Educational: ({ topic, audience }) => `Break ${topic} into three parts: the goal, the action, and how you'll know it worked. That makes the next step easier to see.`,
}

function clean(value) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

function makeHashtags(topic, brandName) {
  const words = [topic, brandName]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2)
  const unique = [...new Set(words)].slice(0, 4)
  return unique.map((word) => `#${word}`).join(' ')
}

export function createPlatformDraft({
  topic,
  audience = 'your audience',
  goal = 'Engagement',
  tone = 'Friendly',
  cta = '',
  platform = 'Instagram',
  brandName = '',
}) {
  const subject = clean(topic)
  if (!subject) throw new Error('Add an idea or topic first.')

  const target = clean(audience) || 'your audience'
  const input = { topic: subject, audience: target }
  const hook = (goalHooks[goal] || goalHooks.Engagement)(input)
  const opener = (toneOpeners[tone] || toneOpeners.Friendly)(input)
  const action = clean(cta) || (
    goal === 'Awareness' ? 'Save this idea for later.' :
      goal === 'Traffic' ? 'Explore the next step when you're ready.' :
        goal === 'Leads' ? 'Send a message if you'd like to discuss your needs.' :
          goal === 'Sales' ? 'Take a look at your options and choose what fits.' :
            'What would you add? Share your thoughts.'
  )
  const brandPrefix = clean(brandName) ? `${clean(brandName)} · ` : ''
  let title = ''
  let caption = ''

  if (platform === 'LinkedIn') {
    title = `${subject}: a practical starting point`
    caption = `${hook}\n\n${opener}\n\nA simple way to move forward:\n1. Decide what a useful outcome looks like.\n2. Choose one action you can take this week.\n3. Review what you learn and adjust.\n\n${action}${brandPrefix ? `\n\n— ${brandPrefix.trim().replace(/·$/, '')}` : ''}`
  } else if (platform === 'X') {
    title = `A thought on ${subject}`
    caption = `${hook} ${opener} ${action}`
  } else if (platform === 'YouTube') {
    title = `A practical look at ${subject}`
    caption = `In this video, we explore ${subject} for ${target}.\n\nIn this video:\n• The goal to keep in mind\n• A practical first step\n• What to consider next\n\n${action}\n\nAdd your own examples and specific details before publishing.`
  } else if (platform === 'TikTok') {
    title = `Quick idea: ${subject}`
    caption = `HOOK: ${hook}\n\n${opener}\n\nKeep the video focused on one example of ${subject}. Show the idea, explain why it matters to ${target}, then finish with one clear next step.\n\n${action}`
  } else if (platform === 'Facebook') {
    title = `Let's talk about ${subject}`
    caption = `${hook}\n\n${opener}\n\nWhat has your experience with ${subject} been? We'd love to hear your perspective.\n\n${action}`
  } else if (platform === 'Pinterest') {
    title = `${subject}: ideas to save for later`
    caption = `Looking for inspiration around ${subject}? Start with one clear goal, collect ideas that fit your style, and make a short list of what to try first.\n\n${action}`
  } else {
    title = `${subject} — a simple idea`
    caption = `${hook}\n\n${opener}\n\nTry this: pick one small part of ${subject} and share a clear, useful example for ${target}. Keep the message focused and make the next step easy to understand.\n\n${action}`
    const hashtags = makeHashtags(subject, brandName)
    if (hashtags) caption += `\n\n${hashtags}`
  }

  return {
    title,
    caption,
    platform,
    source: 'Built-in draft helper',
    disclosure: 'Starter copy created from local templates. Review it, add real examples, and verify claims before publishing.',
  }
}
