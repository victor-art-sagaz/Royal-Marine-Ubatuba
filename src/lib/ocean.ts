/**
 * Mar da área de Contato, visto de cima, no estilo das ondas que quebram na praia:
 *
 * - As ondas descem (de cima para baixo), sempre em pedaços curtos e irregulares, nunca de ponta a ponta.
 * - Cada pedaço nasce pequeno, ganha força, "quebra" (a crista vai se rasgando) e se desfaz em espuma.
 * - Atrás da crista fica a espuma rendada (fios finos e bolhinhas), que vai sumindo.
 * - A água é translúcida, com manchas de luz passeando.
 *
 * O mesmo desenho serve de "mapa de alturas" (heightAt) para o barco balançar de verdade
 * quando uma onda passa por baixo dele.
 */

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount

/** Número "aleatório" sempre igual para o mesmo n (entre 0 e 1). */
const hash = (n: number): number => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return v - Math.floor(v)
}

function get2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D indisponível neste navegador.')
  return ctx
}

const WASH_W = 820
const WASH_H = 128
const SLICE = 12

/** Pedaço de "espuma rendada" (nuvem, fios, rendinhas e bolhas) desenhado uma vez só: a base é a crista, o topo some. */
function makeWashSprite(seed: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = WASH_W
  canvas.height = WASH_H
  const g = get2d(canvas)
  let n = seed * 977
  const rnd = () => hash(n++)

  const clusters: { x: number; w: number }[] = []
  for (let i = 0; i < 22; i++) clusters.push({ x: rnd() * WASH_W, w: 18 + rnd() * 60 })
  const pickX = () => {
    if (rnd() < 0.7) {
      const c = clusters[Math.floor(rnd() * clusters.length)]
      return clamp(c.x + (rnd() + rnd() + rnd() - 1.5) * c.w, 0, WASH_W)
    }
    return rnd() * WASH_W
  }
  const pickY = (power: number, spread: number) => WASH_H - Math.pow(rnd(), power) * WASH_H * spread

  // Nuvem de espuma (corpo branco macio, mais densa perto da crista)
  for (let i = 0; i < 190; i++) {
    const x = pickX()
    const y = pickY(1.5, 0.85)
    const r = 4 + rnd() * 12
    const grad = g.createRadialGradient(x, y, 0, x, y, r)
    grad.addColorStop(0, 'rgba(244,255,255,0.34)')
    grad.addColorStop(0.6, 'rgba(244,255,255,0.14)')
    grad.addColorStop(1, 'rgba(244,255,255,0)')
    g.fillStyle = grad
    g.fillRect(x - r, y - r, r * 2, r * 2)
  }

  // Fios de espuma: curtos, tortos e inclinados para os dois lados
  g.lineCap = 'round'
  for (let i = 0; i < 2300; i++) {
    const x = pickX()
    const depth = Math.pow(rnd(), 1.4)
    const y0 = WASH_H - depth * WASH_H * 0.95
    const length = 4 + rnd() * 20 * (0.4 + 0.6 * (1 - depth))
    const tilt = (rnd() - 0.5) * 1.1
    const bend = (rnd() - 0.5) * 8
    const x1 = x + Math.sin(tilt) * length
    const y1 = y0 - Math.cos(tilt) * length
    g.strokeStyle = `rgba(246,255,255,${(0.22 + 0.62 * rnd()).toFixed(2)})`
    g.lineWidth = 0.8 + rnd() * 1.9
    g.beginPath()
    g.moveTo(x, y0)
    g.quadraticCurveTo((x + x1) / 2 + bend, (y0 + y1) / 2, x1, y1)
    g.stroke()
  }

  // Rendinhas: arcos de bolhas coladas, como espuma de verdade
  for (let i = 0; i < 520; i++) {
    const x = pickX()
    const y = pickY(1.35, 0.95)
    const r = 2.2 + rnd() * 6
    const start = rnd() * 6.28
    g.strokeStyle = `rgba(250,255,255,${(0.28 + 0.5 * rnd()).toFixed(2)})`
    g.lineWidth = 0.7 + rnd() * 0.9
    g.beginPath()
    g.arc(x, y, r, start, start + 1.4 + rnd() * 3.6)
    g.stroke()
  }

  // Bolhinhas cheias
  for (let i = 0; i < 520; i++) {
    const x = pickX()
    const y = pickY(1.3, 0.95)
    g.fillStyle = `rgba(255,255,255,${(0.4 + 0.5 * rnd()).toFixed(2)})`
    g.beginPath()
    g.arc(x, y, 0.6 + rnd() * 2.2, 0, Math.PI * 2)
    g.fill()
  }

  // O topo vai sumindo
  g.globalCompositeOperation = 'destination-in'
  const mask = g.createLinearGradient(0, 0, 0, WASH_H)
  mask.addColorStop(0, 'rgba(0,0,0,0)')
  mask.addColorStop(0.5, 'rgba(0,0,0,0.5)')
  mask.addColorStop(0.85, 'rgba(0,0,0,0.95)')
  mask.addColorStop(1, 'rgba(0,0,0,1)')
  g.fillStyle = mask
  g.fillRect(0, 0, WASH_W, WASH_H)
  return canvas
}

