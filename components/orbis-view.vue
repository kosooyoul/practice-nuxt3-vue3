<template>
  <canvas ref="canvas"></canvas>
</template>

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

    onMounted(() => {
      const width = canvas.value.width = props.width || canvas.value.clientWidth
      const height = canvas.value.height = props.height || canvas.value.clientHeight

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas.value,
        antialias: true,
        alpha: true,
      })
      renderer.setSize(width, height)
      renderer.setClearColor(0x000000, 0)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);

      const controls = new OrbitControls(camera, canvas.value);
      controls.autoRotate = true
      controls.autoRotateSpeed = 1
      controls.dampingFactor = 0.1
      controls.enableDamping = true
      controls.zoomSpeed = 4
      controls.rotateSpeed = -1
      controls.minDistance = 0
      controls.maxDistance = 90

      camera.position.set(0, 0, 50);
      controls.update();

      const sphere = new THREE.Group();
      scene.add(sphere);
      
      
	    const geometry = new THREE.SphereGeometry(100, 20, 20, 0, Math.PI * 2, 0, Math.PI * 2)
      let material: THREE.MeshBasicMaterial
      if (props.src == null) {
	      material = new THREE.MeshBasicMaterial({color: 0xd0d0d0, wireframe: true, side: THREE.BackSide})
      } else {
        material = new THREE.MeshBasicMaterial({ side: THREE.BackSide })

        const texture = new THREE.TextureLoader().load(props.src);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 2);

        material.map = texture
      }

      const mesh = new THREE.Mesh(geometry, material);
      sphere.add(mesh);

      const render = () => {
		    controls.update();
        renderer.render(scene, camera)
		
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
