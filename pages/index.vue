<script setup lang="ts">
</script>

<script lang="ts">
export default {
  name: 'IndexPage',
  props: {

  },
  data(): any {
    return {
      todoBoardView: null,
      todoInputDialogView: null,
      todoItems: [],
    }
  },
  computed: {

  },
  watch: {

  },
  created(): void {
    this.log('created: 뷰 라이프사이클, 돔이 그려지기 직전')
    this.loadTodoItems()
  },
  mounted(): void {
    this.log('mounted: 뷰 라이프사이클, 돔까지 그려진 상태')
    this.todoBoardView = this.$refs.todoBoardView
    this.todoInputDialogView = this.$refs.todoInputDialogView
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
    getLocalData<T>(key: string, defaultValue: T = null): T {
      try {
        return JSON.parse(localStorage.getItem(key))
      }
      catch (e) {
        return defaultValue
      }
    },
    setLocalData(key: string, data: any): void {
      localStorage.setItem(key, JSON.stringify(data))
    },
    loadTodoItems(): void {
      this.todoItems = this.getLocalData('todoItems', [])
    },
    saveTodoItems(): void {
      this.setLocalData('todoItems', this.todoItems)
    },
    updateTodoItem(item: any): void {
      this.log('updateTodoItem', item)
      this.saveTodoItems()
    },
    showTodoInputDialog(): void {
      this.log('showTodoInputDialog')
      this.todoInputDialogView.open()
    },
    confirmTodoItem(item: any): void {
      this.log('confirmTodoItem', item)
      item.id = Date.now()
      this.todoItems.push(item)
      this.todoInputDialogView.close()
      this.saveTodoItems()
    },
  },
}
</script>

<template>
  <div>
    <ButtonView title="TODO 를 남겨요!" @click="showTodoInputDialog" />
    <DialogView ref="todoInputDialogView">
      <TodoInputView @item-confirmed="confirmTodoItem" />
    </DialogView>
    <TodoBoardView ref="todoBoardView" :items="todoItems" style="position: relative; z-index: 1;" @item-updated="updateTodoItem" />
    <div style="height: 200px;" />
    <WaveSvgView
      bg-color="transparent"
      drop-color="rgb(120, 255, 230)"
      :rain-size="20"
      :rain-freq="0.02"
      :fps="40"
      :enable-splash="false"
      style="position: absolute; left: 0px; bottom: 0px; width: 100%; height: 200px; z-index: 0;"
    />
    <div style="position: absolute; bottom: 0px; left: 0px; width: 100%; z-index: 10;">
      <div style="text-align: center; font-size: 12px; padding: 12px; color: white; background-color: rgb(120, 255, 230); text-shadow: -1px -1px 0px black;">
        Hello World
      </div>
    </div>
  </div>
</template>

<style>
html, body { margin: 0px; padding: 0px; background-color: white; width: 100%; height: 100%; }
</style>
