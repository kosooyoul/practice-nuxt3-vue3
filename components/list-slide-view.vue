<script lang="ts">
export default {
  name: 'ListSlideView',
  props: {
    images: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  setup(props) {
    const selectedIndex = ref(0)
    const leftIndex = ref(0)
    const rightIndex = ref(0)

    const selectIndex = (index: number) => {
      selectedIndex.value = (index + props.images.length) % props.images.length
      leftIndex.value = (index - 1 + props.images.length) % props.images.length
      rightIndex.value = (index + 1 + props.images.length) % props.images.length
    }

    const onLeftClick = () => {
      selectIndex(selectedIndex.value - 1)
    }

    const onRightClick = () => {
      selectIndex(selectedIndex.value + 1)
    }

    const onLocationClick = (index: number) => {
      const newSelectedIndex = (index + props.images.length) % props.images.length
      if (selectedIndex.value === newSelectedIndex)
        return

      leftIndex.value = selectedIndex.value
      selectedIndex.value = newSelectedIndex
      rightIndex.value = (index + 1 + props.images.length) % props.images.length
    }

    selectIndex(0)

    return {
      selectedIndex,
      leftIndex,
      rightIndex,
      onLeftClick,
      onRightClick,
      onLocationClick,
    }
  },
}
</script>

<template>
  <div class="slide">
    <ul>
      <li v-for="(image, i) in images" :key="i" :class="{ left: selectedIndex < i, right: selectedIndex > i, center: selectedIndex === i }">
        <img class="image" :src="`${image}`">
      </li>
    </ul>
    <div class="controller" style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;">
      <button style="position: absolute; left: 0px; top: 50%; width: 48px; height: 48px; margin-left: 10px; margin-top: -24px;" @click="onLeftClick">
        Left
      </button>
      <nav style="position: absolute; width: 100%; bottom: 0px; margin-bottom: 10px; text-align: center;">
        <button v-for="(_, i) of images" :key="i" :class="{ selected: selectedIndex === i }" @click="onLocationClick(i)" />
      </nav>
      <button style="position: absolute; right: 0px; top: 50%; width: 48px; height: 48px; margin-right: 10px; margin-top: -24px;" @click="onRightClick">
        Right
      </button>
    </div>
  </div>
</template>

<style scoped>
div.slide {
  display: inline-block;
  position: relative;
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
}
div.slide>ul>li.center {
  opacity: 1;
}
div.slide>ul>li.left {
  transform: rotate3d(0, 1, 0, -40deg) translate3d(-400px, 0px, 40px);
  -webkit-transform: rotate3d(0, 1, 0, -40deg) translate3d(-400px, 0px, 40px);
}
div.slide>ul>li.right {
  transform: rotate3d(0, 1, 0, 40deg) translate3d(400px, 0px, 40px);
  -webkit-transform: rotate3d(0, 1, 0, 40deg) translate3d(400px, 0px, 40px);
}
div.slide>ul>li>img.image {
  display: block;
  width: 300px;
  height: 200px;
  border-radius: 4px;
  background-color: white;
  -webkit-box-reflect: below 4px linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.2));
}
div.slide nav>button {
  background-color: transparent;
  width: 28px;
  height: 28px;
  padding: 0px;
  margin: 0px;
  vertical-align: middle;
  font-size: 0px;
  border: none;
  cursor: pointer;
}
div.slide nav>button::after {
  display: block;
  content: ' ';
  background-color: white;
  width: 8px;
  height: 8px;
  padding: 0px;
  margin: auto;
  border: none;
  border-radius: 4px;
  transition-property: width, height, border-radius, background-color;
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;
}
div.slide nav>button:hover::after,
div.slide nav>button:active::after {
  width: 12px;
  height: 12px;
  border-radius: 6px;
}
div.slide nav>button:focus::after {
  background-color: cyan;
}
div.slide nav>button.selected::after {
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: cyan;
}
</style>
