<script lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

class OrientationSensor {
  private sensor: any
  private listener: (quaternion: { x: number; y: number; z: number; w: number }) => void = null

  constructor() {
    if (globalThis.AbsoluteOrientationSensor) {
      this.sensor = new globalThis.AbsoluteOrientationSensor({ frequency: 30 })
      this.initEvents()
    }
  }

  private initEvents() {
    this.sensor.addEventListener('reading', () => {
      if (this.listener == null)
        return

      this.listener({
        x: this.sensor.quaternion[0],
        y: this.sensor.quaternion[1],
        z: this.sensor.quaternion[2],
        w: this.sensor.quaternion[3],
      })
    })

    this.sensor.addEventListener('error', (e: any) => {
      if (e.name === 'NotReadableError')
        // eslint-disable-next-line no-console
        console.log('Sensor Error')
    })
  }

  setListener(listener: (quaternion: { x: number; y: number; z: number; w: number }) => void): void {
    this.listener = listener
  }

  clearListener(): void {
    this.listener = null
  }

  start(): void {
    this.sensor.start()
  }

  stop() {
    this.sensor.stop()
  }
}

interface OrbisRendererOptions {
  width: number
  height: number
  images: {
    center?: string
    left?: string
    right?: string
  }
  enableAutoSpin?: boolean
}

class OrbisRenderer {
  private canvas: HTMLCanvasElement
  private options: OrbisRendererOptions

  private width: number
  private height: number

  private renderer: THREE.WebGLRenderer
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls

  private scenes: { center?: THREE.Scene; left?: THREE.Scene; right?: THREE.Scene } = {}

  private rotatableMeshes: THREE.Mesh[] = []
  private quaternion: THREE.Quaternion = new THREE.Quaternion(1, 0, 0, 1).normalize()
  private targetQuaternion: THREE.Quaternion = new THREE.Quaternion(1, 0, 0, 1).normalize()

  private status = {
    stereoMode: false,
    sensorMode: false,
    fitSizeMode: false,
  }

  constructor(canvas: HTMLCanvasElement, options: OrbisRendererOptions) {
    this.width = options.width || canvas.clientWidth
    this.height = options.height || canvas.clientHeight

    this.canvas = canvas
    this.options = options

    this.init()
  }

  private init(): void {
    this.initRenderer()
    this.initCamera()
    this.initControls()
    this.initSecnes()
  }

  private initRenderer(): void {
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    })
    renderer.setSize(this.width, this.height)
    renderer.setClearColor(0x000000, 0)
    renderer.autoClear = false

    this.renderer = renderer
  }

  private initCamera(): void {
    const camera = new THREE.PerspectiveCamera(60, this.width / this.height * 2, 0.1, 1000)
    camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight
    camera.updateProjectionMatrix()

    this.camera = camera
  }

  private initControls(): void {
    const controls = new OrbitControls(this.camera, this.canvas)
    controls.autoRotate = this.options.enableAutoSpin
    controls.autoRotateSpeed = 1
    controls.dampingFactor = 0.1
    controls.enableDamping = true
    controls.zoomSpeed = 4
    controls.rotateSpeed = -1
    controls.minDistance = 0
    controls.maxDistance = 90
    controls.enablePan = false

    this.camera.position.set(0, 0, 50)
    controls.update()
    controls.saveState()

    this.controls = controls
  }

  private initSecnes(): void {
    if (this.options.images.left && this.options.images.right) {
      this.scenes.left = this.createScene(this.options.images.left)
      this.scenes.right = this.createScene(this.options.images.right)
      this.scenes.center = this.options.images.center ? this.createScene(this.options.images.center) : this.scenes.left
    }
    else {
      this.scenes.center = this.createScene(this.options.images.center)
      this.scenes.left = this.scenes.center
      this.scenes.right = this.scenes.center
    }
  }

  dispose(): void {
    this.renderer.dispose()
  }

  resetSize(): void {
    this.renderer.setSize(this.width, this.height)
  }

  setStereoMode(flag: boolean): void {
    this.status.stereoMode = flag
  }

  setSensorMode(flag: boolean): void {
    this.status.sensorMode = flag
    if (flag) {
      this.controls.enableRotate = false
      this.controls.enableZoom = false
      this.controls.autoRotate = false
      this.controls.reset()
    }
    else {
      this.controls.enableRotate = true
      this.controls.enableZoom = true
      this.controls.autoRotate = true
      this.targetQuaternion.set(1, 0, 0, 1).normalize()
    }
  }

  setFitSizeMode(flag: boolean): void {
    this.status.fitSizeMode = flag
  }

  setRotationTarget(quaternion: { x: number; y: number; z: number; w: number }): void {
    this.targetQuaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
  }

  private canStereoMode(): boolean {
    return (this.scenes.left != null && this.scenes.right != null) && this.status.stereoMode
  }

  animate(): void {
    if (this.status.fitSizeMode) {
      this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight)
      this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight
    }
    else {
      this.renderer.setSize(this.width, this.height)
      this.camera.aspect = this.width / this.height
    }
    this.camera.updateProjectionMatrix()

    this.controls.update()

    this.quaternion.slerp(this.targetQuaternion, 0.2)
    const euler = this.quaternionToEuler(this.quaternion)
    const meshEuler = new THREE.Euler(-euler.x + Math.PI * 0.5, -euler.z - Math.PI * 0.5, 0)
    this.rotatableMeshes.forEach(mesh => mesh.setRotationFromEuler(meshEuler))

    if (this.canStereoMode()) {
      this.renderer.setViewport(0, 0, this.canvas.clientWidth / 2, this.canvas.clientHeight)
      this.renderer.render(this.scenes.left, this.camera)
      this.renderer.setViewport(this.canvas.clientWidth / 2, 0, this.canvas.clientWidth / 2, this.canvas.clientHeight)
      this.renderer.render(this.scenes.right, this.camera)
    }
    else {
      this.renderer.setViewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight)
      this.renderer.render(this.scenes.center, this.camera)
    }

    requestAnimationFrame(() => this.animate())
  }

  private quaternionToEuler(quaternion: THREE.Quaternion): THREE.Euler {
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

    return new THREE.Euler(roll, pitch, yaw)
  }

  private createMaterial(imageSrc?: string): THREE.Material {
    if (imageSrc == null)
      return new THREE.MeshBasicMaterial({ color: 0xD0D0D0, wireframe: true, side: THREE.BackSide })

    const texture = new THREE.TextureLoader().load(imageSrc)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(-1, 2)

    return new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: texture })
  }

  private createMesh(imageSrc?: string): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(100, 20, 20, 0, Math.PI * 2, 0, Math.PI * 2)
    const material = this.createMaterial(imageSrc)

    return new THREE.Mesh(geometry, material)
  }

  private createScene(imageSrc?: string): THREE.Scene {
    const scene = new THREE.Scene()

    const sphere = new THREE.Group()
    scene.add(sphere)

    const mesh = this.createMesh(imageSrc)
    sphere.add(mesh)

    this.rotatableMeshes.push(mesh)

    return scene
  }
}

