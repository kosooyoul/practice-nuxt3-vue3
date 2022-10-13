<script setup lang="ts">
</script>

<script lang="ts">
export default {
  name: 'DialogView',
  data(): any {
    return {
      visibled: false,
    }
  },
  methods: {
    log(...args: any[]): void {
      // eslint-disable-next-line no-console
      console.log.apply(null, args)
    },
    open(): void {
      this.visibled = true
    },
    close(): void {
      this.visibled = false
    },
  },
}
</script>

<template>
  <div class="dialog" :style="{ display: visibled ? 'flex' : 'none' }" @click.self="close">
    <div class="dialog-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.dialog {
  position: fixed;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  top: 0px;
  left: 0px;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 10000;
}
.dialog-content {
  width: 400px;
  height: 300px;
  max-width: 100%;
  max-height: 100%;
  top: 50%;
  left: 50%;
  border: 1px solid black;
  background-color: rgb(255, 255, 255);
}
</style>
