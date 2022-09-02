<script setup lang="ts">
</script>

<script lang="ts">
export default {
  name: 'DialogView',
  props: {

  },
  data(): any {
    return {
      visibled: false,
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
  },
  updated(): void {
    this.log('updated: 뷰 라이프사이클, 데이터가 변경되고 돔이 다시 그려진 상태')
  },
  unmounted(): void {
    this.log('unmounted: 뷰 라이프사이클, 돔이 제거되는 상태')
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
