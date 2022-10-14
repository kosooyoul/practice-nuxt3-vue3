<script lang="ts">
import { mat3, mat4, vec3 } from 'gl-matrix'

export class Camera {
  name: string
  fovy = 45.0
  near = 0.0
  far = 100.0
  lookEye: number[] = [5.0, 5.0, 5.0]
  lookTarget: number[] = [0.0, 0.0, 0.0]
  lookAngle: number[] = [0.0, 1.0, 0.0]

  constructor(name) {
    this.name = name
  }
}

export class Lighting {
  name: string
  ambient: number[] = [0.1, 0.1, 0.1]
  diffuse: number[] = [1.0, 0.9, 0.5]
  direction: number[] = [10.0, 10.0, -10.0]
  specular = 1

  constructor(name) {
    this.name = name
  }
}

class Renderer {
  gl: any = null
  camera: any = null
  clearColor: number[] = [0, 0, 0, 0] // [1.0, 0.8, 0.0, 1.0]
  rootLayer: any = null
  lastTime = 0
  // resource: any = null

  constructor(canvas, resource) {
    this.create(canvas)
    // this.feedResource(resource);
  }

  create(canvas) {
    try {
      this.gl = canvas.getContext('experimental-webgl')
      this.gl.viewportWidth = canvas.width
      this.gl.viewportHeight = canvas.height
      this.gl.modelviewMatrix = mat4.create()
      this.gl.projectionMatrix = mat4.create()
      this.gl.modelviewMatrixStack = []
      this.gl.modelviewPushMatrix = function () {
        const copy = mat4.create()
        mat4.copy(copy, this.modelviewMatrix)
        this.modelviewMatrixStack.push(copy)
      }
      this.gl.modelviewPopMatrix = function () {
        if (this.modelviewMatrixStack.length === 0)
          throw new Error('Invalid modelviewPopMatrix!')

        this.modelviewMatrix = this.modelviewMatrixStack.pop()
      }
    }
    catch (e) {

    }

    if (!this.gl)
      // eslint-disable-next-line no-alert
      alert('Could not initialise WebGL, sorry :-(')
  }

  drawFrame() {
    // drawScene(this.gl);
    const gl = this.gl

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
    gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], this.clearColor[3])
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    mat4.perspective(gl.projectionMatrix, this.camera.fovy, gl.viewportWidth / gl.viewportHeight, this.camera.near, this.camera.far)

    const lookAtMatrix = mat4.create()
    mat4.lookAt(lookAtMatrix, this.camera.lookEye, this.camera.lookTarget, this.camera.lookAngle)
    mat4.multiply(gl.projectionMatrix, gl.projectionMatrix, lookAtMatrix)

    mat4.identity(this.gl.modelviewMatrix)
    this.gl.alpha = 1.0

    if (this.rootLayer)
      this.rootLayer.drawFrame(this.gl)
  }

  animate() {
    const timeNow = new Date().getTime()
    if (this.lastTime !== 0) {
      const elapsed = timeNow - this.lastTime

      if (this.rootLayer)
        this.rootLayer.animate(elapsed)
    }
    this.lastTime = timeNow
  }

  // Event
  resize(width, height) {
    this.gl.viewportWidth = width
    this.gl.viewportHeight = height
  }
}

class Layer {
  name: string
  parentLayer: any = null
  subLayers: any[] = []
  lighting: any = null
  mesh: any = null
  shader: any = null
  texture: any = null
  enableAnimation = false
  isHidden = false
  isLighting = false
  isOpaque = false
  alpha = 0.8
  blendfunc = 0

  animationMatrix: mat4
  modelviewMatrix: mat4
  projectionMatrix: mat4

  constructor(name) {
    this.name = name

    this.animationMatrix = mat4.create()
    mat4.identity(this.animationMatrix)
    this.modelviewMatrix = mat4.create()
    mat4.identity(this.modelviewMatrix)
    this.projectionMatrix = mat4.create()
    mat4.identity(this.projectionMatrix)
  }

