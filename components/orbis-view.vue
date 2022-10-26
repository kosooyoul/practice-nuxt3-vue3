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
    let sensor: any = null
    const quaternion: THREE.Quaternion = new THREE.Quaternion()
    const targetQuaternion: THREE.Quaternion = new THREE.Quaternion()

    const listeners: ((quaternion: THREE.Quaternion, roll: number, pitch: number, yaw: number) => void)[] = []

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

      listeners.push((quaternion: THREE.Quaternion, roll: number, pitch: number, yaw: number) => {
        const euler = new THREE.Euler(-roll + Math.PI * 0.5, -yaw - Math.PI * 0.5, 0)
        mesh.setRotationFromEuler(euler)
      })

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

      quaternion.slerp(targetQuaternion, 0.2)

      // roll (x-axis rotation)
      const sinr_cosp = 2 * (quaternion.w * quaternion.x + quaternion.y * quaternion.z)
      const cosr_cosp = 1 - 2 * (quaternion.x * quaternion.x + quaternion.y * quaternion.y)
      const roll = Math.atan2(sinr_cosp, cosr_cosp)

      // pitch (y-axis rotation)
      const copySign = (x: number, y: number): number => Math.sign(x) === Math.sign(y) ? x : -x
      const sinp = 2 * (quaternion.w * quaternion.y - quaternion.z * quaternion.x)
      const pitch = (Math.abs(sinp) >= 1) ? copySign(Math.PI / 2, sinp) : Math.asin(sinp) // use 90 degrees if out of range

      // yaw (z-axis rotation)
      const siny_cosp = 2 * (quaternion.w * quaternion.z + quaternion.x * quaternion.y)
      const cosy_cosp = 1 - 2 * (quaternion.y * quaternion.y + quaternion.z * quaternion.z)
      const yaw = Math.atan2(siny_cosp, cosy_cosp)

      listeners.forEach(listener => listener(quaternion, roll, pitch, yaw))

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

      if (globalThis.AbsoluteOrientationSensor) {
        sensor = new globalThis.AbsoluteOrientationSensor({ frequency: 30 })

        sensor.addEventListener('reading', () => {
          // model is a Three.js object instantiated elsewhere.
          targetQuaternion.set(sensor.quaternion[0], sensor.quaternion[1], sensor.quaternion[2], sensor.quaternion[3])

          // quaternion // [0.0828558628, 0.03671666449, 0.99582031371, 0.0113443967]
          // alert(JSON.stringify(gyroscope.quaternion))
        })
        sensor.addEventListener('error', (error) => {
          if (error.name === 'NotReadableError') {
            // eslint-disable-next-line no-alert
            alert('error')
          }
        })

        sensor.start()
      }

      animate()
    })

    onUnmounted(() => {
      document.removeEventListener('fullscreenchange', fullscreenModeChanged)
      renderer.dispose()

      if (sensor)
        sensor.stop()
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
