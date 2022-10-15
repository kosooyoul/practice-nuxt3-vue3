<script setup lang="ts">
</script>

<script lang="ts">
export default {
  name: 'BubbleButtonView',
  props: {
    title: {
      type: String,
      required: false,
      default: '',
    },
    size: {
      type: Number,
      required: false,
      default: 100,
    },
    vibration: {
      type: Number,
      required: false,
      default: 1.5,
    },
    spots: {
      type: Number,
      required: false,
      default: 8,
    },
    variance: {
      type: Number,
      required: false,
      default: 3,
    },
    varianceRatio: {
      type: Number,
      required: false,
      default: 0.4,
    },
  },
  emits: ['click'],
  data(): any {
    return {
      random: Math.random(),
      play: true,
      pathString: '0,0',
      bubbles: [],
    }
  },
  computed: {

  },
  watch: {
    title(_title: string): void {
      this.log('watch/title: 속성 갱신됨')
    },
  },
  created(): void {
  },
  mounted(): void {
    this.loop(() => this.animate())
  },
  updated(): void {
  },
  unmounted(): void {
    this.play = false
  },
  methods: {
    log(...args: any[]): void {
      // eslint-disable-next-line no-console
      console.log.apply(null, args)
    },
    loop(func: () => boolean): void {
      requestAnimationFrame(() => {
        if (func() !== false)
          this.loop(func)
      })
    },
    animate(): boolean {
      const time = (Date.now() / 2 + this.random * 1000) % 360

      const spots = []
      for (let i = 0; i < this.spots; i++) {
        const distance = Math.sin((time + (i % this.variance) * 180 * this.varianceRatio) / 180 * Math.PI) * this.vibration + this.size * 0.5 - this.vibration
        spots.push(distance)
      }
      spots.push(spots[0])

      const stepBetweenSpots = 0.2
      const distances = []
      for (let i = 0; i < spots.length - 1; i++) {
        const front = spots[i]
        const rear = spots[i + 1]

        for (let j = 0; j < 1; j += stepBetweenSpots)
          distances.push(front * (1 - j) + rear * j)
      }

      const path = []
      for (let i = 0; i < distances.length; i++) {
        const radian = i / distances.length * Math.PI * 2
        const distance = distances[i] || 0

        const x = Math.cos(radian) * distance + this.size * 0.5
        const y = Math.sin(radian) * distance + this.size * 0.5

        path.push([x, y])
      }

      this.pathString = path.map((p: any) => `${p[0]},${p[1]}`).join(' ')

      let bubble: any = null
      for (let i = this.bubbles.length - 1; i >= 0; i--) {
        bubble = this.bubbles[i]

        if (bubble.speed < 0.05) {
          this.bubbles.splice(i, 1)
          continue
        }

        bubble.distance += bubble.speed
        bubble.speed *= 0.85
        bubble.r *= 0.95

        bubble.cx = Math.cos(bubble.radian) * bubble.distance + this.size * 0.5
        bubble.cy = Math.sin(bubble.radian) * bubble.distance + this.size * 0.5
      }

      return this.play
    },
    onClick(): void {
      this.$emit('click')

      for (let i = 0; i < 10; i++) {
        this.bubbles.push({
          radian: Math.random() * Math.PI * 2,
          speed: Math.random() * 5 + 5,
          distance: this.size * 0.25,
          r: (Math.random() * 0.5 + 0.5) * this.size * 0.1,
          cx: this.size * 0.5,
          cy: this.size * 0.5,
        })
      }
      this.bubbles.splice(0, this.bubbles.length - 60)
    },
  },
}
</script>

<template>
  <button class="button" :style="{ width: `${size}px`, height: `${size}px` }" @click="onClick">
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" :width="size" :height="size">
        <g filter="url(/svg/bubble-filter.svg#filter)">
          <polyline class="center" :points="pathString" />
          <circle v-for="(bubble, i) in bubbles" :key="i" :cx="bubble.cx" :cy="bubble.cy" :r="bubble.r" />
          Sorry, your browser does not support inline SVG.
        </g>
      </svg>
      <div class="content">
        <div>
          <slot />
        </div>
      </div>
    </div>
  </button>
</template>

<style scoped>
button.button {
  padding: 0px;
  border: none;
  background: none;
  cursor: pointer;
}
button.button>div {
  position: relative;
}
button.button svg {
  /* position: absolute; */
  overflow: visible;
  pointer-events: none;
}
button.button svg * {
  fill: rgb(80, 180, 200);
  transition-property: fill;
  transition-duration: 0.2s;
  transition-timing-function: linear;
}
button.button:hover svg * {
  fill: rgb(40, 212, 232);
}
button.button:focus svg * {
  fill: rgb(40, 212, 232);
}
button.button:active svg * {
  fill: rgb(40, 216, 192);
}
button.button svg .center {
  transition-property: fill, transform;
  transform-origin: center;
}
button.button:active svg .center {
  transform: scale(0.9);
}
button.button .content {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  color: white;
  font-size: 14px;
}
</style>