export default {
  name: 'OrbisView',
  props: {
    src: {
      type: String,
      required: false,
    },
    centerSrc: {
      type: String,
      required: false,
    },
    leftSrc: {
      type: String,
      required: false,
    },
    rightSrc: {
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
    sensor: {
      type: Boolean,
      required: false,
    },
    stereo: {
      type: Boolean,
      required: false,
    },
    fullscreen: {
      type: Boolean,
      required: false,
    },
    autospin: {
      type: Boolean,
      required: false,
    },
  },
  setup(props: any) {
    const root: { value: HTMLElement | null } = ref(null)
    const canvas: { value: HTMLCanvasElement | null } = ref(null)

    let orbisRenderer: OrbisRenderer = null
    let sensor: any = null

    const status = ref({ fullscreenMode: false, stereoMode: false, sensorMode: false })

    onMounted(() => {
      const width = props.width || canvas.value.clientWidth
      const height = props.height || canvas.value.clientHeight

      orbisRenderer = new OrbisRenderer(canvas.value, {
        width,
        height,
        images: {
          center: props.centerSrc || props.src,
          left: props.leftSrc,
          right: props.rightSrc,
        },
        enableAutoSpin: props.autospin,
      })

      sensor = new OrientationSensor()

      orbisRenderer.animate()
    })

    onUnmounted(() => {
      orbisRenderer.dispose()

      sensor.stop()
    })

    const requestFullscreenMode = () => {
      root.value.requestFullscreen()

      status.value.fullscreenMode = true
      orbisRenderer.setFitSizeMode(true)

      const onFullscreenModeChanged = () => {
        if (document.fullscreenElement)
          return

        status.value.fullscreenMode = false
        orbisRenderer.setFitSizeMode(false)
        document.removeEventListener('fullscreenchange', onFullscreenModeChanged)
      }

      document.addEventListener('fullscreenchange', onFullscreenModeChanged)
    }

    const toggleStereoMode = () => {
      status.value.stereoMode = !status.value.stereoMode
      orbisRenderer.setStereoMode(status.value.stereoMode)
    }

    const toggleSensorMode = () => {
      status.value.sensorMode = !status.value.sensorMode
      orbisRenderer.setSensorMode(status.value.sensorMode)
      if (status.value.sensorMode) {
        sensor.setListener((quaternion: any) => orbisRenderer.setRotationTarget(quaternion))
        sensor.start()
      }
      else {
        sensor.clearListener()
        sensor.start()
      }
    }

    return {
      root,
      canvas,
      status,
      requestFullscreenMode,
      toggleStereoMode,
      toggleSensorMode,
    }
  },
}
</script>

<template>
  <div ref="root" class="orbis-view">
    <canvas ref="canvas" />
    <div style="position: absolute; top: 0px; right: 0px; margin: 4px; padding: 0px;">
      <button v-if="sensor" :class="{ on: status.sensorMode }" @click="toggleSensorMode">
        O
      </button>
      <button v-if="stereo" :class="{ on: status.stereoMode }" @click="toggleStereoMode">
        S
      </button>
      <button v-if="fullscreen" :disabled="status.fullscreenMode" @click="requestFullscreenMode">
        F
      </button>
    </div>
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
.orbis-view button {
  min-width: 32px;
  height: 32px;
  margin: 4px;
  padding: 8px;
  border: 1px solid #999;
  border-radius: 4px;
}
.orbis-view button.on {
  background-color: #00e4ff;
}
.orbis-view:not(:root):fullscreen>canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
