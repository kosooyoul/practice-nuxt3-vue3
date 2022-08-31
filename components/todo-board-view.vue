<script setup lang="ts">
</script>

<script lang="ts">
class TodoItem {
  id: number
  title: string
  status: string
}
export default {
  name: 'TodoBoardView',
  props: {
    items: {
      type: [TodoItem],
      default: [
        { id: '1', title: '집에 가야해', status: 'TODO' },
        { id: '2', title: '뷰 공부해야해', status: 'DOING' },
        { id: '3', title: '많고 많은 딩동유 지라 이슈 모두모두 다 처리해야해', status: 'DOING' },
        { id: '4', title: '다이어트 해야해', status: 'DOING' },
        { id: '5', title: '자야해', status: 'TODO' },
        { id: '6', title: '저녁 먹어야 해', status: 'DONE' },
      ],
    },
  },
  data() {
    return {

    }
  },
  computed: {
    todos() { return this.items.filter(item => item.status === 'TODO') },
    doings() { return this.items.filter(item => item.status === 'DOING') },
    dones() { return this.items.filter(item => item.status === 'DONE') },
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
              <button>진행</button>
              <button>완료</button>
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
              <button>대기</button>
            </div>
            <div class="title">
              <span>{{ item.title }}</span>
            </div>
            <div class="buttons">
              <button>완료</button>
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
              <button>대기</button>
              <button>진행</button>
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
