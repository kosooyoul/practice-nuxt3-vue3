<script lang="ts" setup>
import { defineComponent } from 'vue'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'

interface MapboxTerrainViewProps {
  accessToken: string
}

const props = withDefaults(defineProps<MapboxTerrainViewProps>(), {
  accessToken: '',
})

defineComponent({
  name: 'MapboxTerrainView',
})

const container = ref(null)

onMounted(() => {
  mapboxgl.accessToken = props.accessToken

  const map = new mapboxgl.Map({
    container: container.value,
    style: 'mapbox://styles/mapbox/streets-v11', // Sample
    // style: 'mapbox://styles/leegab/cl597678v000a14qpysov08pg', // Korean
    zoom: 7.3,
    pitch: 50,
    maxPitch: 85,
    maxZoom: 17,
    minZoom: 6,
    center: [127.3, 35.0], // starting position [lng, lat]
    // projection: 'globe', // display the map as a 3D globe
    locale: 'korean',
  })
  map.addControl(new mapboxgl.NavigationControl(), 'top-left')
  map.addControl(new mapboxgl.FullscreenControl(), 'top-left')
  map.addControl(new mapboxgl.GeolocateControl(), 'top-left')
  map.addControl(new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
  }))

  map.on('style.load', () => {
    map.setFog({}) // Set the default atmosphere style
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14,
    })
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.15 })
    map.addLayer({
      'id': '3d-buildings',
      'source': 'composite',
      'source-layer': 'building',
      // 'filter': ['===', 'extrude', 'true'],
      'type': 'fill-extrusion',
      'maxZoom': 14,
      'paint': {
        'fill-extrusion-color': '#ccc',
        'fill-extrusion-height': ['get', 'height'],
      },
    })
  })
})
</script>

<template>
  <div ref="container" style="width: 600px; height: 400px; background-color: gray;" />
</template>

<style scoped>
@import url('https://api.mapbox.com/mapbox-gl-js/v2.10.0/mapbox-gl.css');
</style>
