<script lang="ts">
class MapChara {
  name: string

  centerX: number
  centerY: number

  // Boundary
  left: number
  right: number
  top: number
  bottom: number

  // Size
  width: number
  height: number

  movingAcceleration = 0 // Acceleration per tick
  maxMovingAcceleration = 6 // Max acceleration per tick

  turningAcceleration = 0 // Acceleration turn per tick
  maxTurningAcceleration = 0.04 // Max acceleration turn per tick

  direction = 0

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

  compute(ground: MapGround) {
    let newLeft = this.left + Math.cos(this.direction) * this.movingAcceleration
    let newTop = this.top + Math.sin(this.direction) * this.movingAcceleration

    // Check Ground Boundary
    if (newLeft < 0)
      newLeft = 0
    else if (newLeft + this.width > ground.width)
      newLeft = ground.width - this.width

    if (newTop < 0)
      newTop = 0
    else if (newTop + this.height > ground.height)
      newTop = ground.height - this.height

    // Check Props Boundary
    ground.props.forEach((prop) => {
      const isInAxisX = Math.round(newLeft) + this.width > prop.left && Math.round(newLeft) < prop.right
      const isInAxisY = Math.round(newTop) + this.height > prop.top && Math.round(newTop) < prop.bottom

      const isCrossedFromLeft = this.left + this.width <= prop.left && newLeft + this.width > prop.left
      const isCrossedFromRight = this.left >= prop.right && newLeft < prop.right
      const isCrossedFromTop = this.top + this.height <= prop.top && newTop + this.height > prop.top
      const isCrossedFromBottom = this.top >= prop.bottom && newTop < prop.bottom

      if (isInAxisX && isCrossedFromTop) {
        newTop = prop.top - this.height
      }
      else if (isInAxisX && isCrossedFromBottom) {
        newTop = prop.bottom
      }
      else if (isInAxisY && isCrossedFromLeft) {
        newLeft = prop.left - this.width
      }
      else if (isInAxisY && isCrossedFromRight) {
        newLeft = prop.right
      }
      else if (isInAxisX && isInAxisY) {
        if (newLeft < prop.left)
          newLeft = prop.left - this.width
        else
          newLeft = prop.right

        if (newTop < prop.top)
          newTop = prop.top - this.height
        else
          newTop = prop.bottom
      }
    })

    this.left = newLeft
    this.top = newTop
    this.right = this.left + this.width
    this.bottom = this.top + this.height
    this.centerX = (this.left + this.right) * 0.5
    this.centerY = (this.top + this.bottom) * 0.5

    this.direction += this.turningAcceleration
  }

  render(context: CanvasRenderingContext2D) {
    context.fillStyle = 'black'
    context.translate(this.centerX, this.centerY)
    context.rotate(this.direction)
    context.fillRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height)
    context.fillRect(30, -15, 10, 30)
  }

  static createWithPositionAndSize(name: string, position: { x: number; y: number }, size: { width: number; height: number }): MapChara {
    const chara = new MapChara()
    chara.name = name
    chara.centerX = position.x
    chara.centerY = position.y
    chara.left = position.x - size.width * 0.5
    chara.right = position.x + size.width * 0.5
    chara.top = position.y - size.height * 0.5
    chara.bottom = position.y + size.height * 0.5
    chara.width = size.width
    chara.height = size.height
    return chara
  }
}

class MapDust {
  centerX: number
  centerY: number

  // Boundary
  left: number
  right: number
  top: number
  bottom: number

  // Size
  width: number
  height: number

  // Direction
  direction: number

  movingAcceleration = 200
  maxMovingAcceleration = 30

  spin: number

  static createWithPositionAndDirection(position: { x: number; y: number }, size: { width: number; height: number }, direction: number): MapDust {
    const dust = new MapDust()
    dust.centerX = position.x
    dust.centerY = position.y
    dust.left = position.x - size.width * 0.5
    dust.right = position.x + size.width * 0.5
    dust.top = position.y - size.height * 0.5
    dust.bottom = position.y + size.height * 0.5
    dust.width = size.width
    dust.height = size.height
    dust.direction = direction
    dust.spin = Math.random() * Math.PI
    return dust
  }

