import * as THREE from '/three/build/three.module.js'
import WebGLcheck from '/js/compatibility-check.js'
import * as dat from '/js/dat.gui.min.js'
import { BoxLineGeometry } from 'https://cdn.skypack.dev/three@0.135/examples/jsm/geometries/BoxLineGeometry.js'
import { XRControllerModelFactory } from 'https://cdn.skypack.dev/three@0.135/examples/jsm/webxr/XRControllerModelFactory.js'

//cần sửa lại đường dẫn mặc định của module three trong các file examples từ from 'three' thành  from '../../../build/three.module.js'
import { OrbitControls } from '/three/examples/jsm/controls/OrbitControls.js'

const renderer = new THREE.WebGL1Renderer()
const textureLoader = new THREE.TextureLoader()
renderer.shadowMap.enabled = true
renderer.setPixelRatio(window.devicePixelRatio)

const scene = new THREE.Scene()

/**
 * add GUI
 */
const gui = new dat.GUI()
const options = {
	'Sphere color': '#ffea00',
	'Sphere wireframe': false,
	'Sphere jump speed': 0.01,
	'dLight shadow': false,
	'sLight shadow': true,
	'sLight angle': 0.3,
	'sLight penumbra': 0.1,
	'sLight intensity': 1,
	WebXR: false
}

gui.addColor(options, 'Sphere color').onChange(function (e) {
	sphere.material.color.set(e)
})

gui.add(options, 'Sphere wireframe').onChange(function (e) {
	sphere.material.wireframe = e
})
gui.add(options, 'Sphere jump speed', 0, 0.1).onChange(function (e) {
	sphere.material.wireframe = e
})
gui.add(options, 'dLight shadow').onChange(function (e) {
	directionalLight.castShadow = e
})

gui.add(options, 'sLight shadow').onChange(function (e) {
	spotLight.castShadow = e
})

gui.add(options, 'sLight angle', 0, 1)

gui.add(options, 'sLight penumbra', 0, 1)

gui.add(options, 'sLight intensity', 0, 1)

gui.add(options, 'WebXR').onChange(function (e) {
	renderer.xr.enabled = e
	camera.updateProjectionMatrix()
	const controllerModelFactory = new XRControllerModelFactory()

	// controller
	const controller = renderer.xr.getController(0)
	scene.add(controller)

	const controllerGrip = renderer.xr.getControllerGrip(0)
	controllerGrip.add(
		controllerModelFactory.createControllerModel(controllerGrip)
	)
	scene.add(controllerGrip)

	// controller
	const controller1 = renderer.xr.getController(1)
	scene.add(controller1)

	const controllerGrip1 = renderer.xr.getControllerGrip(1)
	controllerGrip1.add(
		controllerModelFactory.createControllerModel(controllerGrip1)
	)
	scene.add(controllerGrip1)

	//
	const geometry = new THREE.BufferGeometry().setFromPoints([
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, -1)
	])

	const line = new THREE.Line(geometry)
	line.name = 'line'
	line.scale.z = 10

	controller.add(line.clone())
	controller1.add(line.clone())

	const selectPressed = false

	console.log('WebXR enabled = ' + e, renderer.xr)
})

/**
 * add environment effects
 */

/** fog effect setting */
scene.fog = new THREE.FogExp2(0xffffff, 0.015)
// scene.fog = new THREE.Fog(0xffffff,0, 200)

/** scene background  setting */
// renderer.setClearColor(0xffea00)
const stars = '/asset/img/stars.jpg'
const nebula = '/asset/img/nebula.jpg'
scene.background = textureLoader.load(stars)

/** ambient light effect setting */
const ambientLight = new THREE.AmbientLight(0x333333)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.set(-30, 50, 0)
directionalLight.castShadow = false
directionalLight.shadow.camera.bottom = -10
scene.add(directionalLight)

const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 30)
// scene.add(dLightHelper)

const dLightShadowHelper = new THREE.CameraHelper(
	directionalLight.shadow.camera
)
// scene.add(dLightShadowHelper)

/** spot light effect setting */
const spotLight = new THREE.SpotLight(0xff0000)
spotLight.position.set(30, 30, 15)
scene.add(spotLight)

const sLightHelper = new THREE.SpotLightHelper(spotLight)
scene.add(sLightHelper)

const sLightShadowHelper = new THREE.CameraHelper(spotLight.shadow.camera)
// scene.add(sLightShadowHelper)

// camera parameters: field od view, with/height, near(distance form camera to near plan) and far (distance form camera to far plan)
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
)
const orbit = new OrbitControls(camera, renderer.domElement)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
camera.position.set(15, 15, 15)
camera.lookAt(0, 0, 0)
orbit.update()

/**
 * add xyz axis, x red, y green, z blue
 */
const axesHelper = new THREE.AxesHelper(100)
axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff)
scene.add(axesHelper)

/**
 * add a xz grid plane
 */
const gridsHelper = new THREE.GridHelper(30, 30)
scene.add(gridsHelper)

/**
 * add a sample plane
 */
const planeGeometry = new THREE.PlaneGeometry(30, 30)
const planeMaterial = new THREE.MeshStandardMaterial({
	color: 0xffffff,
	side: THREE.DoubleSide
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.rotation.x = -0.5 * Math.PI
plane.receiveShadow = true
scene.add(plane)

/**
 * add a cube
 */
const boxGeometry = new THREE.BoxGeometry()
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
const box = new THREE.Mesh(boxGeometry, boxMaterial)
box.position.set(0, 2, 0)
box.castShadow = true
box.receiveShadow = true
scene.add(box)

/**
 * add a sphere
 */
const sphereGeometry = new THREE.SphereGeometry(5, 100, 100)
const sphereMaterial = new THREE.MeshStandardMaterial({
	color: 0x0000ff,
	wireframe: false
})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphere.position.set(-5, 10, 0)
sphere.castShadow = true
scene.add(sphere)

/**
 * set a example animation
 */
let step = 0
function setUp() {
	spotLight.castShadow = options['sLight shadow']
	spotLight.angle = options['sLight angle']
	spotLight.penumbra = options['sLight penumbra']
	spotLight.intensity = options['sLight intensity']
	sLightHelper.update(spotLight)
}

function maintainScene() {
	window.addEventListener('resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
		renderer.setSize(window.innerWidth, window.innerHeight)
	})
}
maintainScene()

function cubeRotate(fps) {
	box.rotation.x += fps / 1000
	box.rotation.y += fps / 1000
}

function sphereJump() {
	step += options['Sphere jump speed']
	sphere.position.y = 10 * Math.abs(Math.sin(step))
}

function mainLoop() {
	setUp()
	cubeRotate(30)
	sphereJump()
	renderer.render(scene, camera)
}

/**
 * main loop
 */
if (WebGLcheck.isWebGLAvailable()) {
	renderer.setAnimationLoop(mainLoop)
} else {
	const warning = WebGLcheck.getWebGLErrorMessage()
	document.getElementById('container').appendChild(warning)
}
