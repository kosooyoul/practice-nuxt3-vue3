<script lang="ts">
class MapChara {
  name: string
  centerPixelX: number
  centerPixelY: number
  pixelLeft: number
  pixelRight: number
  pixelTop: number
  pixelBottom: number
  pixelWidth: number
  pixelHeight: number

  movingAcceleration = 0 // Acceleration per tick
  maxMovingAcceleration = 6 // Max acceleration per tick
  turningAcceleration = 0 // Acceleration turn per tick
  maxTurningAcceleration = 0.04 // Max acceleration turn per tick

  radian = 0

  static fromWithPositionAndSize(name: string, position: { x: number; y: number }, size: { width: number; height: number }): MapChara {
    const chara = new MapChara()
    chara.name = name
    chara.centerPixelX = position.x
    chara.centerPixelY = position.y
    chara.pixelLeft = position.x - size.width * 0.5
    chara.pixelRight = position.x + size.width * 0.5
    chara.pixelTop = position.y - size.height * 0.5
    chara.pixelBottom = position.y + size.height * 0.5
    chara.pixelWidth = size.width
    chara.pixelHeight = size.height
    return chara
  }

  accelerateFront() {
    if (this.movingAcceleration < 0)
      this.movingAcceleration = this.movingAcceleration * 0.8 + 0.4
    else
      this.movingAcceleration = Math.min(this.movingAcceleration + 0.4, this.maxMovingAcceleration)
  }

  accelerateBack() {
    if (this.movingAcceleration > 0)
      this.movingAcceleration = this.movingAcceleration * 0.8 - 0.4
    else
      this.movingAcceleration = Math.max(this.movingAcceleration - 0.4, -this.maxMovingAcceleration)
  }

  accelerateTurnRight() {
    if (this.turningAcceleration < 0)
      this.turningAcceleration = this.turningAcceleration * 0.8 + 0.01
    else
      this.turningAcceleration = Math.min(this.turningAcceleration + 0.01, this.maxTurningAcceleration)
  }

  accelerateTurnLeft() {
    if (this.turningAcceleration > 0)
      this.turningAcceleration = this.turningAcceleration * 0.8 - 0.01
    else
      this.turningAcceleration = Math.max(this.turningAcceleration - 0.01, -this.maxTurningAcceleration)
  }

  deaccelerateMoving() {
    this.movingAcceleration *= 0.8
    if (Math.abs(this.movingAcceleration) < 0.001)
      this.movingAcceleration = 0
  }

  deaccelerateTurning() {
    this.turningAcceleration *= 0.8
    if (Math.abs(this.turningAcceleration) < 0.001)
      this.turningAcceleration = 0
  }

  move(area: MapArea) {
    let newPixelLeft = this.pixelLeft + Math.cos(this.radian) * this.movingAcceleration
    let newPixelTop = this.pixelTop + Math.sin(this.radian) * this.movingAcceleration

    // Check Map Boundary
    if (newPixelLeft < 0)
      newPixelLeft = 0
    else if (newPixelLeft + this.pixelWidth > area.pw)
      newPixelLeft = area.pw - this.pixelWidth

    if (newPixelTop < 0)
      newPixelTop = 0
    else if (newPixelTop + this.pixelHeight > area.ph)
      newPixelTop = area.ph - this.pixelHeight

    // Check Props Boundary
    area.props.forEach((prop) => {
      const isInAxisX = Math.round(newPixelLeft) + this.pixelWidth > prop.pixelLeft && Math.round(newPixelLeft) < prop.pixelRight
      const isInAxisY = Math.round(newPixelTop) + this.pixelHeight > prop.pixelTop && Math.round(newPixelTop) < prop.pixelBottom

      const isCrossedFromLeft = this.pixelLeft + this.pixelWidth <= prop.pixelLeft && newPixelLeft + this.pixelWidth > prop.pixelLeft
      const isCrossedFromRight = this.pixelLeft >= prop.pixelRight && newPixelLeft < prop.pixelRight
      const isCrossedFromTop = this.pixelTop + this.pixelHeight <= prop.pixelTop && newPixelTop + this.pixelHeight > prop.pixelTop
      const isCrossedFromBottom = this.pixelTop >= prop.pixelBottom && newPixelTop < prop.pixelBottom

      if (isInAxisX && isCrossedFromTop) {
        newPixelTop = prop.pixelTop - this.pixelHeight
      }
      else if (isInAxisX && isCrossedFromBottom) {
        newPixelTop = prop.pixelBottom
      }
      else if (isInAxisY && isCrossedFromLeft) {
        newPixelLeft = prop.pixelLeft - this.pixelWidth
      }
      else if (isInAxisY && isCrossedFromRight) {
        newPixelLeft = prop.pixelRight
      }
      else if (isInAxisX && isInAxisY) {
        if (newPixelLeft < prop.pixelLeft)
          newPixelLeft = prop.pixelLeft - this.pixelWidth
        else
          newPixelLeft = prop.pixelRight

        if (newPixelTop < prop.pixelTop)
          newPixelTop = prop.pixelTop - this.pixelHeight
        else
          newPixelTop = prop.pixelBottom
      }
    })

    this.pixelLeft = newPixelLeft
    this.pixelTop = newPixelTop
    this.pixelRight = this.pixelLeft + this.pixelWidth
    this.pixelBottom = this.pixelTop + this.pixelHeight
    this.centerPixelX = (this.pixelLeft + this.pixelRight) * 0.5
    this.centerPixelY = (this.pixelTop + this.pixelBottom) * 0.5

    this.radian += this.turningAcceleration
  }

