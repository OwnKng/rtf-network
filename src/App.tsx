import { OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import "./App.css"
import Sketch from "./Sketch"

const App = () => (
  <div className='App'>
    <Canvas>
      <OrbitControls />
      <Sketch />
    </Canvas>
  </div>
)

export default App
