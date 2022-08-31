<script setup lang="ts">
</script>

<script lang="ts">
export default {
  name: 'IndexPage',
  props: {

  },
  data() {
    return {

    }
  },
  computed: {

  },
  watch: {

  },
  created() {
    this.log('created: 뷰 라이프사이클, 돔이 그려지기 직전')
  },
  mounted() {
    this.log('mounted: 뷰 라이프사이클, 돔까지 그려진 상태')
  },
  updated() {
    this.log('updated: 뷰 라이프사이클, 데이터가 변경되고 돔이 다시 그려진 상태')
  },
  unmounted() {
    this.log('unmounted: 뷰 라이프사이클, 돔이 제거되는 상태')
  },
  // setup() {},
  methods: {
    log(...args: any[]) {
      // eslint-disable-next-line no-console
      console.log.apply(null, args)
    },
  },
}
</script>

<template>
  <div>
    <WaveSvgView
      bg-color="black"
      drop-color="white"
      :rain-size="20"
      :rain-freq="0.02"
      :fps="40"
      :enable-splash="false"
      style="left: 0px; top: 0px; width: 100%; height: 200px; z-index: 0;"
    />
    <span>TODO 를 남겨요!</span>
    <TodoBoardView />
  </div>
</template>

<style scoped>
</style>
