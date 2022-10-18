<script lang="ts">
class MapChara {
  static LEFT = 1
  static RIGHT = 2
  static UP = 4
  static DOWN = 8

  px = 0 // Pixel x
  py = 0 // Pixel y
  npx = 0 // New pixel x
  npy = 0 // New pixel y
  acc = 0.4 // Acceleration increment x, y per tick
  ax = 0 // Acceleration x per tick
  ay = 0 // Acceleration y per tick
  max = 10 // Max acceleration x per tick
  may = 10 // Max acceleration y per tick

  radian = 0

  accelerateLeft() {
    this.ax = this.ax > 0 ? (this.ax * 0.8 - this.acc) : Math.max(this.ax - this.acc, -this.max)
  }

  accelerateRight() {
    this.ax = this.ax < 0 ? (this.ax * 0.8 + this.acc) : Math.min(this.ax + this.acc, this.max)
  }

  accelerateUp() {
    this.ay = this.ay > 0 ? (this.ay * 0.8 - this.acc) : Math.max(this.ay - this.acc, -this.may)
  }

  accelerateDown() {
    this.ay = this.ay < 0 ? (this.ay * 0.8 + this.acc) : Math.min(this.ay + this.acc, this.may)
  }

  deaccelerateAxisX() {
    this.ax *= 0.8
    if (Math.abs(this.ax) < 0.001)
      this.ax = 0
  }

  deaccelerateAxisY() {
    this.ay *= 0.8
    if (Math.abs(this.ay) < 0.001)
      this.ay = 0
  }

  reflectAxisX() {
    this.ax = -this.ax * 0.5
  }

  reflectAxisY() {
    this.ay = -this.ay * 0.5
  }

  move(area: MapArea) {
    this.npx += this.ax
    this.npy += this.ay

    // Check Map Boundary
    if (this.npx < 0) {
      this.npx = 0
      this.reflectAxisX()
    }
    else if (this.npx + MapArea.CHARA_SIZE > area.pw) {
      this.npx = area.pw - MapArea.CHARA_SIZE
      this.reflectAxisX()
    }
    if (this.npy < 0) {
      this.npy = 0
      this.reflectAxisY()
    }
    else if (this.npy + MapArea.CHARA_SIZE > area.ph) {
      this.npy = area.ph - MapArea.CHARA_SIZE
      this.reflectAxisY()
    }

    // Check Props Boundary
    area.props.forEach((prop) => {
      const inNewX = Math.round(this.npx) + MapArea.CHARA_SIZE > prop.pl && Math.round(this.npx) < prop.pr
      const inNewY = Math.round(this.npy) + MapArea.CHARA_SIZE > prop.pt && Math.round(this.npy) < prop.pb

      const topIn = this.py + MapArea.CHARA_SIZE <= prop.pt && this.npy + MapArea.CHARA_SIZE > prop.pt
      const bottomIn = this.py >= prop.pb && this.npy < prop.pb

      const leftIn = this.px + MapArea.CHARA_SIZE <= prop.pl && this.npx + MapArea.CHARA_SIZE > prop.pl
      const rightIn = this.px >= prop.pr && this.npx < prop.pr

      if (inNewX && topIn) {
        this.npy = prop.pt - MapArea.CHARA_SIZE
        this.reflectAxisY()
      }
      else if (inNewX && bottomIn) {
        this.npy = prop.pb
        this.reflectAxisY()
      }
      else if (inNewY && leftIn) {
        this.npx = prop.pl - MapArea.CHARA_SIZE
        this.reflectAxisX()
      }
      else if (inNewY && rightIn) {
        this.npx = prop.pr
        this.reflectAxisX()
      }
      else if (inNewX && inNewY) {
        if (this.npx < prop.px) {
          this.npx = prop.pl - MapArea.CHARA_SIZE
          this.reflectAxisX()
        }
        else {
          this.npx = prop.pr
          this.reflectAxisX()
        }
        if (this.npy < prop.py) {
          this.npy = prop.pt - MapArea.CHARA_SIZE
          this.reflectAxisY()
        }
        else {
          this.npy = prop.pb
          this.reflectAxisY()
        }
      }
    })

    this.px = this.npx
    this.py = this.npy

    if (this.ay !== 0 || this.ax !== 0)
      this.radian = Math.atan2(this.ay, this.ax)
  }