  drawFrame(gl) {
    const shader = this.shader
    const mesh = this.mesh
    const texture = this.texture
    const lighting = this.lighting

    if (this.parentLayer != null) {
      this.shader === null && (this.shader = this.parentLayer.shader)
      this.mesh === null && (this.mesh = this.parentLayer.mesh)
      this.texture === null && (this.texture = this.parentLayer.texture)
      this.lighting === null && (this.lighting = this.parentLayer.lighting)
    }

    if (shader != null && shader.isLoaded === true) {
      // projection
      mat4.multiply(gl.projectionMatrix, gl.projectionMatrix, this.projectionMatrix)
      gl.uniformMatrix4fv(shader.program.pMatrixUniform, false, gl.projectionMatrix)

      // model view
      mat4.multiply(gl.modelviewMatrix, gl.modelviewMatrix, this.modelviewMatrix)
      gl.uniformMatrix4fv(shader.program.mvMatrixUniform, false, gl.modelviewMatrix)

      // normal
      const normalMatrix = mat3.create()
      mat3.normalFromMat4(normalMatrix, gl.modelviewMatrix)
      mat3.transpose(normalMatrix, normalMatrix)
      gl.uniformMatrix3fv(shader.program.nMatrixUniform, false, normalMatrix)

      // set buffer
      if (mesh != null && mesh.isLoaded === true) {
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer)
        gl.vertexAttribPointer(shader.program.vertexPositionAttribute, mesh.positionBuffer.itemSize, gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureCoordBuffer)
        gl.vertexAttribPointer(shader.program.textureCoordAttribute, mesh.textureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer)
        gl.vertexAttribPointer(shader.program.vertexNormalAttribute, mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0)
      }

      /* Texture test */
      if (texture != null && texture.bind(gl)) {
        gl.activeTexture(gl.TEXTURE0)
        gl.uniform1i(shader.program.samplerUniform, 0)
      }

      /* Lighting test */
      // eslint-disable-next-line no-lone-blocks
      {
        gl.uniform1i(shader.program.useLightingUniform, this.isLighting)
        if (this.isLighting) {
          gl.uniform3f(shader.program.ambientColorUniform, lighting.ambient[0], lighting.ambient[1], lighting.ambient[2])

          const adjustedLighting = vec3.create()

          vec3.normalize(lighting.direction, adjustedLighting)
          vec3.scale(adjustedLighting, adjustedLighting, lighting.specular)
          gl.uniform3fv(shader.program.lightingDirectionUniform, adjustedLighting)

          gl.uniform3f(shader.program.directionalColorUniform, lighting.diffuse[0], lighting.diffuse[1], lighting.diffuse[2])
        }
      }

      /* Blending test */
      // eslint-disable-next-line no-lone-blocks
      {
        if (this.blendfunc === 0)
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

        else
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE)

        gl.alpha *= this.alpha

        if (this.isOpaque) {
          gl.disable(gl.BLEND)
          gl.enable(gl.DEPTH_TEST)
          gl.uniform1f(shader.program.alphaUniform, 1.0)
        }
        else {
          gl.enable(gl.BLEND)
          gl.disable(gl.DEPTH_TEST)
          gl.uniform1f(shader.program.alphaUniform, gl.alpha)
        }
      }

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer)
      gl.drawElements(gl.TRIANGLES, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0)
    }

    for (let i = 0; i < this.subLayers.length; i++) {
      gl.modelviewPushMatrix()
      this.subLayers[i].drawFrame(gl)
      gl.modelviewPopMatrix()
    }
  }

  animate(elapsed) {
    if (this.enableAnimation === true)
      mat4.multiply(this.modelviewMatrix, this.animationMatrix, this.modelviewMatrix)

    for (let i = 0; i < this.subLayers.length; i++)
      this.subLayers[i].animate(elapsed)
  }

  // Layer relation
  addSubLayer(layer) {
    this.subLayers.push(layer)
    layer.parentLayer = this
  }

  removeSubLayer(layer) {
    for (let i = 0; i < this.subLayers.length; i++) {
      if (this.subLayers[i] === layer) {
        this.subLayers[i].parentLayer = null
        this.subLayers[i] = null
      }
    }
  }

  removeAllSubLayer(layer) {
    for (let i = 0; i < this.subLayers.length; i++)
      this.subLayers.pop().parentLayer = null
  }

  removeFromParentLayer() {
    if (this.parentLayer != null) {
      this.parentLayer.removeSubLayer(this)
      this.parentLayer = null
    }
  }

  findLayerByName(name) {
    if (this.name === name)
      return this

    for (let i = 0; i < this.subLayers.length; i++) {
      const found = this.subLayers[i].findLayerByName(name)
      if (found != null)
        return found
    }
    return null
  }

  // Unload
  unload() {
    this.removeFromParentLayer()

    for (let i = 0; i < this.subLayers.length; i++)
      this.subLayers.pop().unload()

    this.subLayers = null

    this.animationMatrix = null
    this.modelviewMatrix = null
    this.projectionMatrix = null

    this.lighting = null
    this.mesh = null
    this.shader = null
    this.texture = null
  }
}

class Mesh {
  name: string
  positionBuffer: any = null
  textureCoordBuffer: any = null
  normalBuffer: any = null
  indexBuffer: any = null
  isLoaded = false

  constructor(name) {
    this.name = name
  }

