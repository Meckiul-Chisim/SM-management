// Drawing code for the ambient background (see components/ui/AmbientBackground.jsx).
//
// The scene is "3D" in the simple sense: points live in 3D space, are rotated,
// then projected onto the 2D canvas with perspective. No 3D library is needed,
// which keeps the app small and fast.
//
//   Light theme: a slowly turning network globe, orbit rings with small
//                satellites, and a few drifting particles.
//   Dark theme:  the same, plus stars, a crescent moon and an occasional
//                shooting star.
//
// Two functions are exported:
//   createScene()  builds the fixed data once (positions, connections).
//   drawScene()    draws one frame. It is called about 30 times a second.

const TAU = Math.PI * 2
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const CAMERA_DISTANCE = 3.2 // how far the "camera" is from the globe, in globe radii

const NODE_COUNT = 96
const NEIGHBOURS_PER_NODE = 3
const PARTICLE_COUNT = 44
const STAR_COUNT = 90
const SHOOTING_STAR_EVERY_MS = 9000
const SHOOTING_STAR_LENGTH_MS = 900

// A small seeded random generator, so the scene looks the same on every load.
function seededRandom(seed) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

// Turns "#2e6b4f" into "rgba(46, 107, 79, 0.4)". Falls back to the original
// colour (without transparency) if it is not a 6-digit hex value.
function withAlpha(colour, alpha) {
  const match = /^#([0-9a-f]{6})$/i.exec(colour.trim())
  if (!match) return colour
  const value = parseInt(match[1], 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
}

export function createScene() {
  const random = seededRandom(7)

  // Globe nodes, spread evenly over a sphere with a Fibonacci spiral.
  const nodes = Array.from({ length: NODE_COUNT }, (_, index) => {
    const y = 1 - (index / (NODE_COUNT - 1)) * 2
    const ring = Math.sqrt(1 - y * y)
    const angle = index * GOLDEN_ANGLE
    return { x: Math.cos(angle) * ring, y, z: Math.sin(angle) * ring, size: 0.8 + random() * 1.1 }
  })

  // Connect every node to its nearest neighbours; skip duplicate pairs.
  const edges = []
  const seen = new Set()
  nodes.forEach((node, index) => {
    nodes
      .map((other, otherIndex) => ({
        otherIndex,
        distance: (node.x - other.x) ** 2 + (node.y - other.y) ** 2 + (node.z - other.z) ** 2,
      }))
      .filter((candidate) => candidate.otherIndex !== index)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, NEIGHBOURS_PER_NODE)
      .forEach(({ otherIndex }) => {
        const key = index < otherIndex ? `${index}-${otherIndex}` : `${otherIndex}-${index}`
        if (seen.has(key)) return
        seen.add(key)
        edges.push([index, otherIndex])
      })
  })

  // Particles drift upwards around the globe and fade in and out.
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: (random() - 0.5) * 3.4,
    z: (random() - 0.5) * 3.4,
    phase: random(),
    speed: 0.5 + random(),
    size: 0.8 + random() * 1.4,
  }))

  // Stars are only drawn in the dark theme.
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: random(),
    y: random(),
    size: 0.5 + random() * 1.1,
    depth: 0.2 + random() * 0.8,
    twinklePhase: random() * TAU,
    twinkleSpeed: 0.0006 + random() * 0.0012,
  }))

  // Two tilted orbit rings, each with one satellite.
  const orbits = [
    { scale: 1.32, squash: 0.28, rotation: -0.35, speed: 0.00016, phase: 0.6 },
    { scale: 1.62, squash: 0.2, rotation: 0.28, speed: -0.00011, phase: 3.1 },
  ]

  // Re-used every frame so drawing does not create garbage.
  const projected = nodes.map(() => ({ x: 0, y: 0, depth: 0, scale: 1 }))

  return { nodes, edges, particles, stars, orbits, projected }
}

// Rotates a 3D point (spin around the vertical axis, then tilt) and writes
// its screen position into `out`. Units are globe radii.
function projectPoint(point, spin, tilt, centreX, centreY, radius, out) {
  const cosSpin = Math.cos(spin)
  const sinSpin = Math.sin(spin)
  const spunX = point.x * cosSpin + point.z * sinSpin
  const spunZ = -point.x * sinSpin + point.z * cosSpin

  const cosTilt = Math.cos(tilt)
  const sinTilt = Math.sin(tilt)
  const y = point.y * cosTilt - spunZ * sinTilt
  const z = point.y * sinTilt + spunZ * cosTilt

  const scale = CAMERA_DISTANCE / (CAMERA_DISTANCE - z)
  out.x = centreX + spunX * radius * scale
  out.y = centreY + y * radius * scale
  out.scale = scale
  out.depth = clamp((z + 1) / 2, 0, 1) // 0 = far side, 1 = near side
  return out
}