  act(area: MapArea) {
    area.addDust(new MapDust(this.px, this.py, this.radian))
  }
}

class MapDust {
  px: number // Pixel x
  py: number // Pixel x
  radian: number
  a: number // Acceleration
  ma: number // Max acceleration
  rotation: number // Rotation

  constructor(px: number, py: number, radian: number) {
    this.px = px
    this.py = py
    this.radian = radian
    this.a = 100
    this.ma = 40
    this.rotation = Math.random() * 360
  }
}

class MapArea {
  static CHARA_SIZE = 50
  static CELL_SIZE = 50

  mw: number // Map width, cell count of width, ex; 100
  mh: number // Map height, cell count of height, ex; 100

  opx = 0 // Camera offset pixel x, ex; 0
  opy = 0 // Camera offset pixel y, ex; 0
  topx = 0 // Target camera offset pixel x, ex; 0
  topy = 0 // Target camera offset pixel y, ex; 0

  bpl = 0 // Camera boundary pixel left, ex; -100
  bpr = 0 // Camera boundary pixel right, ex; 100
  bpt = 0 // Camera boundary pixel top, ex; -100
  bpb = 0 // Camera boundary pixel bottom, ex; 100

  pw: number // Map pixel width, ex; 100 * 5
  ph: number // Map pixel height, ex; 100 * 5

  props: {
    name: string
    px: number
    py: number
    pl: number
    pr: number
    pt: number
    pb: number
    pw: number
    ph: number
    actions: any[]
  }[]

  dusts: MapDust[] = []

  constructor(mw: number, mh: number) {
    this.mw = mw
    this.mh = mh

    this.pw = mw * MapArea.CELL_SIZE
    this.ph = mh * MapArea.CELL_SIZE

    this.props = []
  }

  setCamera(px: number, ph: number) {
    this.bpl = px * 0.5 - 80
    this.bpr = px * 0.5 + 80
    this.bpt = ph * 0.5 - 60
    this.bpb = ph * 0.5 + 60
  }

  updateCameraPosition(px: number, py: number) {
    if (px + this.topx + MapArea.CELL_SIZE > this.bpr)
      this.topx += this.bpr - px - this.topx - MapArea.CELL_SIZE
    else if (px + this.topx < this.bpl)
      this.topx += this.bpl - px - this.topx

    if (py + this.topy + MapArea.CELL_SIZE > this.bpb)
      this.topy += this.bpb - py - this.topy - MapArea.CELL_SIZE
    else if (py + this.topy < this.bpt)
      this.topy += this.bpt - py - this.topy

    this.opx += (this.topx - this.opx) * 0.2
    this.opy += (this.topy - this.opy) * 0.2
  }

  addProps(props: { name: string; px: number; py: number; pw: number; ph: number; actions: any[] }[]) {
    props.forEach((prop) => {
      this.props.push({
        name: prop.name,
        px: prop.px,
        py: prop.py,
        pl: prop.px - prop.pw * 0.5,
        pr: prop.px + prop.pw * 0.5,
        pt: prop.py - prop.ph * 0.5,
        pb: prop.py + prop.ph * 0.5,
        pw: prop.pw,
        ph: prop.ph,
        actions: prop.actions,
      })
    })
  }

  findProp() {
    // TODO
    return this.props[0]
  }

  addDust(dust: MapDust) {
    this.dusts.push(dust)
  }

