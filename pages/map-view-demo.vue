<script lang="ts">
export default {
  name: 'MapViewDemoPage',
  data(): any {
    return {
      cid: null,
      lastData: null,
      connection: null,
    }
  },
  created(): void {

  },
  mounted(): void {
    const mapView = this.$refs.mapView

    const onmessage = (evt: any) => {
      try {
        const json = evt.data
        const data = JSON.parse(json)

        // console.log(data.type)

        if (data.type === 'cid') {
          this.cid = data.cid
          // eslint-disable-next-line no-console
          console.log(`cid = ${data.cid}`)
        }
        else if (data.type === 'friends') {
          const friends = data.friends.filter((friend: any) => friend.cid !== this.cid)
          mapView.updateFriends(friends)
        }
      }
      catch (e) {

      }
    }

    const onclose = (_: any) => {
      this.connection = null
    }

    const onerror = (_: any) => {
      this.connection = null
    }

    const onopen = (_: any) => {
      this.connection.opened = true
      this.connection.onmessage = onmessage
      this.connection.onclose = onclose
      this.connection.onerror = onerror
    }

    this.connection = new WebSocket('ws://localhost:50000')
    this.connection.onopen = onopen
  },
  methods: {
    onEvent(data: any) {
      if (this.connection.opened) {
        const json = JSON.stringify(data)
        if (this.lastData !== json) {
          this.lastData = json
          this.connection.send(json)
        }
      }
    },
  },
}
</script>

<template>
  <div>
    <MapView ref="mapView" class="map-view" :width="800" :height="600" @event="onEvent" />
  </div>
</template>