  compute(ground: MapGround) {
    const acceleration = Math.min(this.movingAcceleration, this.maxMovingAcceleration)
    let newCenterX = this.centerX + Math.cos(this.direction) * acceleration
    let newCenterY = this.centerY + Math.sin(this.direction) * acceleration

    ground.props.forEach((prop) => {
      const isInAxisX = Math.round(newCenterX) > prop.left && Math.round(newCenterX) < prop.right
      const isInAxisY = Math.round(newCenterY) > prop.top && Math.round(newCenterY) < prop.bottom

      const isCrossedFromLeft = this.centerX <= prop.left && newCenterX > prop.left
      const isCrossedFromRight = this.centerX >= prop.right && newCenterX < prop.right
      const isCrossedFromTop = this.centerY <= prop.top && newCenterY > prop.top
      const isCrossedFromBottom = this.centerY >= prop.bottom && newCenterY < prop.bottom

      if (isInAxisX && isCrossedFromTop) {
        newCenterY = prop.top
        this.direction = -this.direction
        this.movingAcceleration *= 0.2
      }
      else if (isInAxisX && isCrossedFromBottom) {
        newCenterY = prop.bottom
        this.direction = -this.direction
        this.movingAcceleration *= 0.2
      }
      else if (isInAxisY && isCrossedFromLeft) {
        newCenterX = prop.left
        this.direction = -Math.PI - this.direction
        this.movingAcceleration *= 0.2
      }
      else if (isInAxisY && isCrossedFromRight) {
        newCenterX = prop.right
        this.direction = -Math.PI - this.direction
        this.movingAcceleration *= 0.2
      }
      else if (isInAxisX && isInAxisY) {
        if (newCenterX < prop.left)
          newCenterX = prop.left
        else
          newCenterX = prop.right

        if (newCenterY < prop.top)
          newCenterY = prop.top
        else
          newCenterY = prop.bottom
      }
    })

    this.centerX = newCenterX
    this.centerY = newCenterY
    this.spin += Math.min(this.movingAcceleration, this.maxMovingAcceleration)

    this.movingAcceleration *= 0.8
  }

  render(context: CanvasRenderingContext2D) {
    context.strokeStyle = 'gray'
    context.save()
    context.translate(this.centerX, this.centerY)
    context.rotate(this.spin)
    context.strokeRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height)
    context.restore()
  }
}

class MapProp {
  name: string

  centerX: number
  centerY: number

  // Boundary
  left: number
  right: number
  top: number
  bottom: number

  // Size
  width: number
  height: number

  actions: any[]

  render(context: CanvasRenderingContext2D) {
    context.fillStyle = this.name
    context.fillRect(this.left, this.top, this.width, this.height)
  }

  static fromWithBoundary(name: string, boundary: { left: number; right: number; top: number; bottom: number }, actions: any[]): MapProp {
    const prop = new MapProp()
    prop.name = name
    prop.centerX = (boundary.left + boundary.right) * 0.5
    prop.centerY = (boundary.top + boundary.bottom) * 0.5
    prop.left = boundary.left
    prop.right = boundary.right
    prop.top = boundary.top
    prop.bottom = boundary.bottom
    prop.width = boundary.right - boundary.left
    prop.height = boundary.bottom - boundary.top
    prop.actions = actions
    return prop
  }

  static fromWithPositionAndSize(name: string, position: { x: number; y: number }, size: { width: number; height: number }, actions: any[]): MapProp {
    const prop = new MapProp()
    prop.name = name
    prop.centerX = position.x
    prop.centerY = position.y
    prop.left = position.x - size.width * 0.5
    prop.right = position.x + size.width * 0.5
    prop.top = position.y - size.height * 0.5
    prop.bottom = position.y + size.height * 0.5
    prop.width = size.width
    prop.height = size.height
    prop.actions = actions
    return prop
  }
}

class MapCamera {
  boundaryLeft: number
  boundaryRight: number
  boundaryTop: number
  boundaryBottom: number

  offsetX = 0
  offsetY = 0
  targetOffsetX = 0
  targetOffsetY = 0

  offsetFollowingFactor = 0.2

