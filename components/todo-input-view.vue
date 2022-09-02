<script setup lang="ts">
</script>

<script lang="ts">
export default {
  name: 'TodoInputView',
  props: {
    item: {
      type: Object,
      required: false,
      default: null,
    },
  },
  emits: ['itemConfirmed'],
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
    confirm(): void {
      if (this.title.length === 0)
        return

      this.$emit('itemConfirmed', {
        id: this.id,
        title: this.title,
        status: this.status,
      })

      this.title = ''
      this.status = 'TODO'
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
  <div class="todo-input">
    <input v-model="title" type="text" placeholder="제목을 입력해주세요">
    <select v-model="status">
      <option value="TODO">
        대기중
      </option>
      <option value="DOING">
        진행중
      </option>
      <option value="DONE">
        완료
      </option>
      <option value="HOLD">
        보류
      </option>
    </select>
    <ButtonView title="확인!" @click="confirm()" />
  </div>
</template>

<style scoped>
</style>