/** Mancha de espuma redonda e macia (usada na beira da crista). */
function makePuffSprite(seed: number): HTMLCanvasElement {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const g = get2d(canvas)
  for (let i = 0; i < 7; i++) {
    const cx = size / 2 + (hash(seed * 9 + i) - 0.5) * 22
    const cy = size / 2 + (hash(seed * 13 + i) - 0.5) * 22
    const r = 8 + hash(seed * 17 + i) * 12
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r)
    grad.addColorStop(0, 'rgba(255,255,255,0.6)')
    grad.addColorStop(0.55, 'rgba(255,255,255,0.24)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, size, size)
  }
  for (let i = 0; i < 18; i++) {
    const angle = hash(seed * 21 + i) * Math.PI * 2
    const dist = hash(seed * 25 + i) * 21
    g.fillStyle = 'rgba(255,255,255,0.8)'
    g.beginPath()
    g.arc(size / 2 + Math.cos(angle) * dist, size / 2 + Math.sin(angle) * dist, 0.8 + hash(seed * 29 + i) * 1.8, 0, Math.PI * 2)
    g.fill()
  }
  return canvas
}

/** Um pedaço de onda. Cada um nasce no alto, desce, quebra e some; depois renasce em outro lugar. */
interface Crest {
  cx: number
  len: number
  /** altura (y) do centro da crista */
  y: number
  /** 0 = acabou de nascer, 1 = sumiu */
  u: number
  /** força (0 a 1) */
  s: number
  /** o quanto já quebrou (0 a 1) */
  b: number
  bend: number
  slope: number
  a1: number
  k1: number
  p1: number
  a2: number
  k2: number
  p2: number
  wash: number
  sprite: number
  spriteX: number
  seed: number
}

const MARGIN = 100
const WAVE_SPEED = 34

export class OceanRenderer {
  private crests: Crest[] = []
  private pool: Crest[] = []
  private time = 0
  private washes = [makeWashSprite(1), makeWashSprite(2), makeWashSprite(3)]
  private puffs = [makePuffSprite(1), makePuffSprite(2), makePuffSprite(3)]

  /** Calcula onde está cada pedaço de onda neste instante. */
  private update(W: number, H: number, t: number): void {
    this.time = t
    const scale = clamp(W / 1100, 0.5, 1.15)
    const count = clamp(Math.round((W * H) / 36000), 10, 40)
    this.crests.length = 0
    for (let i = 0; i < count; i++) {
      const rate = WAVE_SPEED * (0.72 + 0.56 * hash(i * 3.37 + 0.5))
      const period = (H + MARGIN * 2) / rate
      const phase = t / period + ((i * 0.61803398875) % 1)
      const cycle = Math.floor(phase)
      const u = phase - cycle
      const r = (k: number) => hash(i * 91.7 + cycle * 13.13 + k * 7.77)

      const len = (120 + 340 * Math.pow(r(1), 1.2)) * scale
      const cx = (r(0) * 1.3 - 0.15) * W
      if (cx + len / 2 < -40 || cx - len / 2 > W + 40) continue

      let crest = this.pool[this.crests.length]
      if (!crest) {
        crest = {} as Crest
        this.pool[this.crests.length] = crest
      }
      crest.cx = cx
      crest.len = len
      crest.y = -MARGIN + u * (H + MARGIN * 2)
      crest.u = u
      crest.s = smoothstep(0, 0.12, u) * (1 - smoothstep(0.72, 1, u))
      crest.b = smoothstep(0.3, 0.85, u)
      crest.bend = (r(2) - 0.5) * 0.26
      crest.slope = (r(3) - 0.5) * 0.2
      crest.a1 = (2 + 3.5 * r(4)) * scale
      crest.k1 = (Math.PI * 2) / ((70 + 100 * r(5)) * scale)
      crest.p1 = r(6) * 6.28
      crest.a2 = (0.8 + 1.2 * r(7)) * scale
      crest.k2 = (Math.PI * 2) / ((26 + 30 * r(8)) * scale)
      crest.p2 = r(9) * 6.28
      crest.wash = (0.7 + 0.6 * r(10)) * (0.8 + 0.2 * scale)
      crest.sprite = Math.floor(r(11) * 3) % 3
      crest.spriteX = r(12) * Math.max(0, WASH_W - len - SLICE * 2)
      crest.seed = r(13) * 50
      this.crests.push(crest)
    }
  }

