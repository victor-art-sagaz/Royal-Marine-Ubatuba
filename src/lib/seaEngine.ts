/**
 * Animação do barco que segue o mouse/toque (adaptada do arquivo da MUSA).
 *
 * - WaveGrid: grade que simula ondas na água (cada toque vira uma ondulação).
 * - BoatController: controla o barco: segue o dedo/mouse, mergulha no botão,
 *   navega por cima dele e volta a seguir. Deixa uma esteira de espuma.
 */

import { OceanRenderer } from './ocean'

export interface BoatOptions {
  section: HTMLElement
  waterCanvas: HTMLCanvasElement
  boat: HTMLElement
  boatInner: HTMLElement
  button: HTMLElement
  buttonCanvas: HTMLCanvasElement
  onFirstMove?: () => void
}

/** Tamanho do barco na tela (largura x comprimento, em pixels). */
export const BOAT_WIDTH = 44
export const BOAT_LENGTH = 106

const SEA_CELL = 7 // tamanho de cada "quadradinho" da água do fundo (esteira do barco)
const BUTTON_CELL = 3 // idem, para a água dentro do botão
const MAX_SPEED = 520
const FOLLOW_GAIN = 5
const DIVE_SCALE = 0.32
const DIVE_TIME = 0.7
const EXIT_TIME = 0.5

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount
const rand = (min: number, max: number) => min + Math.random() * (max - min)
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const smoothstep = (t: number) => t * t * (3 - 2 * t)
/** Número "aleatório" sempre igual para o mesmo n (entre 0 e 1). */
const hash = (n: number): number => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return v - Math.floor(v)
}

/** Pontinhos de espuma desenhados uma vez só e reaproveitados (mais leve e mais macio que círculos). */
function makeFoamSprite(seed: number): HTMLCanvasElement {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const g = get2d(canvas)
  for (let i = 0; i < 7; i++) {
    const cx = size / 2 + (hash(seed * 9 + i) - 0.5) * 22
    const cy = size / 2 + (hash(seed * 13 + i) - 0.5) * 22
    const r = 9 + hash(seed * 17 + i) * 12
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r)
    grad.addColorStop(0, 'rgba(255,255,255,0.55)')
    grad.addColorStop(0.55, 'rgba(255,255,255,0.22)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, size, size)
  }
  for (let i = 0; i < 16; i++) {
    const angle = hash(seed * 21 + i) * Math.PI * 2
    const dist = hash(seed * 25 + i) * 20
    const r = 0.9 + hash(seed * 29 + i) * 2
    g.fillStyle = 'rgba(255,255,255,0.8)'
    g.beginPath()
    g.arc(size / 2 + Math.cos(angle) * dist, size / 2 + Math.sin(angle) * dist, r, 0, Math.PI * 2)
    g.fill()
  }
  return canvas
}

/** Menor diferença entre dois ângulos (em radianos). */
function angleDiff(from: number, to: number): number {
  let diff = (to - from) % (Math.PI * 2)
  if (diff > Math.PI) diff -= Math.PI * 2
  if (diff < -Math.PI) diff += Math.PI * 2
  return diff
}

function get2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D indisponível neste navegador.')
  return ctx
}

export class WaveGrid {
  w = 0
  h = 0
  cur = new Float32Array(0)
  prev = new Float32Array(0)
  damping: number

  constructor(width: number, height: number, damping = 0.985) {
    this.damping = damping
    this.resize(width, height)
  }

  resize(width: number, height: number): void {
    this.w = Math.max(3, Math.floor(width))
    this.h = Math.max(3, Math.floor(height))
    const size = this.w * this.h
    this.cur = new Float32Array(size)
    this.prev = new Float32Array(size)
  }

  clear(): void {
    this.cur.fill(0)
    this.prev.fill(0)
  }