  load(gl) {
    /* Position */{
      const vertices = [
        -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, // Front face
        -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, // Back face
        -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, // Top face
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // Bottom face
        1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, // Right face
        -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, // Left face
      ]
      this.positionBuffer = this.loadArrayBuffer(gl, 3, 24, Float32Array, vertices)
    }

    /* Texture Coord */{
      const textureCoords = [
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, // Front face
        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // Back face
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, // Top face
        1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // Bottom face
        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // Right face
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, // Left face
      ]
      this.textureCoordBuffer = this.loadArrayBuffer(gl, 2, 24, Float32Array, textureCoords)
    }

    /* Normal */{
      const vertexNormals = [
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // Front face
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, // Back face
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // Top face
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // Bottom face
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // Right face
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // Left face
      ]
      this.normalBuffer = this.loadArrayBuffer(gl, 3, 24, Float32Array, vertexNormals)
    }

    /* Index */{
      const cubeVertexIndices = [
        0, 1, 2, 0, 2, 3, // Front face
        4, 5, 6, 4, 6, 7, // Back face
        8, 9, 10, 8, 10, 11, // Top face
        12, 13, 14, 12, 14, 15, // Bottom face
        16, 17, 18, 16, 18, 19, // Right face
        20, 21, 22, 20, 22, 23, // Left face
      ]
      this.indexBuffer = this.loadElementBuffer(gl, 1, 36, Uint16Array, cubeVertexIndices)
    }

    this.isLoaded = true
  }

  loadArrayBuffer(gl, size, count, type, data) {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    // eslint-disable-next-line new-cap
    gl.bufferData(gl.ARRAY_BUFFER, new type(data), gl.STATIC_DRAW)
    buffer.itemSize = size
    buffer.numItems = count

    return buffer
  }

  loadElementBuffer(gl, size, count, type, data) {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
    // eslint-disable-next-line new-cap
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new type(data), gl.STATIC_DRAW)
    buffer.itemSize = size
    buffer.numItems = count

    return buffer
  }

  unload(gl) {
    this.unloadBuffer(gl, this.positionBuffer)
    this.unloadBuffer(gl, this.textureCoordBuffer)
    this.unloadBuffer(gl, this.normalBuffer)
    this.unloadBuffer(gl, this.indexBuffer)
    this.positionBuffer = null
    this.textureCoordBuffer = null
    this.normalBuffer = null
    this.indexBuffer = null

    this.isLoaded = false
  }

  unloadBuffer(gl, buffer) {
    gl.deleteBuffer(buffer)
  }
}

class Shader {
  name: string
  program: any = null
  fragmentShader: any = null
  vertexShader: any = null
  fshSrc: any = null
  vshSrc: any = null
  isLoaded = false

  constructor(name) {
    this.name = name
  }

  load(gl) {
    this.fragmentShader = this.compileShader(gl, 'x-shader/x-fragment', this.fshSrc)
    this.vertexShader = this.compileShader(gl, 'x-shader/x-vertex', this.vshSrc)
    this.linkShader(gl)
  }

  compileShader(gl, type, source) {
    let shader
    if (type === 'x-shader/x-fragment')
      shader = gl.createShader(gl.FRAGMENT_SHADER)

    else if (type === 'x-shader/x-vertex')
      shader = gl.createShader(gl.VERTEX_SHADER)

    else
      return null

    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      // eslint-disable-next-line no-alert
      alert(gl.getShaderInfoLog(shader))
      return null
    }
    return shader
  }

  linkShader(gl) {
    const program = gl.createProgram()
    gl.attachShader(program, this.vertexShader)
    gl.attachShader(program, this.fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      // eslint-disable-next-line no-alert
      alert('Could not initialise shaders')
    }

    gl.useProgram(program)

    program.vertexPositionAttribute = gl.getAttribLocation(program, 'aVertexPosition')
    gl.enableVertexAttribArray(program.vertexPositionAttribute)
    program.textureCoordAttribute = gl.getAttribLocation(program, 'aTextureCoord')
    gl.enableVertexAttribArray(program.textureCoordAttribute)
    program.vertexNormalAttribute = gl.getAttribLocation(program, 'aVertexNormal')
    gl.enableVertexAttribArray(program.vertexNormalAttribute)

    program.pMatrixUniform = gl.getUniformLocation(program, 'uPMatrix')
    program.mvMatrixUniform = gl.getUniformLocation(program, 'uMVMatrix')
    program.nMatrixUniform = gl.getUniformLocation(program, 'uNMatrix')
    program.samplerUniform = gl.getUniformLocation(program, 'uSampler')
    program.useLightingUniform = gl.getUniformLocation(program, 'uUseLighting')
    program.ambientColorUniform = gl.getUniformLocation(program, 'uAmbientColor')
    program.lightingDirectionUniform = gl.getUniformLocation(program, 'uLightingDirection')
    program.directionalColorUniform = gl.getUniformLocation(program, 'uDirectionalColor')
    program.alphaUniform = gl.getUniformLocation(program, 'uAlpha')

    this.program = program

    this.isLoaded = true
  }

  unload(gl) {
    gl.deleteShader(this.vertexShader)
    gl.deleteShader(this.fragmentShader)
    gl.deleteProgram(this.program)
    this.vertexShader = null
    this.fragmentShader = null
    this.program = null

    this.isLoaded = false
  }
}

