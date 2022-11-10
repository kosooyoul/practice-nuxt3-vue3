<script lang="ts" setup>
defineComponent({
  name: 'OrbDemoPage',
})
</script>

<template>
  <NuxtLayout name="none">
    <section style="display: block;">
      <OrbisView
        class="orbis-view"
        left-src="/textures/20221024.left.jpg"
        right-src="/textures/20221024.right.jpg"
        :width="300"
        :height="200"
        :stereo="true"
        :fullscreen="true"
        :autospin="true"
      />
      <OrbisView
        class="orbis-view"
        src="/textures/20180924.jpg"
        :width="300"
        :height="200"
        :stereo="true"
        :fullscreen="true"
        :autospin="true"
      />
    </section>
    <section style="display: block;">
      <OrbisView
        class="orbis-view"
        center-src="/textures/20180924.jpg"
        left-src="/textures/20221024.left.jpg"
        right-src="/textures/20221024.right.jpg"
        :width="300"
        :height="200"
        :stereo="true"
        :autospin="true"
      />
      <OrbisView
        class="orbis-view"
        :width="300"
        :height="200"
        :fullscreen="true"
      />
    </section>
  </NuxtLayout>
</template>

<style scoped>
.orbis-view {
  margin: 20px;
  box-shadow: 8px 8px 20px 0px rgba(0, 0, 0, 0.4);
  border-radius: 0px 16px 0px 16px;
}
</style>
