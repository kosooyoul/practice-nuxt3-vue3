<script lang="ts">
export default {
  name: 'RecycleSlideView',
  props: {
    images: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  setup(props) {
    const leftElement = ref(null)
    const rightElement = ref(null)

    const selectedIndex = ref(0)
    const leftIndex = ref(0)
    const rightIndex = ref(0)

    let fromLeftEffect = null
    let toRightEffect = null
    let toLeftEffect = null
    let fromRightEffect = null

    const initEffects = () => {
      const effectOptions = {
        duration: 400,
        easing: 'ease-out',
        fill: 'both',
        iterations: 1,
      } as KeyframeAnimationOptions

      fromLeftEffect = new KeyframeEffect(leftElement.value, [
        { transform: 'rotateY(-30deg) translateX(-600px)', opacity: 0, offset: 0 },
        { transform: 'rotateY(-30deg) translateX(-300px)', offset: 0.4 },
        { transform: 'translateX(-100px)', offset: 0.75 },
        { transform: 'translateX(0)', opacity: 1, offset: 1 },
      ], effectOptions)

      toRightEffect = new KeyframeEffect(rightElement.value, [
        { transform: 'translateX(0)', opacity: 1, offset: 0 },
        { transform: 'translateX(100px)', offset: 0.25 },
        { transform: 'rotateY(30deg) translateX(300px)', offset: 0.6 },
        { transform: 'rotateY(30deg) translateX(600px)', opacity: 0, offset: 1 },
      ], effectOptions)

      toLeftEffect = new KeyframeEffect(leftElement.value, [
        { transform: 'translateX(0)', opacity: 1, offset: 0 },
        { transform: 'translateX(-100px)', offset: 0.25 },
        { transform: 'rotateY(-30deg) translateX(-300px)', offset: 0.6 },
        { transform: 'rotateY(-30deg) translateX(-600px)', opacity: 0, offset: 1 },
      ], effectOptions)

      fromRightEffect = new KeyframeEffect(rightElement.value, [
        { transform: 'rotateY(30deg) translateX(600px)', opacity: 0, offset: 0 },
        { transform: 'rotateY(30deg) translateX(300px)', offset: 0.4 },
        { transform: 'translateX(100px)', offset: 0.75 },
        { transform: 'translateX(0)', opacity: 1, offset: 1 },
      ], effectOptions)
    }

    onMounted(() => {
      initEffects()
    })

    let repAnimation = null
    let timer = null

    const onLeftClick = () => {
      if (repAnimation != null) {
        clearTimeout(timer)
        timer = setTimeout(onLeftClick)
        return
      }

      const leftAnimation = new Animation(fromLeftEffect, document.timeline)
      const rightAnimation = new Animation(toRightEffect, document.timeline)

      repAnimation = leftAnimation
      repAnimation.onfinish = () => repAnimation = null

      selectedIndex.value = (selectedIndex.value - 1 + props.images.length) % props.images.length
      leftIndex.value = selectedIndex.value
      rightIndex.value = (selectedIndex.value + 1) % props.images.length

      leftAnimation.play()
      rightAnimation.play()
    }

    const onRightClick = () => {
      if (repAnimation != null) {
        clearTimeout(timer)
        timer = setTimeout(onRightClick)
        return
      }

      const leftAnimation = new Animation(toLeftEffect, document.timeline)
      const rightAnimation = new Animation(fromRightEffect, document.timeline)

      repAnimation = leftAnimation
      repAnimation.onfinish = () => repAnimation = null

      selectedIndex.value = (selectedIndex.value + 1) % props.images.length
      leftIndex.value = (selectedIndex.value - 1 + props.images.length) % props.images.length
      rightIndex.value = selectedIndex.value

      leftAnimation.play()
      rightAnimation.play()
    }

    const onLocationClick = (index: number) => {
      const newSelectedIndex = index % props.images.length
      if (selectedIndex.value === newSelectedIndex)
        return

      if (repAnimation != null) {
        clearTimeout(timer)
        timer = setTimeout(() => onLocationClick(index))
        return
      }

      let leftAnimation = null
      let rightAnimation = null

      if (selectedIndex.value < newSelectedIndex) {
        leftAnimation = new Animation(toLeftEffect, document.timeline)
        rightAnimation = new Animation(fromRightEffect, document.timeline)

        repAnimation = leftAnimation
        repAnimation.onfinish = () => repAnimation = null

        leftIndex.value = selectedIndex.value
        rightIndex.value = newSelectedIndex
        selectedIndex.value = newSelectedIndex
      }
      else {
        leftAnimation = new Animation(fromLeftEffect, document.timeline)
        rightAnimation = new Animation(toRightEffect, document.timeline)

        repAnimation = leftAnimation
        repAnimation.onfinish = () => repAnimation = null

        rightIndex.value = selectedIndex.value
        leftIndex.value = newSelectedIndex
        selectedIndex.value = newSelectedIndex
      }

      leftAnimation.play()
      rightAnimation.play()
    }

    return {
      selectedIndex,
      leftIndex,
      rightIndex,
      leftElement,
      rightElement,
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
      <li ref="leftElement" class="left">
        <div class="image" :style="{ backgroundImage: `url(${images[leftIndex]})` }" />
        <div class="mirror" :style="{ backgroundImage: `url(${images[leftIndex]})` }" />
      </li>
      <li ref="rightElement" class="right" style="opacity: 0;">
        <div class="image" :style="{ backgroundImage: `url(${images[rightIndex]})` }" />
        <div class="mirror" :style="{ backgroundImage: `url(${images[rightIndex]})` }" />
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
}
div.slide>ul>li>.image {
  position: relative;
  width: 300px;
  height: 200px;
  border-radius: 4px;
  background-size: cover;
  background-color: white;
}
div.slide>ul>li>.mirror {
  position: absolute;
  width: 300px;
  height: 200px;
  margin-top: 4px;
  border-radius: 4px;
  transform-origin: bottom;
  transform: rotateX(180deg);
  background-color: white;
  background-size: cover;
  -webkit-mask-image: -webkit-gradient(linear, left bottom, left top, from(rgba(0,0,0,0.2)), to(rgba(0,0,0,0)));
  mask-image: linear-gradient(to top, rgba(0,0,0,0.2), rgba(0,0,0,0));
  filter: blur(2px);
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
