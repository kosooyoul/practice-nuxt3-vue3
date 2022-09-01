<script setup lang="ts">
</script>

<script lang="ts">
type Optional<T> = T | null | undefined

enum TodoItemStatus {
  TODO = 'TODO',
  DOING = 'DOING',
  DONE = 'DONE',
}

class TodoItem {
  id: string
  title: string
  status: string
}

export default {
  name: 'TodoBoardView',
  props: {
    items: {
      type: Array,
      required: false,
      default: (): TodoItem[] => [],
    },
  },
  emits: ['itemUpdated'],
  data(): any {
    return {

    }
  },
  computed: {
    todos(): TodoItem[] { return this.filterItemsByStatus(TodoItemStatus.TODO) },
    doings(): TodoItem[] { return this.filterItemsByStatus(TodoItemStatus.DOING) },
    dones(): TodoItem[] { return this.filterItemsByStatus(TodoItemStatus.DONE) },
  },
  watch: {
    items: {
      handler(_items: TodoItem[]): void {
        this.log('watch/items: 속성 갱신됨')
      },
      deep: true,
    },
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
    findItem(itemId: string): Optional<TodoItem> {
      return this.items.find((item: TodoItem) => item.id === itemId)
    },
    filterItemsByStatus(status: TodoItemStatus): TodoItem[] {
      return this.items.filter((item: TodoItem) => item.status === status)
    },
    setStatus(itemId: string, status: TodoItemStatus): void {
      const item: Optional<TodoItem> = this.findItem(itemId)
      if (item && item.status !== status) {
        item.status = status
        this.$emit('itemUpdated', item)
      }
    },
    setTodo(itemId: string): void {
      this.setStatus(itemId, TodoItemStatus.TODO)
    },
    setDoing(itemId: string): void {
      this.setStatus(itemId, TodoItemStatus.DOING)
    },
    setDone(itemId: string): void {
      this.setStatus(itemId, TodoItemStatus.DONE)
    },
  },
}
</script>

<template>
  <div class="board">
    <div class="section">
      <div><span>대기중</span></div>
      <div class="list">
        <div v-for="(item, i) in todos" :key="i" class="list-item">
          <div class="draggable" />
          <div class="card">
            <div class="buttons" />
            <div class="title">
              <span>{{ item.title }}</span>
            </div>
            <div class="buttons">
              <button @click="setDoing(item.id)">
                진행
              </button>
              <button @click="setDone(item.id)">
                완료
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="section">
      <div><span>진행중</span></div>
      <div class="list">
        <div v-for="(item, i) in doings" :key="i" class="list-item">
          <div class="draggable" />
          <div class="card">
            <div class="buttons">
              <button @click="setTodo(item.id)">
                대기
              </button>
            </div>
            <div class="title">
              <span>{{ item.title }}</span>
            </div>
            <div class="buttons">
              <button @click="setDone(item.id)">
                완료
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="section">
      <div><span>완료</span></div>
      <div class="list">
        <div v-for="(item, i) in dones" :key="i" class="list-item">
          <div class="draggable" />
          <div class="card">
            <div class="buttons">
              <button @click="setTodo(item.id)">
                대기
              </button>
              <button @click="setDoing(item.id)">
                진행
              </button>
            </div>
            <div class="title">
              <span>{{ item.title }}</span>
            </div>
            <div class="buttons" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board {
  display: flex;
  flex-direction: row;
  align-items: stretch;
}
.section {
  width: 100%;
  border: 1px solid black;
}
.list-item {
  position: relative;
  padding: 10px;
  border: 1px solid black;
  border-radius: 4px;
  height: 50px;
  overflow: hidden;
}
.list-item>.draggable {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  background-color: lightgray;
  z-index: -1;
}
.card {
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid #000;
  background-color: beige;
  height: 100%;
}
.card>.title {
  width: 100%;
}
.card>.title {
  width: 100%;
  text-align: left;
  font-size: 14px;
}
.card>.buttons {
  width: 80px;
}
</style>