function drawGlobe(context, scene, frame) {
  const { projected, nodes, edges } = scene
  const { spin, tilt, centreX, centreY, radius, palette, intensity } = frame

  nodes.forEach((node, index) => projectPoint(node, spin, tilt, centreX, centreY, radius, projected[index]))

  // Soft glow behind the globe (dark theme only, light theme stays flat).
  if (palette.dark) {
    const glow = context.createRadialGradient(centreX, centreY, radius * 0.2, centreX, centreY, radius * 1.5)
    glow.addColorStop(0, withAlpha(palette.accent, 0.14 * intensity))
    glow.addColorStop(1, withAlpha(palette.accent, 0))
    context.globalAlpha = 1
    context.fillStyle = glow
    context.beginPath()
    context.arc(centreX, centreY, radius * 1.5, 0, TAU)
    context.fill()
  }

  // Outline of the sphere.
  context.globalAlpha = 0.14 * intensity
  context.strokeStyle = palette.accent
  context.lineWidth = 1
  context.beginPath()
  context.arc(centreX, centreY, radius, 0, TAU)
  context.stroke()

  // Connections: lines on the far side fade out, which gives the depth.
  edges.forEach(([from, to]) => {
    const a = projected[from]
    const b = projected[to]
    context.globalAlpha = (0.04 + ((a.depth + b.depth) / 2) * 0.22) * intensity
    context.beginPath()
    context.moveTo(a.x, a.y)
    context.lineTo(b.x, b.y)
    context.stroke()
  })

  // Nodes: bigger and brighter on the near side.
  context.fillStyle = palette.accent
  nodes.forEach((node, index) => {
    const point = projected[index]
    context.globalAlpha = (0.2 + point.depth * 0.55) * intensity
    context.beginPath()
    context.arc(point.x, point.y, node.size * (0.6 + point.depth * 0.9) * point.scale, 0, TAU)
    context.fill()
  })
}

function drawOrbits(context, scene, frame) {
  const { time, centreX, centreY, radius, palette, intensity } = frame

  scene.orbits.forEach((orbit) => {
    const radiusX = radius * orbit.scale
    const radiusY = radiusX * orbit.squash
    const cosRotation = Math.cos(orbit.rotation)
    const sinRotation = Math.sin(orbit.rotation)

    context.globalAlpha = 0.12 * intensity
    context.strokeStyle = palette.accent
    context.lineWidth = 1
    context.setLineDash([2, 7])
    context.beginPath()
    context.ellipse(centreX, centreY, radiusX, radiusY, orbit.rotation, 0, TAU)
    context.stroke()
    context.setLineDash([])

    // The satellite: larger and brighter while it passes in front of the globe.
    const angle = time * orbit.speed + orbit.phase
    const localX = Math.cos(angle) * radiusX
    const localY = Math.sin(angle) * radiusY
    const x = centreX + localX * cosRotation - localY * sinRotation
    const y = centreY + localX * sinRotation + localY * cosRotation
    const front = (Math.sin(angle) + 1) / 2

    context.fillStyle = palette.accent
    context.globalAlpha = (0.3 + front * 0.6) * intensity
    context.beginPath()
    context.arc(x, y, 2.4 + front * 1.8, 0, TAU)
    context.fill()

    context.globalAlpha = 0.18 * front * intensity
    context.beginPath()
    context.arc(x, y, 8 + front * 4, 0, TAU)
    context.fill()
  })
}

function drawParticles(context, scene, frame) {
  const { time, spin, centreX, centreY, radius, palette, intensity } = frame
  const cosSpin = Math.cos(spin * 0.6)
  const sinSpin = Math.sin(spin * 0.6)

  context.fillStyle = palette.accent
  scene.particles.forEach((particle) => {
    // `lift` runs from 0 to 1 and wraps, so each particle rises, fades and restarts.
    const lift = (particle.phase + time * 0.000018 * particle.speed) % 1
    const x = particle.x * cosSpin + particle.z * sinSpin
    const z = -particle.x * sinSpin + particle.z * cosSpin
    const scale = CAMERA_DISTANCE / (CAMERA_DISTANCE - clamp(z, -1.5, 1.5))

    context.globalAlpha = Math.sin(lift * Math.PI) * 0.4 * intensity
    context.beginPath()
    context.arc(
      centreX + x * radius * scale,
      centreY + (0.5 - lift) * 3.2 * radius * scale,
      particle.size * scale,
      0,
      TAU,
    )
    context.fill()
  })
}

