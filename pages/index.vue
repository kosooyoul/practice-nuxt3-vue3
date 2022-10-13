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
        return JSON.parse(localStorage.getItem(key)) ?? defaultValue
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
    <section>
    <section>
      <h2>1. MyWebGLView</h2>
      <MyWebglView />
      <MyThreejsSampleView />
    </section>
      <h2>2. OrbisView</h2>
      <OrbisView class="orbis-view" src="/public/textures/20180924.jpg" :width="300" :height="200" />
      <OrbisView class="orbis-view" :width="300" :height="200"/>
    </section>
    <section>
      <h2>3. BubbleButtonView</h2>
      <BubbleButtonView class="bubble-button-view" @click="log('BubbleButtonView#1@click')">안녕#1</BubbleButtonView>
      <BubbleButtonView class="bubble-button-view" @click="log('BubbleButtonView#2@click')">안녕#2</BubbleButtonView>
      <BubbleButtonView class="bubble-button-view" @click="log('BubbleButtonView#3@click')">안녕#3</BubbleButtonView>
    </section>
    <section>
      <h2>4. TODO BoardView</h2>
      <ButtonView title="TODO 를 남겨요!" @click="showTodoInputDialog" />
      <DialogView ref="todoInputDialogView">
        <TodoInputView @item-confirmed="confirmTodoItem" />
      </DialogView>
      <TodoBoardView ref="todoBoardView" :items="todoItems" style="position: relative; z-index: 1;" @item-updated="updateTodoItem" />
    </section>
    <section>
      <h2>5. WaveSvgView</h2>
      <WaveSvgView
        bg-color="transparent"
        drop-color="#50b4c8"
        :rain-size="20"
        :rain-freq="0.02"
        :fps="40"
        :enable-splash="false"
        style="left: 0px; bottom: 0px; width: 100%; height: 200px; z-index: 0;"
      />
    </section>
  </div>
</template>

<style scoped>
section {
  margin-bottom: 40px;
}
.bubble-button-view {
  margin: 10px;
}
.orbis-view {
  background-color: rgba(255, 255, 255, 0.6);
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 4px 4px 16px 0px rgba(0, 0, 0, 0.2);
  margin: 10px;
}
</style>
