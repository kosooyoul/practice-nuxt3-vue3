<script setup lang="ts">
</script>

<script lang="ts">
// import Draggable from 'vue3-draggable'

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
  // components: {
  //   Draggable,
  // },
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
    holds(): TodoItem[] { return this.filterItemsByStatus(TodoItemStatus.HOLD) },
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
    onItemUpdated(item: TodoItem): void {
      const foundItem: Optional<TodoItem> = this.findItem(item.id)
      if (foundItem) {
        foundItem.title = item.title
        foundItem.status = item.status
        this.$emit('itemUpdated', foundItem)
      }
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
          <TodoCardView :item="item" @item-updated="onItemUpdated" />
        </div>
      </div>
    </div>
    <div class="section">
      <div><span>진행중</span></div>
      <div class="list">
        <div v-for="(item, i) in doings" :key="i" class="list-item">
          <TodoCardView :item="item" @item-updated="onItemUpdated" />
        </div>
      </div>
    </div>
    <div class="section">
      <div><span>완료</span></div>
      <div class="list">
        <div v-for="(item, i) in dones" :key="i" class="list-item">
          <TodoCardView :item="item" @item-updated="onItemUpdated" />
        </div>
      </div>
    </div>
    <div class="section">
      <div><span>보류</span></div>
      <div class="list">
        <div v-for="(item, i) in holds" :key="i" class="list-item">
          <TodoCardView :item="item" @item-updated="onItemUpdated" />
        </div>
      </div>
    </div>
    <!-- <draggable v-model="items"> -->
    <!-- <template v-slot:item="{ item }"> -->
    <!-- example -->
    <!-- <div> -->
    <!-- {{ item.title }} -->
    <!-- </div> -->
    <!-- or your own template -->
    <!-- </template> -->
    <!-- </draggable> -->
  </div>
</template>

<style scoped>
.board {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  padding: 4px;
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
