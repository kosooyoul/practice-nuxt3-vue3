<script lang="ts" setup>
import { defineComponent, defineProps, withDefaults } from 'vue'

interface PipeViewProps {
  title?: string
  description?: string
  summaries?: {
    title?: string
    description?: string
  }[]
}

withDefaults(defineProps<PipeViewProps>(), {
  title: '',
  description: '',
  summaries: () => [{
    title: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque sequi fugit aliquid. Accusantium temporibus explicabo quae earum doloremque odio dolor amet obcaecati. Ad at cumque quasi delectus tenetur, officiis illum!',
  }, {
    title: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque sequi fugit aliquid. Accusantium temporibus explicabo quae earum doloremque odio dolor amet obcaecati. Ad at cumque quasi delectus tenetur, officiis illum!',
  }],
})

defineComponent({
  name: 'PipeView',
})
</script>

<template>
  <div class="root">
    <div class="pipe">
      <div class="circle">
        <h3 class="title">
          {{ title }}
        </h3>
        <p class="description">
          {{ description }}
        </p>
      </div>
    </div>
    <ul class="summaries">
      <li v-for="(summary, i) in summaries" :key="i" class="summary">
        <h4 class="title">
          {{ summary.title }}
        </h4>
        <p class="description">
          {{ summary.description }}
        </p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
div.root {
  display: flex;
  position: relative;
  align-content: center;
  justify-content: flex-start;
}
div.pipe {
  position: relative;
}
div.pipe::before {
  content: ' ';
  position: absolute;
  width: 1px;
  height: 100%;
  left: 50%;
  top: 0px;
  border-left: 1px solid white;
}
div.circle {
  position: relative;
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  align-items: center;
  width: 76px;
  height: 76px;
  margin: 32px auto;
  border-radius: 40px;
  border: 1px solid white;
  background-color: #e0e0e0;
  z-index: 1;
}
div.circle>h3.title {
  margin: 0px;
  padding: 0px;
  font-weight: bold;
  font-size: 14px;
  text-align: center;
  color: black;
}
div.circle>p.description {
  margin: 0px;
  padding: 0px;
  font-size: 10px;
  text-align: center;
  white-space: pre-wrap;
  color: black;
}
ul.summaries {
  margin-left: 32px;
  margin-top: 32px;
  padding: 0px;
  list-style: none;
}
li.summary {
  margin: 24px 0px;
}
li.summary>h4.title {
  margin: 8px 0px;
  font-weight: bold;
  font-size: 14px;
}
li.summary>p.description {
  margin: 0px;
  font-size: 14px;
  white-space: pre-wrap;
}
</style>
