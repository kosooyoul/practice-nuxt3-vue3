<script lang="ts">
export default {
  name: 'SlideView',
  props: {
    title: {
      type: String,
      required: false,
      default: '',
    },
  },
  setup() {
    const images = ref(['1', '2', '3', '4', '5', '6', '7', '8', '9'])
    const selectedIndex = ref(0)

    setInterval(() => selectedIndex.value++, 500)

    return {
      images,
      selectedIndex,
    }
  },
}
</script>

<template>
  <div class="slide">
    <ul>
      <li v-for="(image, i) in images" :key="i" :class="{ left: (selectedIndex + 9 - 1) % 9 === i, right: (selectedIndex + 1) % 9 === i, center: (selectedIndex) % 9 === i }">
        <div class="image">
          Image no. {{ image }}
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
div.slide {
  display: inline-block;
  width: 600px;
  height: 300px;
  overflow: hidden;
}
div.slide>ul {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
  list-style: none;
  transform-style: preserve-3d;
  transform: perspective(400px);
  perspective-origin: center;
  -webkit-transform-style: preserve-3d;
  -webkit-transform: perspective(400px);
  -webkit-perspective-origin: center;
  /* border: 1px solid red; */
}
div.slide>ul>li {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: absolute;
  /* background-color: rgba(0, 0, 0, 0.4); */
  transition-property: transform, opacity;
  transition-duration: 0.4s;
  transition-timing-function: ease-out;
  opacity: 0;
  visibility: hidden;
}
div.slide>ul>li.center {
  opacity: 1;
  visibility: visible;
}
div.slide>ul>li.left {
  transform: rotate3d(0, 1, 0, -40deg) translate3d(-400px, 0px, 40px);
  -webkit-transform: rotate3d(0, 1, 0, -40deg) translate3d(-400px, 0px, 40px);
  visibility: visible;
}
div.slide>ul>li.right {
  transform: rotate3d(0, 1, 0, 40deg) translate3d(400px, 0px, 40px);
  -webkit-transform: rotate3d(0, 1, 0, 40deg) translate3d(400px, 0px, 40px);
  visibility: visible;
}
div.slide>ul>li>.image {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 300px;
  height: 200px;
  box-shadow: inset 0px 0px 0px 4px black;
  background-color: white;
}
</style>