  private crestY(c: Crest, x: number): number {
    const a = (x - c.cx) / c.len
    const t = this.time
    return (
      c.y +
      c.slope * (x - c.cx) +
      c.bend * c.len * 2 * a * a +
      c.a1 * Math.sin(x * c.k1 + c.p1 + t * 0.3) +
      c.a2 * Math.sin(x * c.k2 + c.p2 - t * 0.45)
    )
  }

  /** Força da onda ao longo do comprimento: some nas pontas (a onda "acaba" no meio do mar). */
  private edge(a01: number): number {
    return Math.pow(Math.sin(Math.PI * clamp(a01, 0, 1)), 0.6)
  }

  /**
   * Altura da água em um ponto (0 = mar calmo, perto de 1 = em cima de uma crista).
   * O barco usa isso para saber como inclinar quando a onda passa por baixo dele.
   */
  heightAt(x: number, y: number): number {
    let h = 0
    for (const c of this.crests) {
      const half = c.len / 2 + 24
      if (x < c.cx - half || x > c.cx + half) continue
      const d = y - this.crestY(c, x)
      if (d < -150 || d > 60) continue
      const profile = d < 0 ? Math.exp(-(d * d) / (2 * 50 * 50)) : Math.exp(-(d * d) / (2 * 17 * 17))
      h += profile * this.edge((x - c.cx) / c.len + 0.5) * c.s * (1 - 0.5 * c.b)
    }
    return Math.min(h, 1.4)
  }

  draw(ctx: CanvasRenderingContext2D, W: number, H: number, t: number): void {
    this.update(W, H, t)
    this.drawLight(ctx, W, H, t)
    ctx.save()
    // As ondas mais altas (mais atrás) primeiro, para a espuma de uma cobrir a da outra de forma natural
    for (const c of this.crests) {
      if (c.s < 0.02) continue
      this.drawCrest(ctx, c)
    }
    ctx.restore()
  }

  /** Manchas macias de luz que passeiam pela água (como a luz atravessando o mar). */
  private drawLight(ctx: CanvasRenderingContext2D, W: number, H: number, t: number): void {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const base = Math.max(240, Math.min(W, H) * 0.42)
    for (let i = 0; i < 6; i++) {
      const cx = W * (0.5 + 0.48 * Math.sin(t * 0.06 * (1 + i * 0.13) + i * 2.1))
      const cy = H * (0.5 + 0.48 * Math.cos(t * 0.045 * (1 + i * 0.17) + i * 1.3))
      const radius = base * (0.8 + (i % 3) * 0.3)
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      glow.addColorStop(0, 'rgba(120,230,225,0.12)')
      glow.addColorStop(0.5, 'rgba(90,205,215,0.05)')
      glow.addColorStop(1, 'rgba(90,205,215,0)')
      ctx.fillStyle = glow
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
    }
    ctx.restore()
  }

