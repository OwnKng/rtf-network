import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

const numberOfParticles = 400
const numberOfSegments = numberOfParticles ** 2
const minDistance = 0.6
const maxConnections = 20

const width = 14
const height = 2
const depth = 1

const halfWidth = width * 0.5
const halfHeight = height * 0.5
const halfDepth = depth * 0.5

const Sketch = () => {
  const linesRef = useRef<THREE.LineSegments>(null!)
  const groupRef = useRef<THREE.Group>(null!)

  let [particlePositions, linePositions, particlesData, lineColors] =
    useMemo(() => {
      const particlePositions = Float32Array.from(
        new Array(numberOfParticles)
          .fill(0)
          .flatMap(() => [
            Math.random() * width - width * 0.5,
            Math.random() * height - height * 0.5,
            Math.random() * depth - depth * 0.5,
          ])
      )

      const particlesData = Array.from({ length: numberOfParticles }, () => ({
        velocity: new THREE.Vector3(
          0.0001 * (0.5 - Math.random()),
          0.0001 * (0.5 - Math.random()),
          0.0001 * (0.5 - Math.random())
        ),
        numberOfConnections: 0,
      }))

      const linePositions = new Float32Array(numberOfSegments * 3)
      const lineColors = new Float32Array(numberOfSegments * 4)

      return [particlePositions, linePositions, particlesData, lineColors]
    }, [])

  useFrame(() => {
    let vertexPosition = 0
    let colorsPosition = 0
    let numConnected = 0

    particlesData = particlesData.map((p) => ({ ...p, numberOfConnections: 0 }))

    for (let i = 0; i < numberOfParticles; i++) {
      const particleData = particlesData[i]

      for (let j = i + 1; j < numberOfParticles; j++) {
        //_ modify the positions
        const velocity = particleData.velocity

        particlePositions[i * 3 + 0] += velocity.x
        particlePositions[i * 3 + 1] += velocity.y
        particlePositions[i * 3 + 2] += velocity.z

        //_ check the edges

        // prettier-ignore
        if (particlePositions[i * 3] > halfWidth || particlePositions[i * 3] < -halfWidth) velocity.x *= -1
        // prettier-ignore
        if (particlePositions[i * 3 + 1] > halfHeight || particlePositions[i * 3 + 1] < -halfHeight) velocity.y *= -1
        // prettier-ignore
        if (particlePositions[i * 3 + 2] > halfDepth || particlePositions[i * 3 + 2] < -halfDepth) velocity.z *= -1

        //_ calculate distance
        const dx = particlePositions[i * 3] - particlePositions[j * 3]
        const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1]
        const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        //_ calculate number of local connections
        const nextParticleData = particlesData[j]

        if (nextParticleData.numberOfConnections >= maxConnections) continue

        //_ draw lines
        if (dist < minDistance) {
          particleData.numberOfConnections++
          nextParticleData.numberOfConnections++

          const alpha = 1.0 - dist / minDistance

          linePositions[vertexPosition++] = particlePositions[i * 3 + 0]
          linePositions[vertexPosition++] = particlePositions[i * 3 + 1]
          linePositions[vertexPosition++] = particlePositions[i * 3 + 2]

          linePositions[vertexPosition++] = particlePositions[j * 3 + 0]
          linePositions[vertexPosition++] = particlePositions[j * 3 + 1]
          linePositions[vertexPosition++] = particlePositions[j * 3 + 2]

          lineColors[colorsPosition++] = alpha
          lineColors[colorsPosition++] = alpha
          lineColors[colorsPosition++] = alpha
          lineColors[colorsPosition++] = alpha

          lineColors[colorsPosition++] = alpha
          lineColors[colorsPosition++] = alpha
          lineColors[colorsPosition++] = alpha
          lineColors[colorsPosition++] = alpha

          numConnected++
        }
      }
    }

    linesRef.current.geometry.setDrawRange(0, numConnected * 2)
    linesRef.current.geometry.attributes.position.needsUpdate = true
    linesRef.current.geometry.attributes.color.needsUpdate = true
  })

  return (
    <group ref={groupRef}>
      <lineSegments ref={linesRef}>
        <bufferGeometry drawRange={{ start: 0, count: 0 }}>
          <bufferAttribute
            attach={"attributes-position"}
            args={[linePositions, 3]}
          />
          <bufferAttribute attach={"attributes-color"} args={[lineColors, 4]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  )
}

export default Sketch
