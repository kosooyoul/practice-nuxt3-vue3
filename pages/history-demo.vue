<script lang="ts">
export default {
  name: 'HistoryDemoPage',
  setup(): void {

  },
}
</script>

<template>
  <div>
    <section style="display: flex; flex-direction: column; align-items: center; padding: 0px 24px; background-color: #7BD7C1;">
      <h2 style="color: white; text-align: center; font-size: 24px; padding: 48px;">
        HISTORY
      </h2>
      <ul style="width: 640px; max-width: 100%; margin: 0px; padding: 0px; list-style: none;">
        <li>
          <PipeView title="2022" description="Oct" />
        </li>
        <li>
          <PipeView title="2022" description="Jun" />
        </li>
        <li>
          <PipeView title="2022" description="Apr" />
        </li>
        <li>
          <PipeView title="2021" description="May" />
        </li>
        <li>
          <PipeView title="2020" description="Dec" />
        </li>
      </ul>
    </section>
  </div>
</template>
