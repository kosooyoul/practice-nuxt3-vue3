<script setup lang="ts">
</script>

<script lang="ts">
export default {
  name: 'IndexPage',
  props: {

  },
  data() {
    return {
      todoItems: [
        { id: '1', title: '집에 가야해', status: 'TODO' },
        { id: '2', title: '뷰 공부해야해', status: 'DOING' },
        { id: '3', title: '많고 많은 지라 이슈 모두모두 다 처리해야해', status: 'DOING' },
        { id: '4', title: '다이어트 해야해', status: 'DOING' },
        { id: '5', title: '자야해', status: 'TODO' },
        { id: '6', title: '저녁 먹어야 해', status: 'DONE' },
        { id: '7', title: '아침 먹어야 해', status: 'TODO' },
        { id: '8', title: '점심 먹어야 해', status: 'TODO' },
      ],
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
    onTodoItemUpdated(item: any) {
      this.log('onTodoItemUpdated', item)
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
    <TodoBoardView :items="todoItems" @item-updated="onTodoItemUpdated" />
  </div>
</template>

<style scoped>
</style>
