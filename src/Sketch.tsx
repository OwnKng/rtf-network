import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

const numberOfParticles = 100
const numberOfSegments = numberOfParticles ** 2
const minDistance = 1

const width = 5
const height = 5
const depth = 5

const Sketch = () => {
  const particlesRef = useRef<THREE.Points>(null!)
  const linesRef = useRef<THREE.LineSegments>(null!)

  let [particlePositions, linePositions, particlesVelocity] = useMemo(() => {
    const particlePositions = Float32Array.from(
      new Array(numberOfParticles)
        .fill(0)
        .flatMap(() => [
          Math.random() * 5,
          Math.random() * 5,
          Math.random() * 5,
        ])
    )

    const particlesVelocity = Array.from(
      { length: numberOfParticles },
      () => new THREE.Vector3(0.001, 0.001, 0.001)
    )

    const linePositions = new Float32Array(numberOfSegments * 3)

    return [particlePositions, linePositions, particlesVelocity]
  }, [])

  useFrame(() => {
    let vertexPosition = 0
    let numConnected = 0

    for (let i = 0; i < numberOfParticles; i++) {
      for (let j = i + 1; j < numberOfParticles; j++) {
        //_ modify the positions
        const velocity = particlesVelocity[i]

        particlePositions[i * 3 + 0] += velocity.x
        particlePositions[i * 3 + 1] += velocity.y
        particlePositions[i * 3 + 2] += velocity.z

        //_ check the edges
        if (particlePositions[i * 3] > width) velocity.x *= -1
        if (particlePositions[i * 3] < 0) velocity.x *= -1

        if (particlePositions[i * 3 + 1] > height) velocity.y *= -1
        if (particlePositions[i * 3 + 1] < 0) velocity.y *= -1

        if (particlePositions[i * 3 + 2] > depth) velocity.z *= -1
        if (particlePositions[i * 3 + 2] < 0) velocity.z *= -1

        //_ calculate distance
        const dx = particlePositions[i * 3] - particlePositions[j * 3]
        const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1]
        const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        //_ draw lines
        if (dist < minDistance) {
          linePositions[vertexPosition++] = particlePositions[i * 3 + 0]
          linePositions[vertexPosition++] = particlePositions[i * 3 + 1]
          linePositions[vertexPosition++] = particlePositions[i * 3 + 2]

          linePositions[vertexPosition++] = particlePositions[j * 3 + 0]
          linePositions[vertexPosition++] = particlePositions[j * 3 + 1]
          linePositions[vertexPosition++] = particlePositions[j * 3 + 2]

          numConnected++
        }
      }
    }

    linesRef.current.geometry.setDrawRange(0, numConnected * 2)
    particlesRef.current.geometry.attributes.position.needsUpdate = true
    linesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <>
      <mesh>
        <boxBufferGeometry args={[width, height, depth]} />
        <meshBasicMaterial wireframe />
      </mesh>
      <points
        ref={particlesRef}
        position={[-width / 2, -height / 2, -depth / 2]}
      >
        <bufferGeometry>
          <bufferAttribute
            attach={"attributes-position"}
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.1} />
      </points>
      <lineSegments
        ref={linesRef}
        position={[-width / 2, -height / 2, -depth / 2]}
      >
        <bufferGeometry drawRange={{ start: 0, count: 0 }}>
          <bufferAttribute
            attach={"attributes-position"}
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color='teal' />
      </lineSegments>
    </>
  )
}

export default Sketch
