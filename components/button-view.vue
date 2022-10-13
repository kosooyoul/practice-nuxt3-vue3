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
  watch: {
    title(_title: string): void {
      this.log('watch/title: 속성 갱신됨')
    },
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
  <button class="button" @click="onClick">
    {{ title }}
  </button>
</template>

<style scoped>
.button {
  display: inline-block;
  height: 32px;
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
