<script setup lang="ts">
</script>

<script lang="ts">
type Optional<T> = T | null | undefined

enum TodoItemStatus {
  TODO = 'TODO',
  DOING = 'DOING',
  DONE = 'DONE',
  HOLD = 'HOLD',
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
    },
  },
  emits: ['itemUpdated'],
  data(): any {
    return {
      all: [],
      todos: [],
      doings: [],
      dones: [],
      holds: [],
    }
  },
  watch: {
    items: {
      handler(_items: TodoItem[]): void {
        this.log('watch/items: 속성 갱신됨')
        this.updateItems()
      },
      deep: true,
    },
  },
  mounted(): void {
    this.updateItems()
  },
  methods: {
    log(...args: any[]): void {
      // eslint-disable-next-line no-console
      console.log.apply(null, args)
    },
    updateItems(): void {
      this.all = this.items?.concat()
      this.todos = this.filterItemsByStatus(TodoItemStatus.TODO)
      this.doings = this.filterItemsByStatus(TodoItemStatus.DOING)
      this.dones = this.filterItemsByStatus(TodoItemStatus.DONE)
      this.holds = this.filterItemsByStatus(TodoItemStatus.HOLD)
    },
    findItem(itemId: string): Optional<TodoItem> {
      return this.items?.find((item: TodoItem) => item.id === itemId)
    },
    filterItemsByStatus(status: TodoItemStatus): TodoItem[] {
      return this.items?.filter((item: TodoItem) => item.status === status)
    },
    onItemUpdated(item: TodoItem): void {
      const foundItem: Optional<TodoItem> = this.findItem(item.id)
      if (foundItem) {
        foundItem.title = item.title
        foundItem.status = item.status
        this.$emit('itemUpdated', foundItem)
      }
    },
    onItemMoved(event: any): void {
      this.log('onItemMoved, event', event)
    },
    onItemDrop(event: any): void {
      this.log('onItemDrop, event', event)
    },
  },
}
</script>

<template>
  <div class="board">
    <div class="section">
      <div><span>대기중</span></div>
      <div class="list">
        <div v-for="item in todos" :key="item.id" class="list-item">
          <TodoCardView :item="item" @item-updated="onItemUpdated" />
        </div>
      </div>
    </div>
    <div class="section">
      <div><span>진행중</span></div>
      <div class="list">
        <div v-for="item in doings" :key="item.id" class="list-item">
          <TodoCardView :item="item" @item-updated="onItemUpdated" />
        </div>
      </div>
    </div>
    <div class="section">
      <div><span>완료</span></div>
      <div class="list">
        <div v-for="item in dones" :key="item.id" class="list-item">
          <TodoCardView :item="item" @item-updated="onItemUpdated" />
        </div>
      </div>
    </div>
    <div class="section">
      <div><span>보류</span></div>
      <div class="list">
        <div v-for="item in holds" :key="item.id" class="list-item">
          <TodoCardView :item="item" @item-updated="onItemUpdated" />
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
  background-color: white;
  border-radius: 4px;
  overflow: hidden;
}
@media screen and (max-width: 800px) {
  .board {
    flex-direction: column;
  }
}
.section {
  width: 100%;
  padding: 4px;
  border: 1px solid black;
  border-radius: 4px;
  overflow: hidden;
}
.list-item {
  position: relative;
  padding: 4px;
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
  z-index: 0;
}
</style>
