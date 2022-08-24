import { Canvas, useFrame } from "@react-three/fiber"
import "./App.css"
import Sketch from "./Sketch"
import * as THREE from "three"

const Rig = () =>
  useFrame(({ mouse, camera }) => {
    camera.position.lerp(new THREE.Vector3(mouse.x, mouse.y, 5), 0.05)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
  })

const App = () => (
  <div className='App'>
    <Canvas>
      <Rig />
      <Sketch />
    </Canvas>
    <div className='background'>
      <h1>Hello world!</h1>
    </div>
  </div>
)

export default App