  act(area: MapArea) {
    area.addDust(new MapDust(this.centerPixelX + 25, this.centerPixelY + 25, this.radian))
  }

  render(context: CanvasRenderingContext2D) {
    context.fillStyle = 'black'
    context.translate(this.centerPixelX, this.centerPixelY)
    context.rotate(this.radian)
    context.fillRect(-this.pixelWidth * 0.5, -this.pixelHeight * 0.5, this.pixelWidth, this.pixelHeight)
    context.fillRect(30, -15, 10, 30)
  }
}

class MapDust {
  px: number // Pixel x
  py: number // Pixel x
  pl: number // Pixel left
  pr: number // Pixel right
  pt: number // Pixel top
  pb: number // Pixel bottom
  pw: number // Pixel width
  ph: number // Pixel height
  radian: number
  a: number // Acceleration
  ma: number // Max acceleration
  rotation: number // Rotation

  constructor(px: number, py: number, radian: number) {
    const size = 20
    this.px = px
    this.py = py
    this.pl = px - size * 0.5
    this.pr = px + size * 0.5
    this.pt = py - size * 0.5
    this.pb = py + size * 0.5
    this.pw = size
    this.ph = size
    this.radian = radian
    this.a = 100
    this.ma = 40
    this.rotation = Math.random() * 360
  }
}

class MapProp {
  name: string
  centerPixelX: number
  centerPixelY: number
  pixelLeft: number
  pixelRight: number
  pixelTop: number
  pixelBottom: number
  pixelWidth: number
  pixelHeight: number
  actions: any[]

  render(context: CanvasRenderingContext2D) {
    context.fillStyle = this.name
    context.fillRect(this.pixelLeft, this.pixelTop, this.pixelWidth, this.pixelHeight)
  }

  static fromWithBoundary(name: string, boundary: { left: number; right: number; top: number; bottom: number }, actions: any[]): MapProp {
    const prop = new MapProp()
    prop.name = name
    prop.centerPixelX = (boundary.left + boundary.right) * 0.5
    prop.centerPixelY = (boundary.top + boundary.bottom) * 0.5
    prop.pixelLeft = boundary.left
    prop.pixelRight = boundary.right
    prop.pixelTop = boundary.top
    prop.pixelBottom = boundary.bottom
    prop.pixelWidth = boundary.right - boundary.left
    prop.pixelHeight = boundary.bottom - boundary.top
    prop.actions = actions
    return prop
  }

  static fromWithPositionAndSize(name: string, position: { x: number; y: number }, size: { width: number; height: number }, actions: any[]): MapProp {
    const prop = new MapProp()
    prop.name = name
    prop.centerPixelX = position.x
    prop.centerPixelY = position.y
    prop.pixelLeft = position.x - size.width * 0.5
    prop.pixelRight = position.x + size.width * 0.5
    prop.pixelTop = position.y - size.height * 0.5
    prop.pixelBottom = position.y + size.height * 0.5
    prop.pixelWidth = size.width
    prop.pixelHeight = size.height
    prop.actions = actions
    return prop
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

  props: MapProp[]

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
      this.props.push(MapProp.fromWithPositionAndSize(prop.name, { x: prop.px, y: prop.py }, { width: prop.pw, height: prop.ph }, prop.actions))
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
      this.actor.accelerateTurnLeft() // this.actor.accelerateLeft()
    else if (this.controller.right)
      this.actor.accelerateTurnRight() // this.actor.accelerateRight()
    else
      this.actor.deaccelerateTurning()

    if (this.controller.up)
      this.actor.accelerateFront() // this.actor.accelerateUp()
    else if (this.controller.down)
      this.actor.accelerateBack() // this.actor.accelerateDown()
    else
      this.actor.deaccelerateMoving()

    this.actor.move(this.area)

    this.area.updateCameraPosition(this.actor.centerPixelX, this.actor.centerPixelY)

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
    this.area.props.forEach(prop => prop.render(context))

    // Render Chara
    context.save()
    this.actor.render(context)
    context.restore()

    this.area.dusts.forEach((dust) => {
      context.strokeStyle = 'gray'
      context.save()
      context.translate(dust.px, dust.py)
      context.rotate(dust.rotation / 180 * Math.PI)
      context.strokeRect(-dust.pw * 0.5, -dust.ph * 0.5, dust.pw, dust.ph)
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

    const chara = MapChara.fromWithPositionAndSize('test', { x: 0, y: 0 }, { width: 50, height: 50 })
    const area = new MapArea(20, 20)
    const controller = new MapKeyboardController()

    const renderer = new MapRenderer()
    renderer.setArea(area)
    renderer.setActor(chara)
    renderer.setController(controller)

    area.addProps([
      { name: 'red', px: 4 * 50, py: 4 * 50, pw: 50, ph: 50, actions: ['Hello? This is red!'] },
      { name: 'red', px: 220, py: 10 * 50, pw: 10, ph: 240, actions: ['Hello? This is red!'] },
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
