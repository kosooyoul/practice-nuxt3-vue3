<script lang="ts">
export default {
  name: 'MyCanvasView',
  data() {
    return {
      canvas: null,
      context: null,
      width: 0,
      height: 0,
      play: true,
    }
  },
  mounted() {
    const canvas = this.$el as HTMLCanvasElement
    const context = canvas.getContext('2d')
    this.width = canvas.width = canvas.clientWidth
    this.height = canvas.height = canvas.clientHeight
    this.canvas = canvas
    this.context = context

    context.font = '30px verdana'
    context.strokeStyle = 'blue'
    context.strokeText('Hello World!!', 40, 40)
  }
}
</script>

<template>
  <canvas style="width: 600px; heihght: 400px;" />
</template>

<style scoped>
</style>