  /** Cria uma ondulação em (x, y). */
  disturb(x: number, y: number, amount: number, radius = 1): void {
    const reach = Math.ceil(radius * 2)
    const cx = Math.round(x)
    const cy = Math.round(y)
    for (let dy = -reach; dy <= reach; dy++) {
      for (let dx = -reach; dx <= reach; dx++) {
        const px = cx + dx
        const py = cy + dy
        if (px < 1 || py < 1 || px >= this.w - 1 || py >= this.h - 1) continue
        const dist = Math.hypot(dx, dy) / radius
        this.cur[py * this.w + px] += amount * Math.exp(-dist * dist)
      }
    }
  }

  /** Avança a simulação um passo. */
  step(): void {
    const { w, h, cur, prev, damping } = this
    for (let row = 1; row < h - 1; row++) {
      let i = row * w + 1
      for (let col = 1; col < w - 1; col++) {
        prev[i] = ((cur[i - 1] + cur[i + 1] + cur[i - w] + cur[i + w]) * 0.5 - prev[i]) * damping
        i++
      }
    }
    this.prev = cur
    this.cur = prev
  }
}

interface Foam {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  grow: number
  age: number
  life: number
  a: number
}

interface Rect {
  x: number
  y: number
  w: number
  h: number
}


type Phase = 'follow' | 'dive' | 'sail' | 'exit'

export class BoatController {
  private o: BoatOptions
  private ctx: CanvasRenderingContext2D
  private bctx: CanvasRenderingContext2D
  private dpr = 1
  private W = 0
  private H = 0

  private sim = new WaveGrid(4, 4, 0.978)
  private simCanvas = document.createElement('canvas')
  private simCtx: CanvasRenderingContext2D
  private simImg!: ImageData

  private bsim = new WaveGrid(4, 4, 0.99)
  private bsimCanvas = document.createElement('canvas')
  private bsimCtx: CanvasRenderingContext2D
  private bsimImg!: ImageData

  private foam: Foam[] = []
  private bfoam: Foam[] = []
  private foamSprites: HTMLCanvasElement[] = [makeFoamSprite(1), makeFoamSprite(2), makeFoamSprite(3)]
  private ocean = new OceanRenderer()

  private phase: Phase = 'follow'
  private phaseT = 0
  private t = 0
  private last = 0
  private raf = 0
  private running = false

  private x = 0
  private y = 0
  private vx = 0
  private vy = 0
  private ang = 0
  private scale = 1
  private lift = 0
  private lastStern: { x: number; y: number } | null = null

  // Balanço do barco nas ondas (molas suaves: sobe, inclina e volta com um pouquinho de "gangorra")
  private sway = { heave: 0, heaveV: 0, pitch: 0, pitchV: 0, roll: 0, rollV: 0, push: 0, pushV: 0 }
  private swayWeight = 1

  private pointer = { cx: 0, cy: 0, active: false, seen: false }
  private seaOn = false
  private seaUntil = 0
  private btn: Rect = { x: 0, y: 0, w: 0, h: 0 }
  private drop = { x: 0, y: 0 }
  private dir = { x: 1, y: 0 }
  private dist = 0
  private sailTime = 2
  private diveFrom = { x: 0, y: 0, ang: 0 }
  private resolveSequence: (() => void) | null = null
  private ro: ResizeObserver

  constructor(options: BoatOptions) {
    this.o = options
    this.ctx = get2d(options.waterCanvas)
    this.bctx = get2d(options.buttonCanvas)
    this.simCtx = get2d(this.simCanvas)
    this.bsimCtx = get2d(this.bsimCanvas)
    this.resize()
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(options.section)
    const rect = this.getButtonRect()
    this.x = rect.x + rect.w / 2 - Math.min(170, this.W / 2 - 40)
    this.y = rect.y + rect.h / 2
    this.ang = 0
  }

  private resize = (): void => {
    const { section, waterCanvas } = this.o
    this.W = section.clientWidth
    this.H = section.clientHeight
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    waterCanvas.width = Math.max(1, Math.round(this.W * this.dpr))
    waterCanvas.height = Math.max(1, Math.round(this.H * this.dpr))
    const cols = Math.ceil(this.W / SEA_CELL) + 1
    const rows = Math.ceil(this.H / SEA_CELL) + 1
    this.sim.resize(cols, rows)
    this.simCanvas.width = this.sim.w
    this.simCanvas.height = this.sim.h
    this.simImg = this.simCtx.createImageData(this.sim.w, this.sim.h)
  }

