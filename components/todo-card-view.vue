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
  emits: ['itemUpdated'],
  data(): any {
    return {
      id: null,
      title: null,
      status: null,
    }
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
  mounted(): void {
    this.updateItem(this.item)
  },
  methods: {
    log(...args: any[]): void {
      // eslint-disable-next-line no-console
      console.log.apply(null, args)
    },
    updateItem(item: any): void {
      this.id = item?.id || null
      this.title = item?.title || '내용 없음'
      this.status = item?.status || 'TODO'
    },
    onStatusUpdated(status: string): void {
      if (this.status === status)
        return

      this.status = status
      this.$emit('itemUpdated', {
        id: this.id,
        title: this.title,
        status: this.status,
      })
    },
  },
}
</script>

<template>
  <div class="card">
    <div class="buttons">
      <button v-show="status !== 'HOLD' && status !== 'DONE'" @click="onStatusUpdated('HOLD')">
        보류
      </button>
      <button v-show="status === 'HOLD'" @click="onStatusUpdated('DOING')">
        진행
      </button>
    </div>
    <div class="title">
      <span>{{ title }}</span>
    </div>
    <div class="buttons">
      <button v-show="status !== 'TODO' && status !== 'HOLD'" @click="onStatusUpdated('TODO')">
        대기
      </button>
      <button v-show="status !== 'DOING'" @click="onStatusUpdated('DOING')">
        진행
      </button>
      <button v-show="status !== 'DONE' && status !== 'HOLD'" @click="onStatusUpdated('DONE')">
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
