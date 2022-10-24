<script lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

class OrbisStereoProps {
  left: string
  right: string
}

export default {
  name: 'OrbisView',
  props: {
    src: {
      type: String,
      required: false,
    },
    stereo: {
      type: Object, // OrbisStereoProps
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
    autospin: {
      type: Boolean,
      required: false,
    },
  },
  setup(props: any) {
    const canvas: { value: HTMLCanvasElement | null } = ref(null)
    let renderer: THREE.WebGLRenderer = null
    let camera: THREE.PerspectiveCamera = null
    const scenes: { center?: THREE.Scene; left?: THREE.Scene; right?: THREE.Scene } = {}
    let controls: OrbitControls = null
    let gyroscope: any = null

    const fullScreenMode = ref(false)
    const stereoMode = ref(false)

    const fullscreenModeChanged = () => {
      if (!document.fullscreenElement) {
        renderer.setSize(props.width, props.height)
        fullScreenMode.value = false
      }
    }

    const sizeChanged = () => {
      renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight)
      camera.aspect = canvas.value.clientWidth / canvas.value.clientHeight
      camera.updateProjectionMatrix()
    }

    const getOrbisScene = (src: string) => {
      const scene = new THREE.Scene()

      const sphere = new THREE.Group()
      scene.add(sphere)

      const geometry = new THREE.SphereGeometry(100, 20, 20, 0, Math.PI * 2, 0, Math.PI * 2)
      let material: THREE.MeshBasicMaterial
      if (src == null) {
        material = new THREE.MeshBasicMaterial({ color: 0xD0D0D0, wireframe: true, side: THREE.BackSide })
      }
      else {
        material = new THREE.MeshBasicMaterial({ side: THREE.BackSide })

        const texture = new THREE.TextureLoader().load(src)
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
      if (props.autospin) {
        controls.autoRotate = true
        controls.autoRotateSpeed = 1
      }
      else {
        controls.autoRotate = false
      }
      controls.dampingFactor = 0.1
      controls.enableDamping = true
      controls.zoomSpeed = 4
      controls.rotateSpeed = -1
      controls.minDistance = 0
      controls.maxDistance = 90
      controls.enablePan = false

      camera.position.set(0, 0, 50)
      controls.update()

      return controls
    }

    const animate = () => {
      sizeChanged()

      controls.update()
      if (gyroscope) {
        scenes.left?.rotateY(gyroscope.y * Math.PI / 180)
        scenes.left?.rotateX(gyroscope.x * Math.PI / 180)
        scenes.right?.rotateY(gyroscope.y * Math.PI / 180)
        scenes.right?.rotateX(gyroscope.x * Math.PI / 180)
        scenes.center?.rotateY(gyroscope.y * Math.PI / 180)
        scenes.center?.rotateX(gyroscope.x * Math.PI / 180)
      }

      if (stereoMode.value || (fullScreenMode.value && props.stereo)) {
        renderer.setViewport(0, 0, canvas.value.clientWidth / 2, canvas.value.clientHeight)
        renderer.render(scenes.left, camera)
        renderer.setViewport(canvas.value.clientWidth / 2, 0, canvas.value.clientWidth / 2, canvas.value.clientHeight)
        renderer.render(scenes.right, camera)
      }
      else {
        renderer.setViewport(0, 0, canvas.value.clientWidth, canvas.value.clientHeight)
        renderer.render(scenes.center, camera)
      }

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
      renderer.autoClear = false

      camera = new THREE.PerspectiveCamera(60, width / height * 2, 0.1, 1000)

      controls = getOrbisControls(canvas.value, camera)
      if (props.stereo) {
        scenes.left = getOrbisScene(props.stereo.left)
        scenes.right = getOrbisScene(props.stereo.right)
        scenes.center = scenes.left
      }
      else {
        scenes.center = getOrbisScene(props.src)
      }

      document.addEventListener('fullscreenchange', fullscreenModeChanged)

      if (globalThis.Gyroscope) {
        gyroscope = new globalThis.Gyroscope({ frequency: 30 })
        gyroscope.start()
      }

      animate()
    })

    onUnmounted(() => {
      document.removeEventListener('fullscreenchange', fullscreenModeChanged)
      renderer.dispose()

      if (gyroscope)
        gyroscope.stop()
    })

    const toggleFullscreenMode = () => {
      canvas.value.requestFullscreen()
      fullScreenMode.value = !fullScreenMode.value
    }

    const toggleStereoMode = () => {
      stereoMode.value = !stereoMode.value
    }

    return {
      stereoMode,
      canvas,
      toggleFullscreenMode,
      toggleStereoMode,
    }
  },
}
</script>

<template>
  <div class="orbis-view">
    <canvas ref="canvas" />
    <button style="position: absolute; top: 8px; right: 8px; width: 32px; height: 32px; margin: 0px; padding: 0px; border: 1px solid #999; border-radius: 4px;" @click="toggleFullscreenMode">
      F
    </button>
    <button v-if="stereo" style="position: absolute; top: 8px; right: 48px; width: 32px; height: 32px; margin: 0px; padding: 0px; border: 1px solid #999; border-radius: 4px;" @click="toggleStereoMode">
      S
    </button>
  </div>
</template>

<style scoped>
.orbis-view {
  display: inline-block;
  position: relative;
  margin: 0px;
  padding: 0px;
  overflow: hidden;
  font-size: 0px;
}
.orbis-view>canvas:not(:root):fullscreen {
  /* TODO: Fullscreen mode styles */
  /* filter: sepia(1); */
}
</style>
