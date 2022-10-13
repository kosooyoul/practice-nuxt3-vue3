<template>
  <canvas ref="canvas" width="300" height="200"></canvas>
</template>

<script lang="ts">
import * as THREE from 'three'

export default {
  name: 'MyThreejsView',
  setup() {
    const canvas: { value: HTMLCanvasElement | null } = ref(null)
    
    onMounted(() => {
      const width = canvas.value.width
      const height = canvas.value.height
      console.log('mounted', width, height)

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas.value,
        antialias: true,
        alpha: true,
      })
      renderer.setSize(width, height)
      renderer.setClearColor(0x000000, 0)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);

      const sphere = new THREE.Group();
      scene.add(sphere);
      
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(100, 40, 40, 0, Math.PI * 2, 0, Math.PI * 2),
        new THREE.MeshBasicMaterial({color: 0xd0d0d0, wireframe: true, side: THREE.DoubleSide}),
      );
      sphere.add(mesh);

      const render = () => {
        console.log('render')
        renderer.render(scene, camera)
        sphere.rotation.x += 0.008
        sphere.rotation.y += 0.012
        requestAnimationFrame(() => render())
      }

      render()
    })

    return {
      canvas
    }
  }
}
</script>
