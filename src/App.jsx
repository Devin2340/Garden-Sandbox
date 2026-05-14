import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import { useState, useRef } from 'react'

function Ground({ onClick }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={onClick}
      receiveShadow
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#4a7c3a" />
    </mesh>
  )
}

function Plant({ position, onClick }) {
  return (
    <mesh position={position} onClick={onClick} castShadow>
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshStandardMaterial color="#2d5016" />
    </mesh>
  )
}

function Scene() {const orbitRef = useRef()

const handleControlsChange = () => {
  if (orbitRef.current && orbitRef.current.target.y < 0) {
    orbitRef.current.target.y = 0
  }
}
  const [plants, setPlants] = useState([])

  const handleGroundClick = (event) => {
    event.stopPropagation()
    const point = event.point
    const newPlant = {
      id: Date.now(),
      position: [point.x, 0.5, point.z],
    }
    setPlants([...plants, newPlant])
  }

  const handlePlantClick = (event, id) => {
    event.stopPropagation()
    setPlants(plants.filter((p) => p.id !== id))
  }

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
  position={[100, 20, 100]}
  intensity={1.2}
  castShadow
  shadow-mapSize-width={2048}
  shadow-mapSize-height={2048}
  shadow-camera-left={-15}
  shadow-camera-right={15}
  shadow-camera-top={15}
  shadow-camera-bottom={-15}
/>
      <Sky 
  distance={450000}
  sunPosition={[100, 20, 100]}
  inclination={0.5}
  azimuth={4}
  rayleigh={4}
  turbidity={10}
  mieCoefficient={0.005}
  mieDirectionalG={0.8}
/> 
      <Ground onClick={handleGroundClick} />
      {plants.map((plant) => (
        <Plant
          key={plant.id}
          position={plant.position}
          onClick={(e) => handlePlantClick(e, plant.id)}
        />
      ))}
      <OrbitControls 
  ref={orbitRef}
  onChange={handleControlsChange}
  maxPolarAngle={Math.PI / 2 - 0.05}
  minDistance={5}
  maxDistance={55}
  enableDamping
  dampingFactor={0.05}
  panSpeed={1.2}
  rotateSpeed={0.7}
  screenSpacePanning={false}
/> 
    </>
  )
}

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        shadows
        camera={{ position: [10, 10, 10], fov: 50 }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}

export default App