function drawStars(context, scene, frame) {
  const { time, width, height, pointer, palette, intensity } = frame

  context.fillStyle = palette.star
  scene.stars.forEach((star) => {
    const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase)
    context.globalAlpha = (0.15 + twinkle * 0.45) * star.depth * intensity
    context.beginPath()
    context.arc(
      star.x * width - pointer.x * 14 * star.depth,
      star.y * height - pointer.y * 14 * star.depth,
      star.size,
      0,
      TAU,
    )
    context.fill()
  })
}

// A crescent made by cutting a smaller circle out of a larger one.
function drawMoon(context, x, y, radius, palette, intensity) {
  const glow = context.createRadialGradient(x, y, radius * 0.6, x, y, radius * 3.2)
  glow.addColorStop(0, withAlpha(palette.star, 0.16 * intensity))
  glow.addColorStop(1, withAlpha(palette.star, 0))
  context.globalAlpha = 1
  context.fillStyle = glow
  context.beginPath()
  context.arc(x, y, radius * 3.2, 0, TAU)
  context.fill()

  context.save()
  context.beginPath()
  context.rect(x - radius * 2, y - radius * 2, radius * 4, radius * 4)
  context.arc(x + radius * 0.5, y - radius * 0.22, radius * 0.88, 0, TAU)
  context.clip('evenodd') // keep everything except the cut-out circle
  context.globalAlpha = 0.85 * intensity
  context.fillStyle = palette.star
  context.beginPath()
  context.arc(x, y, radius, 0, TAU)
  context.fill()
  context.restore()
}

// One streak every few seconds, from a slightly different spot each time.
function drawShootingStar(context, frame) {
  const { time, width, height, palette, intensity } = frame
  const cycle = Math.floor(time / SHOOTING_STAR_EVERY_MS)
  const progress = (time % SHOOTING_STAR_EVERY_MS) / SHOOTING_STAR_LENGTH_MS
  if (progress >= 1) return

  const seed = (Math.sin(cycle * 12.9898) * 43758.5453) % 1
  const startX = width * (0.1 + Math.abs(seed) * 0.5)
  const startY = height * (0.06 + Math.abs(seed * 7 % 1) * 0.2)
  const headX = startX + progress * width * 0.28
  const headY = startY + progress * width * 0.14
  const tailX = headX - width * 0.06
  const tailY = headY - width * 0.03

  const trail = context.createLinearGradient(tailX, tailY, headX, headY)
  trail.addColorStop(0, withAlpha(palette.star, 0))
  trail.addColorStop(1, withAlpha(palette.star, 0.8))
  context.globalAlpha = Math.sin(progress * Math.PI) * intensity
  context.strokeStyle = trail
  context.lineWidth = 1.5
  context.beginPath()
  context.moveTo(tailX, tailY)
  context.lineTo(headX, headY)
  context.stroke()
}

export function drawScene(context, scene, { width, height, time, pointer, palette, intensity }) {
  context.clearRect(0, 0, width, height)

  // The globe sits in the upper right and partly runs off the edge, so it
  // frames the page without crowding the content on the left.
  const radius = clamp(Math.min(width, height) * 0.36, 150, 330)
  const frame = {
    time,
    width,
    height,
    pointer,
    palette,
    intensity,
    radius,
    centreX: width - radius * 0.55 - pointer.x * 10,
    centreY: height * 0.34 - pointer.y * 8,
    spin: time * 0.00007 + pointer.x * 0.35,
    tilt: 0.4 + pointer.y * 0.18,
  }

  if (palette.dark) {
    drawStars(context, scene, frame)
    // Wide screens: up and to the left of the globe. Narrow screens: top right,
    // clear of the page title.
    const narrow = width < 700
    const moonX = narrow ? width * 0.84 : frame.centreX - radius * 1.15
    const moonY = narrow ? 110 : frame.centreY - radius * 0.5
    drawMoon(context, moonX, moonY, radius * 0.1, palette, intensity)
    drawShootingStar(context, frame)
  }

  drawParticles(context, scene, frame)
  drawGlobe(context, scene, frame)
  drawOrbits(context, scene, frame)

  context.globalAlpha = 1
}