  private onPointer = (event: PointerEvent): void => {
    this.pointer.cx = event.clientX
    this.pointer.cy = event.clientY
    this.pointer.active = true
    if (!this.pointer.seen) {
      this.pointer.seen = true
      this.o.onFirstMove?.()
    }
  }

  private onLeave = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse') this.pointer.active = false
  }

  private frame = (now: number): void => {
    if (!this.running) return
    if (!this.last) this.last = now
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    this.t += dt
    this.phaseT += dt

    switch (this.phase) {
      case 'follow':
        this.updateFollow(dt)
        break
      case 'dive':
        this.updateDive()
        break
      case 'sail':
        this.updateSail(dt)
        break
      case 'exit':
        this.updateExit(dt)
        break
    }

    this.sim.step()
    this.drawSea(dt)
    if (this.seaOn || now < this.seaUntil) {
      this.bsim.step()
      this.bsim.step()
      this.drawButtonSea(dt)
    }
    this.applyBoat(dt)
    this.raf = requestAnimationFrame(this.frame)
  }

  start(): void {
    if (this.running) return
    this.running = true
    const section = this.o.section
    section.addEventListener('pointermove', this.onPointer)
    section.addEventListener('pointerdown', this.onPointer)
    section.addEventListener('pointerleave', this.onLeave)
    this.last = 0
    this.raf = requestAnimationFrame(this.frame)
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.raf)
    const section = this.o.section
    section.removeEventListener('pointermove', this.onPointer)
    section.removeEventListener('pointerdown', this.onPointer)
    section.removeEventListener('pointerleave', this.onLeave)
    this.ro.disconnect()
  }

  /** Toca a sequência: o barco mergulha no botão, navega e sai. Resolve quando termina. */
  playBooking(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.phase !== 'follow') {
        resolve()
        return
      }
      this.resolveSequence = resolve
      const rect = this.getButtonRect()
      this.btn = rect
      this.setupButtonSea(rect)
      this.drop = {
        x: clamp(this.x - rect.x, rect.w * 0.22, rect.w * 0.78),
        y: clamp(this.y - rect.y, rect.h * 0.34, rect.h * 0.66),
      }
      const dx = this.x - (rect.x + rect.w / 2)
      const dy = this.y - (rect.y + rect.h / 2)
      let ex: number
      let ey: number
      if (Math.hypot(dx, dy) < 10) {
        ex = Math.cos(this.ang)
        ey = Math.sin(this.ang)
      } else {
        const side = dx !== 0 ? Math.sign(dx) : Math.cos(this.ang) >= 0 ? 1 : -1
        ex = side * Math.max(Math.abs(dx), Math.abs(dy) * 0.6, 6)
        ey = dy * 0.45
      }
      const len = Math.hypot(ex, ey) || 1
      this.dir = { x: ex / len, y: ey / len }
      this.dist = this.distanceToEdge(rect)
      this.sailTime = clamp(this.dist / 55, 1.6, 2.8)
      this.diveFrom = { x: this.x, y: this.y, ang: this.ang }
      this.phase = 'dive'
      this.phaseT = 0
      this.seaOn = true
      this.o.button.dataset.sea = 'on'
    })
  }

  /** Devolve o botão ao normal depois da animação. */
  resetButton(): void {
    this.o.button.dataset.sea = 'off'
    this.seaUntil = performance.now() + 700
    this.seaOn = false
  }

  private setupButtonSea(rect: Rect): void {
    const cols = Math.ceil(rect.w / BUTTON_CELL)
    const rows = Math.ceil(rect.h / BUTTON_CELL)
    this.bsim.resize(cols, rows)
    this.bsimCanvas.width = this.bsim.w
    this.bsimCanvas.height = this.bsim.h
    this.bsimImg = this.bsimCtx.createImageData(this.bsim.w, this.bsim.h)
    const canvas = this.o.buttonCanvas
    canvas.width = Math.max(1, Math.round(rect.w * this.dpr))
    canvas.height = Math.max(1, Math.round(rect.h * this.dpr))
    this.bfoam = []
  }

  private getButtonRect(): Rect {
    const section = this.o.section.getBoundingClientRect()
    const button = this.o.button.getBoundingClientRect()
    return { x: button.left - section.left, y: button.top - section.top, w: button.width, h: button.height }
  }

  /** Quantos pixels o barco consegue andar dentro do botão (formato de pílula). */
  private distanceToEdge(rect: Rect): number {
    const radius = rect.h / 2 - 11
    const inside = (px: number, py: number) => {
      const cx = clamp(px, rect.h / 2, rect.w - rect.h / 2)
      return Math.hypot(px - cx, py - rect.h / 2) <= radius
    }
    let n = 0
    while (n < 600 && inside(this.drop.x + this.dir.x * (n + 1), this.drop.y + this.dir.y * (n + 1))) n += 1
    return Math.max(n, 40)
  }

  private updateFollow(dt: number): void {
    const section = this.o.section.getBoundingClientRect()
    let targetX: number
    let targetY: number
    if (this.pointer.active) {
      targetX = clamp(this.pointer.cx - section.left, 0, this.W)
      targetY = clamp(this.pointer.cy - section.top, 0, this.H)
    } else {
      // Sem mouse/toque: o barco passeia em volta do botão
      const rect = this.getButtonRect()
      const radiusX = Math.min(180, this.W / 2 - 50)
      const radiusY = 90
      targetX = rect.x + rect.w / 2 + Math.cos(this.t * 0.5) * radiusX
      targetY = rect.y + rect.h / 2 + Math.sin(this.t * 0.5) * radiusY
    }
    let ax = (targetX - this.x) * FOLLOW_GAIN
    let ay = (targetY - this.y) * FOLLOW_GAIN
    const mag = Math.hypot(ax, ay)
    if (mag > MAX_SPEED) {
      ax = (ax / mag) * MAX_SPEED
      ay = (ay / mag) * MAX_SPEED
    }
    const smooth = 1 - Math.exp(-dt * 5)
    this.vx += (ax - this.vx) * smooth
    this.vy += (ay - this.vy) * smooth
    this.x += this.vx * dt
    this.y += this.vy * dt
    const speed = Math.hypot(this.vx, this.vy)
    if (speed > 14) {
      const heading = Math.atan2(this.vy, this.vx)
      this.ang += angleDiff(this.ang, heading) * (1 - Math.exp(-dt * 7))
    }
    this.scale = 1 + Math.sin(this.t * 2.4) * 0.012
    this.lift = 0
    this.wakeOnWater(dt, speed)
  }

  private updateDive(): void {
    const l = clamp(this.phaseT / DIVE_TIME, 0, 1)
    const eased = easeOutCubic(l)
    const targetX = this.btn.x + this.drop.x
    const targetY = this.btn.y + this.drop.y
    this.x = lerp(this.diveFrom.x, targetX, eased)
    this.y = lerp(this.diveFrom.y, targetY, eased)
    const heading = Math.atan2(this.dir.y, this.dir.x)
    this.ang = this.diveFrom.ang + angleDiff(this.diveFrom.ang, heading) * smoothstep(l)
    this.scale = lerp(1, DIVE_SCALE, smoothstep(l)) + 0.5 * Math.sin(Math.PI * l)
    this.lift = 40 * Math.sin(Math.PI * l)
    this.vx = 0
    this.vy = 0
    this.lastStern = null
    if (l >= 1) {
      this.splash()
      this.phase = 'sail'
      this.phaseT = 0
    }
  }

  private splash(): void {
    this.bsim.disturb(this.drop.x / BUTTON_CELL, this.drop.y / BUTTON_CELL, 2.2, 2.2)
    for (let i = 0; i < 22; i++) {
      const angle = (i / 22) * Math.PI * 2 + rand(-0.15, 0.15)
      const speed = rand(35, 95)
      this.bfoam.push({
        x: this.drop.x,
        y: this.drop.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.7,
        r: rand(1.4, 3),
        grow: rand(2, 6),
        age: 0,
        life: rand(0.5, 0.95),
        a: 0.9,
      })
    }
    const wx = this.btn.x + this.drop.x
    const wy = this.btn.y + this.drop.y
    this.sim.disturb(wx / SEA_CELL, wy / SEA_CELL, -1.1, 2.4)
  }

  private updateSail(_dt: number): void {
    const p = clamp(this.phaseT / this.sailTime, 0, 1)
    const eased = 1 - Math.cos((p * Math.PI) / 2)
    const u = this.drop.x + this.dir.x * this.dist * eased
    const n = this.drop.y + this.dir.y * this.dist * eased
    this.x = this.btn.x + u
    this.y = this.btn.y + n
    this.ang = Math.atan2(this.dir.y, this.dir.x)
    this.scale = DIVE_SCALE
    this.lift = 0
    const speed = ((this.dist * Math.PI) / 2 / this.sailTime) * Math.sin((p * Math.PI) / 2)
    this.vx = this.dir.x * speed
    this.vy = this.dir.y * speed

    const back = BOAT_LENGTH * 0.5 * DIVE_SCALE * 0.85
    const sx = u - this.dir.x * back
    const sy = n - this.dir.y * back
    const px = -this.dir.y
    const py = this.dir.x
    const strength = clamp(speed / 60, 0.15, 1.2)
    this.bsim.disturb(sx / BUTTON_CELL, sy / BUTTON_CELL, -0.4 * strength, 1.2)
    for (let i = 0; i < 2; i++) {
      const side = rand(-1, 1)
      this.bfoam.push({
        x: sx + px * side * 3,
        y: sy + py * side * 3,
        vx: px * side * rand(6, 22),
        vy: py * side * rand(6, 22),
        r: rand(1.4, 2.8),
        grow: rand(3, 7),
        age: 0,
        life: rand(0.7, 1.3),
        a: 0.85,
      })
    }
    if (this.bfoam.length > 400) this.bfoam.splice(0, this.bfoam.length - 400)

    if (p >= 1) {
      this.phase = 'exit'
      this.phaseT = 0
      this.lastStern = null
      const done = this.resolveSequence
      this.resolveSequence = null
      done?.()
    }
  }

  private updateExit(dt: number): void {
    const p = clamp(this.phaseT / EXIT_TIME, 0, 1)
    this.x += this.vx * dt
    this.y += this.vy * dt
    this.scale = lerp(DIVE_SCALE, 1, easeOutCubic(p))
    this.lift = 0
    if (p > 0.6) this.wakeOnWater(dt, Math.hypot(this.vx, this.vy))
    if (p >= 1) {
      this.phase = 'follow'
      this.phaseT = 0
    }
  }

  /** Esteira de espuma atrás do barco. */
  private wakeOnWater(dt: number, speed: number): void {
    const cos = Math.cos(this.ang)
    const sin = Math.sin(this.ang)
    const back = BOAT_LENGTH * 0.5 * this.scale * 0.92
    const sternX = this.x - cos * back
    const sternY = this.y - sin * back
    if (speed > 22) {
      const px = -sin
      const py = cos
      const from = this.lastStern ?? { x: sternX, y: sternY }
      const steps = clamp(Math.round((speed * dt) / 5), 1, 4)
      for (let d = 1; d <= steps; d++) {
        const k = d / steps
        const fx = lerp(from.x, sternX, k)
        const fy = lerp(from.y, sternY, k)
        const jitter = rand(-1, 1)
        this.foam.push({
          x: fx + px * jitter * 4,
          y: fy + py * jitter * 4,
          vx: px * jitter * rand(4, 14),
          vy: py * jitter * rand(4, 14),
          r: rand(3, 6),
          grow: rand(4, 9),
          age: 0,
          life: rand(1, 1.7),
          a: 0.55,
        })
        const side = Math.random() < 0.5 ? -1 : 1
        this.foam.push({
          x: fx + px * side * 8,
          y: fy + py * side * 8,
          vx: px * side * rand(18, 38),
          vy: py * side * rand(18, 38),
          r: rand(2, 4),
          grow: rand(3, 7),
          age: 0,
          life: rand(1.2, 2),
          a: 0.4,
        })
      }
      this.sim.disturb(sternX / SEA_CELL, sternY / SEA_CELL, -clamp(speed / 700, 0.05, 0.3), 1.1)
      if (this.foam.length > 700) this.foam.splice(0, this.foam.length - 700)
    }
    this.lastStern = { x: sternX, y: sternY }
  }

  private stepFoam(list: Foam[], dt: number): void {
    for (let i = list.length - 1; i >= 0; i--) {
      const f = list[i]
      f.age += dt
      if (f.age >= f.life) {
        list.splice(i, 1)
        continue
      }
      f.x += f.vx * dt
      f.y += f.vy * dt
      f.vx *= 0.985
      f.vy *= 0.985
      f.r += f.grow * dt
    }
  }

  private drawFoam(ctx: CanvasRenderingContext2D, list: Foam[]): void {
    for (const f of list) {
      const alpha = f.a * Math.pow(1 - f.age / f.life, 1.4)
      const size = f.r * 3
      ctx.globalAlpha = Math.min(1, alpha * 1.25)
      ctx.drawImage(this.foamSprites[Math.floor(f.life * 997) % 3], f.x - size, f.y - size, size * 2, size * 2)
    }
    ctx.globalAlpha = 1
  }

  private drawSea(dt: number): void {
    const { w, h, cur } = this.sim
    const data = this.simImg.data
    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        const i = row * w + col
        const p = i * 4
        if (col === 0 || row === 0 || col === w - 1 || row === h - 1) {
          data[p + 3] = 0
          continue
        }
        const slope = (cur[i - 1] - cur[i + 1] + cur[i - w] - cur[i + w]) * 1.3
        if (slope > 0) {
          data[p] = 255
          data[p + 1] = 255
          data[p + 2] = 255
          data[p + 3] = Math.min(110, slope * 255 * 0.55)
        } else {
          data[p] = 3
          data[p + 1] = 38
          data[p + 2] = 66
          data[p + 3] = Math.min(70, -slope * 255 * 0.4)
        }
      }
    }
    this.simCtx.putImageData(this.simImg, 0, 0)
    const ctx = this.ctx
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.clearRect(0, 0, this.W, this.H)
    this.ocean.draw(ctx, this.W, this.H, this.t)
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(this.simCanvas, 0, 0, w, h, 0, 0, w * SEA_CELL, h * SEA_CELL)
    this.stepFoam(this.foam, dt)
    this.drawFoam(ctx, this.foam)
  }

  private drawButtonSea(dt: number): void {
    const { w, h, cur } = this.bsim
    const data = this.bsimImg.data
    for (let row = 0; row < h; row++) {
      const depth = h > 1 ? row / (h - 1) : 0
      const baseR = lerp(34, 9, depth)
      const baseG = lerp(190, 104, depth)
      const baseB = lerp(208, 132, depth)
      for (let col = 0; col < w; col++) {
        const i = row * w + col
        let shade = Math.sin(col * 0.4 + row * 0.25 + this.t * 2.2) * 0.07
        let foamAmount = 0
        if (col > 0 && row > 0 && col < w - 1 && row < h - 1) {
          shade += (cur[i - 1] - cur[i + 1] + cur[i - w] - cur[i + w]) * 1.6
          foamAmount = Math.max(0, Math.abs(cur[i]) - 1.1) * 0.5
        }
        shade = clamp(shade, -1, 1)
        let r = baseR + shade * 60
        let g = baseG + shade * 60
        let b = baseB + shade * 50
        if (foamAmount > 0) {
          const m = Math.min(1, foamAmount)
          r += (255 - r) * m
          g += (255 - g) * m
          b += (255 - b) * m
        }
        const p = i * 4
        data[p] = r
        data[p + 1] = g
        data[p + 2] = b
        data[p + 3] = 255
      }
    }
    this.bsimCtx.putImageData(this.bsimImg, 0, 0)
    const ctx = this.bctx
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.clearRect(0, 0, this.btn.w, this.btn.h)
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(this.bsimCanvas, 0, 0, w, h, 0, 0, w * BUTTON_CELL, h * BUTTON_CELL)
    this.stepFoam(this.bfoam, dt)
    this.drawFoam(ctx, this.bfoam)
    const sheen = ctx.createLinearGradient(0, 0, 0, this.btn.h)
    sheen.addColorStop(0, 'rgba(255,255,255,0.28)')
    sheen.addColorStop(0.45, 'rgba(255,255,255,0)')
    ctx.fillStyle = sheen
    ctx.fillRect(0, 0, this.btn.w, this.btn.h)
  }

  /** Faz uma mola andar até o alvo (retorna o novo valor e a nova velocidade). */
  private spring(value: number, velocity: number, target: number, dt: number, stiffness: number, damping: number): [number, number] {
    const accel = (target - value) * stiffness - velocity * damping
    const v = velocity + accel * dt
    return [value + v * dt, v]
  }

  /**
   * Lê a altura da água sob a proa, a popa e os dois lados do barco e calcula:
   * quanto ele sobe (heave), o quanto a proa empina (pitch) e o quanto tomba de lado (roll).
   */
  private updateSway(dt: number): void {
    const sway = this.sway
    // Só balança na água de verdade: dentro do botão (mergulho/navegação) não tem onda
    const wantsWeight = this.phase === 'follow' || this.phase === 'exit' ? 1 : 0
    this.swayWeight += (wantsWeight - this.swayWeight) * (1 - Math.exp(-dt * 6))

    const cos = Math.cos(this.ang)
    const sin = Math.sin(this.ang)
    const half = BOAT_LENGTH * 0.5 * this.scale
    const side = BOAT_WIDTH * 0.5 * this.scale
    const at = (f: number, r: number) => this.ocean.heightAt(this.x + cos * f - sin * r, this.y + sin * f + cos * r)
    const bow = at(half, 0)
    const stern = at(-half, 0)
    const port = at(0, -side)
    const starboard = at(0, side)
    const center = at(0, 0)

    const steps = Math.max(1, Math.round(dt / 0.008))
    const h = dt / steps
    const w = this.swayWeight
    for (let i = 0; i < steps; i++) {
      ;[sway.heave, sway.heaveV] = this.spring(sway.heave, sway.heaveV, center * w, h, 70, 9)
      ;[sway.pitch, sway.pitchV] = this.spring(sway.pitch, sway.pitchV, clamp((bow - stern) * 17, -17, 17) * w, h, 60, 7)
      ;[sway.roll, sway.rollV] = this.spring(sway.roll, sway.rollV, clamp((starboard - port) * 20, -19, 19) * w, h, 52, 6)
      ;[sway.push, sway.pushV] = this.spring(sway.push, sway.pushV, center * w, h, 14, 4)
    }
  }

  private applyBoat(dt: number): void {
    const { boat, boatInner } = this.o
    this.updateSway(dt)
    const sway = this.sway
    // A onda empurra o barco um pouquinho na direção em que ela anda (para baixo)
    const pushY = sway.push * 5
    boat.style.transform = `translate3d(${this.x.toFixed(2)}px, ${(this.y + pushY).toFixed(2)}px, 0)`
    const lift = this.lift + sway.heave * 7
    const shadowAlpha = 0.4 - 0.12 * Math.min(1, lift / 40)
    boat.style.filter = `drop-shadow(0 ${(2 + lift * 0.3).toFixed(1)}px ${(3 + lift * 0.35).toFixed(1)}px rgba(0,25,45,${shadowAlpha.toFixed(2)}))`
    const size = this.scale * (1 + sway.heave * 0.045)
    // Gira com a direção do barco; depois inclina (proa sobe/desce e um lado sobe/desce) com perspectiva
    boatInner.style.transform =
      `rotate(${(this.ang + Math.PI / 2 + (sway.roll * 0.0035)).toFixed(4)}rad) ` +
      `perspective(320px) rotateX(${(-sway.pitch).toFixed(2)}deg) rotateY(${(-sway.roll).toFixed(2)}deg) ` +
      `scale(${size.toFixed(3)})`
  }
}