  setViewportSize(width: number, height: number) {
    this.boundaryLeft = width * 0.4
    this.boundaryRight = width * 0.6
    this.boundaryTop = height * 0.4
    this.boundaryBottom = height * 0.6
  }

  moveTo(x: number, y: number) {
    if (x + this.targetOffsetX > this.boundaryRight)
      this.targetOffsetX += this.boundaryRight - x - this.targetOffsetX
    else if (x + this.targetOffsetX < this.boundaryLeft)
      this.targetOffsetX += this.boundaryLeft - x - this.targetOffsetX

    if (y + this.targetOffsetY > this.boundaryBottom)
      this.targetOffsetY += this.boundaryBottom - y - this.targetOffsetY
    else if (y + this.targetOffsetY < this.boundaryTop)
      this.targetOffsetY += this.boundaryTop - y - this.targetOffsetY

    this.offsetX += (this.targetOffsetX - this.offsetX) * this.offsetFollowingFactor
    this.offsetY += (this.targetOffsetY - this.offsetY) * this.offsetFollowingFactor
  }
}

class MapGround {
  countOfColTiles: number // Map width, cell count of width, ex; 100
  countOfRowTiles: number // Map height, cell count of height, ex; 100
  tileSize: number

  width: number // Map pixel width, ex; 100 * 5
  height: number // Map pixel height, ex; 100 * 5

  props: MapProp[]

  constructor(countOfColTiles: number, countOfRowTiles: number, tileSize: number) {
    this.countOfColTiles = countOfColTiles
    this.countOfRowTiles = countOfRowTiles
    this.tileSize = tileSize

    this.width = countOfColTiles * tileSize
    this.height = countOfRowTiles * tileSize

    this.props = []
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
  private ground: MapGround
  private camera: MapCamera
  private dusts: MapDust[] = []
  private controller: MapKeyboardController

  private status = {
    isPlay: false,
  }

  setActor(actor: MapChara) { this.actor = actor }
  setGround(ground: MapGround) { this.ground = ground }
  setCamera(camera: MapCamera) { this.camera = camera }
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
    this.camera.setViewportSize(width, height)

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

    this.actor.compute(this.ground)

    this.camera.moveTo(this.actor.centerX, this.actor.centerY)

    if (this.controller.action)
      this.dusts.push(MapDust.createWithPositionAndDirection({ x: this.actor.centerX, y: this.actor.centerY }, { width: 10, height: 10 }, this.actor.direction))

    this.dusts.forEach(dust => dust.compute(this.ground))

    for (let i = this.dusts.length - 1; i >= 0; i--) {
      if (Math.abs(this.dusts[i].movingAcceleration) < 0.1)
        this.dusts.splice(i, 1)
    }
  }

  private render(context: CanvasRenderingContext2D, width: number, height: number): void {
    context.clearRect(0, 0, width, height)

    context.save()
    context.translate(this.camera.offsetX, this.camera.offsetY)

    // Render Map
    for (let col = 0; col < this.ground.countOfColTiles; col++) {
      for (let row = 0; row < this.ground.countOfRowTiles; row++) {
        context.fillStyle = ((col + row) % 2) ? 'white' : 'lightgray'
        context.fillRect(col * this.ground.tileSize, row * this.ground.tileSize, this.ground.tileSize, this.ground.tileSize)
      }
    }

    // Render Props
    this.ground.props.forEach(prop => prop.render(context))

    // Render Chara
    context.save()
    this.actor.render(context)
    context.restore()

    this.dusts.forEach(dust => dust.render(context))

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

    const chara = MapChara.createWithPositionAndSize('test', { x: 0, y: 0 }, { width: 50, height: 50 })
    const ground = new MapGround(20, 20, 50)
    const camera = new MapCamera()
    const controller = new MapKeyboardController()

    const renderer = new MapRenderer()
    renderer.setActor(chara)
    renderer.setGround(ground)
    renderer.setCamera(camera)
    renderer.setController(controller)

    ground.addProps([
      { name: 'red', px: 3 * 50, py: 3 * 50, pw: 140, ph: 140, actions: ['Hello? This is red!'] },
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