  computeDusts() {
    this.dusts.forEach((dust) => {
      const d = Math.min(dust.a, dust.ma)
      dust.px += Math.cos(dust.radian) * d
      dust.py += Math.sin(dust.radian) * d

      dust.rotation += Math.min(dust.a, dust.ma)

      dust.a *= 0.8
    })
  }
}

class MapKeyboardController {
  private keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    action: false,
  }

  get left() { return this.keys.left }
  get right() { return this.keys.right }
  get up() { return this.keys.up }
  get down() { return this.keys.down }
  get action() { return this.keys.action }

  setKeyEnabled(keyCode: string, flag: boolean): boolean {
    if (keyCode === 'ArrowLeft')
      this.setLeftKeyEnabled(flag)
    else if (keyCode === 'ArrowRight')
      this.setRightKeyEnabled(flag)
    else if (keyCode === 'ArrowUp')
      this.setUpKeyEnabled(flag)
    else if (keyCode === 'ArrowDown')
      this.setDownKeyEnabled(flag)
    else if (keyCode === 'KeyZ')
      this.setActionKeyEnabled(flag)
    else
      return false
    return true
  }

  setLeftKeyEnabled(flag: boolean) {
    this.keys.right &&= !flag
    this.keys.left = flag
  }

  setRightKeyEnabled(flag: boolean) {
    this.keys.left &&= !flag
    this.keys.right = flag
  }

  setUpKeyEnabled(flag: boolean) {
    this.keys.down &&= !flag
    this.keys.up = flag
  }

  setDownKeyEnabled(flag: boolean) {
    this.keys.up &&= !flag
    this.keys.down = flag
  }

  setActionKeyEnabled(flag: boolean) {
    this.keys.action = flag
  }
}

class MapRenderer {
  private actor: MapChara
  private area: MapArea
  private controller: MapKeyboardController

  private status = {
    isPlay: false,
  }

  setActor(actor: MapChara) { this.actor = actor }
  setArea(area: MapArea) { this.area = area }
  setController(controller: MapKeyboardController) { this.controller = controller }

  play() { this.status.isPlay = true }
  stop() { this.status.isPlay = false }

  animate(canvas: HTMLCanvasElement): void {
    if (this.status.isPlay)
      return

    this.status.isPlay = true

    const context = canvas.getContext('2d')

    const nextFrame = () => {
      this.compute(canvas.width, canvas.height)
      this.render(context, canvas.width, canvas.height)

      if (this.status.isPlay)
        requestAnimationFrame(() => nextFrame())
    }

    nextFrame()
  }

  private compute(width: number, height: number): void {
    this.area.setCamera(width, height)

    // Compute Chara Position by Keys
    if (this.controller.left)
      this.actor.accelerateLeft()
    else if (this.controller.right)
      this.actor.accelerateRight()
    else
      this.actor.deaccelerateAxisX()

    if (this.controller.up)
      this.actor.accelerateUp()
    else if (this.controller.down)
      this.actor.accelerateDown()
    else
      this.actor.deaccelerateAxisY()

    this.actor.move(this.area)

    this.area.updateCameraPosition(this.actor.px, this.actor.py)

    if (this.controller.action)
      this.actor.act(this.area)

    this.area.computeDusts()
  }

  private render(context: CanvasRenderingContext2D, width: number, height: number): void {
    context.clearRect(0, 0, width, height)

    context.save()
    context.translate(this.area.opx, this.area.opy)

    // Render Map
    for (let mx = 0; mx < this.area.mw; mx++) {
      for (let my = 0; my < this.area.mh; my++) {
        context.fillStyle = ((mx + my) % 2) ? 'white' : 'lightgray'
        context.fillRect(50 * mx, 50 * my, 50, 50)
      }
    }

    // Render Props
    this.area.props.forEach((prop) => {
      context.fillStyle = prop.name
      context.fillRect(prop.pl, prop.pt, prop.pw, prop.ph)
    })

    // Render Chara
    context.save()
    context.fillStyle = 'black'
    context.translate(this.actor.px + 25, this.actor.py + 25)
    context.rotate(this.actor.radian * 180 / Math.PI)
    context.fillRect(-25, -25, 50, 50)
    context.fillRect(25, -5, 10, 10)
    context.restore()

    this.area.dusts.forEach((dust) => {
      context.strokeStyle = 'gray'
      context.save()
      context.translate(dust.px + 25, dust.py + 25)
      context.rotate(dust.rotation)
      context.strokeRect(-25, -25, 50, 50)
      context.restore()
    })

    context.restore()
  }
}

