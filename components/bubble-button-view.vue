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
    }
  },
  emits: ['click'],
  data(): any {
    return {
      random: Math.random(),
      play: true,
      path: [],
      pathString: '0,0',
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
    this.loop(() => this.animate(), () => this.fps, () => this.play)
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
    loop(func: Function): void {
      setTimeout(() => {
        if (func() != false) {
          this.loop(func)
        }
      }, 1000 / 40)
    },
    animate(): void {
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

        for (let j = 0; j < 1; j+=stepBetweenSpots) {
          distances.push(front * (1 - j) + rear * j)
        }
      }
      
      const path = []
      for (let i = 0; i < distances.length; i++) {
        const radian = i / distances.length * Math.PI * 2
        const distance = distances[i] || 0
        
        const x = Math.cos(radian) * distance + this.size * 0.5
        const y = Math.sin(radian) * distance + this.size * 0.5

        path.push([x, y])
      }
      path.push(path[0])

      this.path = path
      this.pathString = path.map((p: any) => `${p[0]},${p[1]}`).join(' ')
    },
    onClick(): void {
      this.$emit('click')
    },
  },
}
</script>

<template>
  <button class="button" style="overflow: hidden;" @click="onClick">
    <svg xmlns="http://www.w3.org/2000/svg" :width="size" :height="size">
      <polyline class="shape" :points="pathString" />
      <!-- <rect v-for="(p, i) in path" :key="i" :x="p[0]" :y="p[1]" width="2" height="2" style="stroke: none; fill: red;" /> -->
      Sorry, your browser does not support inline SVG.
    </svg>
    <div class="content">
      <div>
        <slot />
      </div>
    </div>
  </button>
</template>

<style scoped>
button.button {
  position: relative;
  margin: 0px;
  padding: 0px;
  border: none;
  background: none;
  outline: none;
  cursor: pointer;
}
button.button .shape {
  fill: rgb(64, 196, 165);
  stroke: rgb(240, 240, 240);
  stroke-width: 1px;
  transition-property: fill, stroke;
  transition-duration: 0.2s;
  transition-timing-function: linear;
}
button.button:hover .shape {
  fill: rgb(38, 171, 140);
  stroke: rgb(0, 255, 255);
}
button.button:focus .shape {
  fill: rgb(22, 170, 142);
  stroke: rgb(255, 200, 0);
}
button.button:active .shape {
  fill: rgb(64, 196, 165);
  stroke: rgb(255, 200, 0);
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
