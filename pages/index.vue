<script lang="ts">
export default {
  name: 'IndexPage',
  data(): any {
    return {
      todoBoardView: null,
      todoInputDialogView: null,
      todoItems: [],
    }
  },
  created(): void {
    this.loadTodoItems()
  },
  mounted(): void {
    this.todoBoardView = this.$refs.todoBoardView
    this.todoInputDialogView = this.$refs.todoInputDialogView
  },
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
    updateTodoItem(): void {
      this.saveTodoItems()
    },
    showTodoInputDialog(): void {
      this.todoInputDialogView.open()
    },
    confirmTodoItem(item: any): void {
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
    <header>
      <h1>Nux3+Vue3 Components</h1>
    </header>
    <section>
      <h2>Working...</h2>
      <MyWebglView />
      <MyThreejsSampleView />
    </section>
    <section>
      <h2>4. OrbisView</h2>
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
      <h2>2. TODO BoardView</h2>
      <ButtonView title="TODO 를 남겨요!" @click="showTodoInputDialog" />
      <TodoBoardView class="todo-board-view" ref="todoBoardView" :items="todoItems" @item-updated="updateTodoItem" />
      <DialogView ref="todoInputDialogView">
        <TodoInputView @item-confirmed="confirmTodoItem" />
      </DialogView>
    </section>
    <section>
      <h2>1. WaveSvgView</h2>
      <WaveSvgView class="wave-svg-view" bg-color="transparent" drop-color="#50b4c8" :rain-size="20" :rain-freq="0.02" :fps="40" :enable-splash="false" />
    </section>
    <footer>
      <p class="sign">by Kosooyoul</p>
    </footer>
  </div>
</template>

<style scoped>
section {
  margin-top: 40px;
  margin-bottom: 40px;
}
.orbis-view {
  background-color: rgba(255, 255, 255, 0.6);
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 4px 4px 16px 0px rgba(0, 0, 0, 0.2);
  margin: 10px;
}
.bubble-button-view {
  margin: 10px;
}
.todo-board-view {
  width: 1200px;
  max-width: 100%;
}
.wave-svg-view {
  left: 0px;
  bottom: 0px;
  width: 1200px;
  max-width: 100%;
  height: 200px;
}
.sign {
  font-size: 12px;
  font-weight: bold;
  color: white;
  text-shadow: 0px -1px 2px #666666;
}
</style>