export default {
  name: 'MapView',
  props: {
    width: {
      type: Number,
      required: false,
    },
    height: {
      type: Number,
      required: false,
    },
  },
  setup(props: any) {
    const canvas: { value: HTMLCanvasElement | null } = ref(null)

    const chara = new MapChara()
    const area = new MapArea(100, 100)
    const controller = new MapKeyboardController()

    const renderer = new MapRenderer()
    renderer.setArea(area)
    renderer.setActor(chara)
    renderer.setController(controller)

    area.addProps([
      { name: 'red', px: 4 * 50, py: 4 * 50, pw: 50, ph: 50, actions: ['Hello? This is red!'] },
      { name: 'yellow', px: 6 * 50, py: 8 * 50, pw: 50, ph: 50, actions: ['Hello? This is yellow!'] },
      { name: 'cyan', px: 7 * 50, py: 2 * 50, pw: 50, ph: 50, actions: ['Hello? This is cyan!'] },
      { name: 'cyan', px: 10 * 50, py: 20 * 50, pw: 500, ph: 500, actions: ['Hello? This is cyan!'] },
      { name: 'brown', px: 10 * 50, py: 3 * 50, pw: 50, ph: 50, actions: ['Hello? This is brown!'] },
      { name: 'green', px: 14 * 50, py: 4 * 50, pw: 50, ph: 50, actions: ['Hello? This is green!'] },
      { name: 'green', px: 14 * 50, py: 5 * 50, pw: 50, ph: 50, actions: ['Hello? This is green!'] },
      { name: 'green', px: 14 * 50, py: 6 * 50, pw: 50, ph: 50, actions: ['Hello? This is green!'] },
      { name: 'green', px: 14 * 50, py: 7 * 50, pw: 50, ph: 50, actions: ['Hello? This is green!'] },
      { name: 'green', px: 15 * 50, py: 7 * 50, pw: 50, ph: 50, actions: ['Hello? This is green!'] },
      { name: 'green', px: 16 * 50, py: 7 * 50, pw: 50, ph: 50, actions: ['Hello? This is green!'] },
      { name: 'green', px: 17 * 50, py: 7 * 50, pw: 50, ph: 50, actions: ['Hello? This is green!'] },
      { name: 'green', px: 18 * 50, py: 7 * 50, pw: 50, ph: 50, actions: ['Hello? This is green!'] },
      { name: 'green', px: 23 * 50, py: 7 * 50, pw: 200, ph: 50, actions: ['Hello? This is green!'] },
      { name: 'green', px: 40 * 50, py: 30 * 50, pw: 500, ph: 50, actions: ['Hello? This is green!'] },
    ])

    onMounted(() => {
      canvas.value.width = props.width || canvas.value.clientWidth
      canvas.value.height = props.height || canvas.value.clientHeight

      renderer.animate(canvas.value)
    })

    onUnmounted(() => {
      renderer.stop()
    })

    const onKeyDown = (e: KeyboardEvent) => {
      if (controller.setKeyEnabled(e.code, true))
        e.preventDefault()
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (controller.setKeyEnabled(e.code, false))
        e.preventDefault()
    }

    return {
      canvas,
      onKeyDown,
      onKeyUp,
    }
  },
}
</script>

<template>
  <canvas
    ref="canvas"
    tabindex="0"
    @keydown="onKeyDown"
    @keyup="onKeyUp"
  />
</template>