  private drawCrest(ctx: CanvasRenderingContext2D, c: Crest): void {
    const x0 = c.cx - c.len / 2
    const x1 = c.cx + c.len / 2
    const t = this.time
    const washHeight = lerp(26, 86, smoothstep(0, 0.78, c.u)) * c.wash
    const strength = c.s

    // 1) Espuma rendada atrás da crista (em fatias que seguem a curva da onda)
    const sprite = this.washes[c.sprite]
    const alphaBase = strength * (0.5 + 0.5 * c.b)
    // (as fatias ficam alinhadas numa grade de pixels inteiros, para não aparecerem emendas)
    const gridStart = Math.floor(x0 / SLICE) * SLICE
    for (let x = gridStart; x < x1; x += SLICE) {
      const xm = x + SLICE / 2
      const e = this.edge((xm - x0) / c.len)
      const alpha = alphaBase * Math.pow(e, 2.2)
      if (alpha < 0.02) continue
      const yc = this.crestY(c, xm)
      const sx = clamp(Math.round(c.spriteX + (x - gridStart)), 0, WASH_W - SLICE)
      ctx.globalAlpha = Math.min(1, alpha)
      ctx.drawImage(sprite, sx, 0, SLICE, WASH_H, x, Math.round(yc - washHeight + 5), SLICE, Math.round(washHeight))
    }
    // mais uma camada, só junto da crista, para a espuma ficar bem branca ali
    for (let x = gridStart; x < x1; x += SLICE) {
      const xm = x + SLICE / 2
      const alpha = alphaBase * Math.pow(this.edge((xm - x0) / c.len), 2.2) * 0.55
      if (alpha < 0.02) continue
      const yc = this.crestY(c, xm)
      const h2 = washHeight * 0.42
      const sx = clamp(Math.round(c.spriteX + (x - gridStart)), 0, WASH_W - SLICE)
      ctx.globalAlpha = Math.min(1, alpha)
      ctx.drawImage(sprite, sx, WASH_H * 0.5, SLICE, WASH_H * 0.5, x, Math.round(yc - h2 + 4), SLICE, Math.round(h2))
    }
    ctx.globalAlpha = 1

    // 2) Face da onda: faixa clara e translúcida logo à frente da crista (fatias que seguem a curva)
    const faceDepth = 22 + 14 * c.wash
    const face = ctx.createLinearGradient(0, -4, 0, faceDepth)
    face.addColorStop(0, 'rgba(210,250,247,0.22)')
    face.addColorStop(1, 'rgba(210,250,247,0)')
    ctx.fillStyle = face
    for (let x = gridStart; x < x1; x += SLICE) {
      const xm = x + SLICE / 2
      const alpha = strength * (1 - 0.45 * c.b) * Math.pow(this.edge((xm - x0) / c.len), 2.2)
      if (alpha < 0.02) continue
      ctx.globalAlpha = Math.min(1, alpha)
      ctx.save()
      ctx.translate(0, this.crestY(c, xm))
      ctx.fillRect(x, -4, SLICE, faceDepth + 4)
      ctx.restore()
    }
    ctx.globalAlpha = 1

    // 3) Crista: fio de espuma que se rasga (cheio de falhas) e engrossa em alguns pontos
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    const gapLimit = 0.16 + 0.5 * c.b
    const sampleStep = 5
    let run: number[] = []
    let runNoise = 0
    const flush = () => {
      if (run.length >= 4) {
        const avg = runNoise / (run.length / 2)
        const mid = run[Math.floor(run.length / 4) * 2]
        const e = this.edge((mid - x0) / c.len)
        const alpha = clamp((0.5 + 0.5 * avg) * strength * e * 1.25, 0, 1)
        const width = (1.8 + 4.2 * avg * avg) * (0.5 + 0.5 * strength)
        ctx.beginPath()
        ctx.moveTo(run[0], run[1])
        for (let i = 2; i < run.length; i += 2) ctx.lineTo(run[i], run[i + 1])
        ctx.strokeStyle = 'rgba(235,255,255,1)'
        ctx.globalAlpha = alpha * 0.16
        ctx.lineWidth = width * 3.4
        ctx.stroke()
        ctx.globalAlpha = alpha
        ctx.lineWidth = width
        ctx.stroke()
      }
      run = []
      runNoise = 0
    }
    for (let x = x0; x <= x1; x += sampleStep) {
      const cell = Math.floor(x / 9)
      const n = 0.55 * hash(cell * 1.3 + c.seed * 13) + 0.45 * (0.5 + 0.5 * Math.sin(x * 0.05 + c.seed * 7 + t * 0.5))
      if (n < gapLimit) {
        flush()
        continue
      }
      run.push(x, this.crestY(c, x))
      runNoise += n
      if (run.length >= 14) {
        const lastX = run[run.length - 2]
        const lastY = run[run.length - 1]
        const noise = runNoise
        flush()
        // a próxima parte começa onde esta terminou (sem buracos entre elas)
        run = [lastX, lastY]
        runNoise = noise / 7
      }
    }
    flush()
    ctx.globalAlpha = 1

    // 4) Bolhas e flocos de espuma estourando na beira da crista
    const puffs = 4 + Math.round(5 * c.b)
    for (let i = 0; i < puffs; i++) {
      const pa = hash(c.seed * 31 + i * 5.3)
      const px = x0 + pa * c.len
      const e = this.edge(pa)
      const jitter = (hash(c.seed * 17 + i) - 0.4) * 16
      const size = (20 + 26 * hash(c.seed * 11 + i)) * (0.6 + 0.6 * c.b)
      ctx.globalAlpha = clamp(0.55 * strength * e, 0, 1)
      ctx.drawImage(this.puffs[(i + c.sprite) % 3], px - size / 2, this.crestY(c, px) + jitter - size / 2, size, size)
    }
    ctx.globalAlpha = 1
  }
}
