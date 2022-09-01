<script setup lang="ts">
</script>

<script lang="ts">
export default {
  name: 'IndexPage',
  props: {

  },
  data(): any {
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
  // setup() {},
  methods: {
    log(...args: any[]): void {
      // eslint-disable-next-line no-console
      console.log.apply(null, args)
    },
    onTodoItemUpdated(item: any): void {
      this.log('onTodoItemUpdated', item)
    },
    onClickNewTodoButton(): void {
      this.log('onClickNewTodoButton')
    },
    todoInputVisibility(): void {
      this.log('onClickNewTodoButton')
    },
  },
}
</script>

<template>
  <div>
    <ButtonView title="TODO 를 남겨요!" @click="onClickNewTodoButton" />
    <TodoBoardView :items="todoItems" style="position: relative; z-index: 1;" @item-updated="onTodoItemUpdated" />
    <!-- <TodoInputView :visible="todoInputVisibility" @item-confirmed="onTodoItemConfirmed" /> -->
    <WaveSvgView
      bg-color="black"
      drop-color="white"
      :rain-size="20"
      :rain-freq="0.02"
      :fps="40"
      :enable-splash="false"
      style="position: fixed; left: 0px; bottom: 0px; width: 100%; height: 200px; z-index: 0;"
    />
  </div>
</template>

<style>
html, body { margin: 0px; padding: 0px; background-color: black; width: 100%; height: 100%; }
</style>
