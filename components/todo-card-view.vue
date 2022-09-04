<script setup lang="ts">
</script>

<script lang="ts">
export default {
  name: 'TodoCardView',
  props: {
    item: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data(): any {
    return {
      id: null,
      title: null,
      status: null,
    }
  },
  computed: {

  },
  watch: {
    item: {
      handler(item: Object): void {
        this.log('watch/item: 속성 갱신됨')
        this.updateItem(item)
      },
      deep: true,
    },
  },
  created(): void {
    this.log('created: 뷰 라이프사이클, 돔이 그려지기 직전')
    this.updateItem(this.item)
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
    updateItem(item: any): void {
      this.id = item?.id || null
      this.title = item?.title || ''
      this.status = item?.status || 'TODO'
    },
  },
}
</script>

<template>
  <div class="card">
    <div class="buttons">
      <button @click="setHold(item.id)">
        보류
      </button>
    </div>
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
</template>

<style scoped>
.card {
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  border: 1px solid #000;
  background-color: beige;
  height: 100%;
  z-index: 1;
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
