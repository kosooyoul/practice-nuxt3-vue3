<script lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default {
  name: 'OrbisView',
  props: {
    src: {
      type: String,
      required: false,
    },
    width: {
      type: Number,
      required: false,
    },
    height: {
      type: Number,
      required: false,
    },
  },
  setup(props: any) {
    const canvas: { value: HTMLCanvasElement | null } = ref(null)
    let renderer: THREE.WebGLRenderer = null
    let camera: THREE.PerspectiveCamera = null
    let scene: THREE.Scene = null
    let controls: OrbitControls = null

    const fullscreenModeChanged = () => {
      if (!document.fullscreenElement)
        renderer.setSize(props.width, props.height)
    }

    const sizeChanged = () => {
      renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight)
      camera.aspect = canvas.value.clientWidth / canvas.value.clientHeight
      camera.updateProjectionMatrix()
    }

    const getOrbisScene = () => {
      const scene = new THREE.Scene()

      const sphere = new THREE.Group()
      scene.add(sphere)

      const geometry = new THREE.SphereGeometry(100, 20, 20, 0, Math.PI * 2, 0, Math.PI * 2)
      let material: THREE.MeshBasicMaterial
      if (props.src == null) {
        material = new THREE.MeshBasicMaterial({ color: 0xD0D0D0, wireframe: true, side: THREE.BackSide })
      }
      else {
        material = new THREE.MeshBasicMaterial({ side: THREE.BackSide })

        const texture = new THREE.TextureLoader().load(props.src)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(1, 2)

        material.map = texture
      }

      const mesh = new THREE.Mesh(geometry, material)
      sphere.add(mesh)

      return scene
    }

    const getOrbisControls = (canvas: HTMLCanvasElement, camera: THREE.Camera) => {
      const controls = new OrbitControls(camera, canvas)
      controls.autoRotate = true
      controls.autoRotateSpeed = 1
      controls.dampingFactor = 0.1
      controls.enableDamping = true
      controls.zoomSpeed = 4
      controls.rotateSpeed = -1
      controls.minDistance = 0
      controls.maxDistance = 90

      camera.position.set(0, 0, 50)
      controls.update()

      return controls
    }

    const animate = () => {
      sizeChanged()

      controls.update()
      renderer.render(scene, camera)

      requestAnimationFrame(() => animate())
    }

    onMounted(() => {
      const width = props.width || canvas.value.clientWidth
      const height = props.height || canvas.value.clientHeight

      renderer = new THREE.WebGLRenderer({
        canvas: canvas.value,
        antialias: true,
        alpha: true,
      })
      renderer.setSize(width, height)
      renderer.setClearColor(0x000000, 0)

      camera = new THREE.PerspectiveCamera(60, width / height * 2, 0.1, 1000)

      controls = getOrbisControls(canvas.value, camera)
      scene = getOrbisScene()

      document.addEventListener('fullscreenchange', fullscreenModeChanged)

      animate()
    })

    onUnmounted(() => {
      document.removeEventListener('fullscreenchange', fullscreenModeChanged)
      renderer.dispose()
    })

    return {
      canvas,
    }
  },
}
</script>

<template>
  <canvas ref="canvas" />
</template>

<style scoped>
canvas:not(:root):fullscreen {
  /* TODO: Fullscreen mode styles */
  filter: sepia(1);
}
</style>
