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
  },
  emits: ['click'],
  data(): any {
    return {
      play: true,
      path: [[10, 20], [40, 70]],
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
      // TODO
      const d = (Date.now() / 1000) % 2
      const time = (Date.now() / 10) % 360
      const path = []
      for (let i = 0; i <= 720; i+=5) {
        const distance = Math.sin((i + time) / 180 * Math.PI * d) * 10 + 50
        
        const x = Math.cos(i / 180 * Math.PI) * distance + 100
        const y = Math.sin(i / 180 * Math.PI) * distance + 100

        path.push([x, y])
      }
      console.log(path)
      this.path = path
    },
    onClick(): void {
      this.$emit('click')
    },
  },
}
</script>

<template>
  <div style="overflow: hidden;" @click="onClick">
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect v-for="(p, i) in path" :key="i" :x="p[0]" :y="p[1]" width="2" height="2" style="stroke: none; fill: red;" />
      <polyline :points="pathString" style="stroke: none; fill: yellow;" />
      Sorry, your browser does not support inline SVG.
    </svg>
  </div>
</template>

<style scoped>

</style>