export default {
  name: 'MyWebglView',
  data() {
    return {
      canvas: null,
      context: null,
      renderer: null,
      width: 0,
      height: 0,
      play: true,
    }
  },
  mounted() {
    const canvas = this.$el as HTMLCanvasElement
    // const context = canvas.getContext('2d')
    this.width = canvas.width = canvas.clientWidth
    this.height = canvas.height = canvas.clientHeight
    this.canvas = canvas
    // this.context = context

    // context.font = '30px verdana'
    // context.strokeStyle = 'blue'
    // context.strokeText('Hello World!!', 40, 40)

    this.createWebGL(canvas)
  },
  methods: {
    createWebGL(canvas: HTMLCanvasElement) {
      const renderer = new Renderer(canvas, {})
      this.renderer = renderer

      const mycamera = new Camera('DefaultCamera')
      renderer.camera = mycamera

      const mylighting = new Lighting('DefaultLighting')

      const mymesh = new Mesh('Cube')
      mymesh.load(renderer.gl)

      const myshader = new Shader('DefaultShader')
      myshader.fshSrc = [
        'precision mediump float;',
        '',
        'uniform sampler2D uSampler;',
        'uniform float uAlpha;',
        '',
        'varying vec2 vTextureCoord;',
        'varying vec3 vLightWeighting;',
        '',
        'void main(void) {',
        '  //lv.1 Color',
        '  //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);',
        '  //lv.2 Texture',
        '  //gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));',
        '  //lv.3 +Lighting',
        '  vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));',
        // '  gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a * uAlpha);',
        '  gl_FragColor = vec4(vec3(1, vTextureCoord.s, vTextureCoord.t) * vLightWeighting, textureColor.a * uAlpha);',
        '}',
      ].join('\n')
      myshader.vshSrc = [
        'attribute vec3 aVertexPosition;',
        'attribute vec2 aTextureCoord;',
        'attribute vec3 aVertexNormal;',
        '',
        'uniform mat4 uMVMatrix;',
        'uniform mat4 uPMatrix;',
        'uniform mat3 uNMatrix;',
        '',
        'uniform vec3 uAmbientColor;',
        'uniform vec3 uLightingDirection;',
        'uniform vec3 uDirectionalColor;',
        '',
        'uniform bool uUseLighting;',
        '',
        'varying vec2 vTextureCoord;',
        'varying vec3 vLightWeighting;',
        '',
        'void main(void) {',
        '  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',
        '  vTextureCoord = aTextureCoord;',
        '',
        '  if (!uUseLighting) {',
        '    vLightWeighting = vec3(1.0, 1.0, 1.0);',
        '  } else {',
        '    vec3 transformedNormal = uNMatrix * aVertexNormal;',
        '    float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);',
        '    vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;',
        '  }',
        '}',
      ].join('\n')
      myshader.load(renderer.gl)

      renderer.gl.clearColor(0.0, 0.0, 0.0, 0.0)
      renderer.gl.clear(renderer.gl.COLOR_BUFFER_BIT)
      renderer.gl.enable(renderer.gl.DEPTH_TEST)
      renderer.gl.enable(renderer.gl.CULL_FACE)
      {
        const layer = new Layer('RootLayer')
        layer.lighting = mylighting
        layer.mesh = mymesh
        layer.shader = myshader
        // layer.texture = mytexture;
        renderer.rootLayer = layer

        mat4.rotate(layer.animationMatrix, layer.animationMatrix, this.degToRad(3), [0.0, 1.0, 0.0])
        layer.enableAnimation = true

        const layer1 = new Layer('Layer1')
        const layer2 = new Layer('Layer2')
        layer.addSubLayer(layer1)
        layer1.addSubLayer(layer2)

        mat4.rotate(layer2.animationMatrix, layer2.animationMatrix, this.degToRad(6), [0.0, 0.0, 1.0])
        layer2.enableAnimation = true
      }

      requestAnimationFrame(() => this.animate())
    },
    degToRad(degrees) {
      return degrees * Math.PI / 180
    },
    animate() {
      this.renderer.drawFrame()
      this.renderer.animate()

      requestAnimationFrame(() => this.animate())
    },
  },
}
</script>

<template>
  <canvas width="300" height="200" />
</template>

<style scoped>
</style>
