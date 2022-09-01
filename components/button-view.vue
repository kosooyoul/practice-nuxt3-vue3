<script setup lang="ts">
</script>

<script lang="ts">
export default {
  name: 'ButtonView',
  props: {
    title: {
      type: String,
      required: false,
      default: '',
    },
  },
  emits: ['click'],
  data(): any {
    return {

    }
  },
  computed: {

  },
  watch: {
    title(_title: string): void {
      this.log('watch/title: 속성 갱신됨')
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
    onClick(): void {
      this.$emit('click')
    },
  },
}
</script>

<template>
  <div class="button" @click="onClick">
    {{ title }}
  </div>
</template>

<style scoped>
.button {
  display: inline-block;
  height: 16px;
  min-width: 60px;
  max-width: 100%;
  border: 1px solid black;
  border-radius: 4px;
  background-color: white;
  line-height: 16px;
  padding: 8px 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  text-align: center;
  font-size: 14px;
  user-select: none;
  cursor: pointer;
}
.button:hover {
  background-color: cyan;
}
.button:active {
  background-color: gold;
}
</style>
