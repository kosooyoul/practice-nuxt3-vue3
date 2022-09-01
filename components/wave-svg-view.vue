<script setup lang="ts">
</script>

<script lang="ts">
class Drop {
  vx: number
  vy: number
  speed: number
  minvy: number
  maxvy: number
  splashed: boolean
  x: number
  y: number

  constructor(x: number, y: number) {
    this.vx = 0
    this.vy = 8
    this.speed = 1
    this.minvy = 4
    this.maxvy = 18
    this.splashed = false
    this.x = x
    this.y = y
  }
}

class Particle {
  x: number
  y: number
  vx: number
  vy: number
  gy: number
  r: number
  color: string

  constructor(r: number, x: number, y: number, vx: number, vy: number) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.gy = 0.5
    this.r = r
    this.color = '#1c6ba0'
  }
}

const WAVE_FREQ = 10
const WAV_PASS = 5
const SPREAD = 0.4
const DAMP = 0.01
const TENSION = 0.01
const SPEED = 1

export default {
  name: 'WaveSvgView',
  props: {
    size: {
      type: Number,
      default: 400,
    },
    rainSize: {
      type: Number,
      default: 10,
    },
    rainFreq: {
      type: Number,
      default: 0.1,
    },
    dropColor: {
      type: String,
      default: 'white',
    },
    bgColor: {
      type: String,
      default: 'black',
    },
    fps: {
      type: Number,
      default: 40,
    },
    enableSplash: {
      type: Boolean,
      default: true,
    },
  },
  data(): any {
    return {
      root: null,
      width: 0,
      height: 0,
      waveCount: 0,
      surfaceStartY: 0,
      surfaceEndY: 0,
      surfaceHeight: 0,
      springs: [],
      drops: [],
      particles: [],
      play: true,
      pathString: '0,0',
    }
  },
  computed: {

  },
  watch: {

  },
  created(): void {
    this.log('created: 뷰 라이프사이클, 돔이 그려지기 직전')
  },
  mounted(): void {
    this.log('mounted: 뷰 라이프사이클, 돔까지 그려진 상태')

    this.root = this.$el as HTMLElement
    this.width = this.root.clientWidth
    this.height = this.root.clientHeight
    this.pathString = `0,${this.height} 0,${this.height * 0.5} ${this.width},${this.height * 0.5} ${this.width},${this.height}`

    this.surfaceStartY = this.height * 0.5
    this.surfaceEndY = this.height
    this.surfaceHeight = this.surfaceEndY - this.surfaceStartY
    this.waveCount = Math.ceil(this.width / WAVE_FREQ) + 1

    for (let i = 0; i < this.waveCount; i++) {
      const nw = {} as any
      nw.x = i * WAVE_FREQ
      nw.speed = SPEED
      nw.height = this.surfaceHeight
      nw.surfaceHeight = this.surfaceHeight
      nw.update = function () {
        const x = this.surfaceHeight - this.height
        this.speed += TENSION * x - this.speed * DAMP
        this.height += this.speed
      }
      this.springs[i] = nw
    }

    this.loop(() => this.animate(), () => this.fps, () => this.play)
    this.loop(() => this.drop(), () => this.rainFreq * this.fps, () => this.play)
  },
  updated(): void {
    this.log('updated: 뷰 라이프사이클, 데이터가 변경되고 돔이 다시 그려진 상태')
  },
  unmounted(): void {
    this.log('unmounted: 뷰 라이프사이클, 돔이 제거되는 상태')
    this.play = false
  },
  methods: {
    log(...args: any[]): void {
      // eslint-disable-next-line no-console
      console.log.apply(null, args)
    },
    loop(func: Function, fpsFunc: Function, playFunc: Function): void {
      if (playFunc()) {
        setTimeout(() => {
          func()
          this.loop(func, fpsFunc, playFunc)
        }, 1000 / fpsFunc())
      }
    },
    reload(): void {
      const springs = this.springs

      this.surfaceStartY = this.height * 0.5
      this.surfaceEndY = this.height
      this.surfaceHeight = this.surfaceEndY - this.surfaceStartY
      this.waveCount = Math.ceil(this.width / WAVE_FREQ) + 1

      for (let i = 0; i < this.waveCount; i++) {
        if (springs[i]) {
          const nw = springs[i]
          nw.surfaceHeight = this.surfaceHeight
          continue
        }

        const nw = {} as any
        nw.x = i * WAVE_FREQ
        nw.speed = SPEED
        nw.height = this.surfaceHeight
        nw.surfaceHeight = this.surfaceHeight
        nw.update = function () {
          const x = this.surfaceHeight - this.height
          this.speed += TENSION * x - this.speed * DAMP
          this.height += this.speed
        }

        springs[i] = nw
      }
      springs.length = this.waveCount
    },
    drop(): void {
      const drops = this.drops
      const x = Math.random() * this.width
      const y = 0
      drops[drops.length] = new Drop(x, y)
    },
    animate(): void {
      this.update()
      // this.draw()
    },
    update(): void {
      if (this.width !== this.root.clientWidth || this.height !== this.root.clientHeight) {
        this.width = this.root.clientWidth
        this.height = this.root.clientHeight

        this.reload()
      }

      this.updateWater()
      this.updateDrops()
      this.updateParticles()

      this.collide()

      this.pathString = `0,${this.height} ${this.springs.map((spring: any) => `${spring.x},${spring.height}`).join(' ')} ${this.width},${this.height}`
    },
    updateParticles(): void {
      const particles = this.particles
      for (let i = 0; i < particles.length; i++) {
        const thisDrop = particles[i]
        thisDrop.x += thisDrop.vx
        thisDrop.y += thisDrop.vy
        thisDrop.vy += thisDrop.gy

        if (thisDrop.y > this.height + 200)
          particles.splice(i, 1)
      }
    },
    updateWater(): void {
      const springs = this.springs
      for (let i = 0; i < springs.length; i++)
        springs[i].update()

      const leftDeltas = []
      const rightDeltas = []

      // go through and update springs based off of their siblings
      leftDeltas.length = springs.length
      rightDeltas.length = springs.length

      // do some passes where springs pull on their neighbours
      for (let j = 0; j < WAV_PASS; j++) {
        // create arrays for springs to the left and right of each spring/column
        for (let i = 0; i < springs.length; i++) {
          if (i > 0) {
            leftDeltas[i] = SPREAD * (springs[i].height - springs[i - 1].height)
            springs[i - 1].speed += leftDeltas[i]
          }
          if (i < springs.length - 1) {
            rightDeltas[i] = SPREAD * (springs[i].height - springs[i + 1].height)
            springs[i + 1].speed += rightDeltas[i]
          }
        }

        // update the position of each spring/column based on the sibling/delta arrays
        for (let i = 0; i < springs.length; i++) {
          if (i > 0)
            springs[i - 1].height += leftDeltas[i]
          if (i < springs.length - 1)
            springs[i + 1].height += rightDeltas[i]
        }
      }
    },
    updateDrops(): void {
      for (let i = 0; i < this.drops.length; i++) {
        const thisDrop = this.drops[i]
        thisDrop.x += thisDrop.vx
        thisDrop.y += thisDrop.vy
        thisDrop.vy += thisDrop.speed

        if (thisDrop.y > this.height + 200) {
          this.drops.splice(i, 1)
        }
        else {
          if (thisDrop.vy > thisDrop.maxvy)
            thisDrop.vy = thisDrop.maxvy
          else if (thisDrop.vy < thisDrop.minvy)
            thisDrop.vy = thisDrop.minvy
        }
      }
    },
    collide(): void {
      const drops = this.drops
      const springs = this.springs
      const particles = this.particles
      for (let i = 0; i < drops.length; i++) {
        const thisDrop = drops[i]
        const realx = this.getRealX(thisDrop.x)

        const thisSpring = springs[realx]

        if (thisDrop.splashed === false) {
          if (thisSpring && (thisSpring.height <= thisDrop.y + thisDrop.vy) && (thisSpring.height >= thisDrop.y - thisDrop.vy)) {
            thisDrop.splashed = true
            thisDrop.speed = -0.5
            this.splash(realx, (thisDrop.vy ** 2) / 2)
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const thisDrop = particles[i]
        const realx = this.getRealX(thisDrop.x)

        const thisSpring = springs[realx]
        if (thisSpring) {
          if (thisSpring.height <= thisDrop.y)
            particles.splice(i, 1)
        }
      }
    },
    splash(index: number, sp: number): void {
      const springs = this.springs
      if (index >= 0 && index < springs.length) {
        springs[index].speed = sp
        if (this.enableSplash)
          this.createSplashParticles(index, sp)
      }
    },
    createSplashParticles(x: number, speed: number): void {
      const y = this.springs[x].height
      x = x * WAVE_FREQ
      if (speed > 60) {
        for (let i = 0; i < speed / 4; i++) {
          const rvx = Math.floor(Math.random() * (10)) - Math.PI
          const rvy = -Math.floor(Math.random() * Math.sqrt(speed))
          const rr = Math.random() * 1

          this.particles[this.particles.length] = new Particle(rr, x, y, rvx * 0.4, rvy * 0.4)
        }
      }
    },
    getRealX(x: number): number {
      if (x > 0)
        x = (Math.ceil(x / WAVE_FREQ) * WAVE_FREQ) / WAVE_FREQ
      else if (x < 0)
        x = (Math.floor(x / WAVE_FREQ) * WAVE_FREQ) / WAVE_FREQ

      return x
    },
  },
}
</script>

<template>
  <div style="position: relative; top: 0px; left: 0px; width: 100%; height: 100%;">
    <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height">
      <rect :width="width" :height="height" style="fill: black; stroke-width: 0; stroke: none;" />
      <polyline :points="pathString" style="fill: white; stroke: none; stroke-width: 0;" />
      Sorry, your browser does not support inline SVG.
    </svg>
  </div>
</template>

<style scoped>
</style>
