<script lang="ts">
export default {
  name: 'MapViewDemoPage',
  data(): any {
    return {
      cid: null,
      lastData: {},
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
        else if (data.type === 'dust') {
          if (data.cid != this.cid) {
            console.log('dust', JSON.stringify(data.dust))
            mapView.createFriendsDust(data.dust)
          }
        }
        else if (data.type === 'dead') {
          mapView.gameOver()

          console.log(`dead cid = ${data.cid}`)
          this.connection.close()

          alert('게임오버되었습니다.')
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

    // this.connection = new WebSocket('wss://components.auoi.net/ws')
    this.connection = new WebSocket('ws://localhost:60000')
    this.connection.onopen = onopen
  },
  methods: {
    onEvent(type: string, data: any) {
      if (this.connection?.opened) {
        const json = JSON.stringify({ type, data })
        if (this.lastData[type] !== json) {
          this.lastData[type] = json
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
