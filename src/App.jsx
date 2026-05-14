import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import { useState, useRef, useEffect } from 'react'
import { PLANTS, getPlantById } from './plants'

const STORAGE_KEY = 'garden-sandbox-v1'

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

function Plant({ position, plantId, onClick }) {
  const plant = getPlantById(plantId)
  if (!plant) return null

  return (
    <group position={position} onClick={onClick}>
      {plant.parts.map((part, index) => (
        <mesh key={index} position={part.position} castShadow>
          {part.shape === 'cylinder' && <cylinderGeometry args={part.args} />}
          {part.shape === 'sphere' && <sphereGeometry args={part.args} />}
          {part.shape === 'cone' && <coneGeometry args={part.args} />}
          {part.shape === 'box' && <boxGeometry args={part.args} />}
          <meshStandardMaterial color={part.color} />
        </mesh>
      ))}
    </group>
  )
}

function Scene({ selectedPlantId, plants, setPlants }) {
  const orbitRef = useRef()

  const handleControlsChange = () => {
    if (orbitRef.current && orbitRef.current.target.y < 0) {
      orbitRef.current.target.y = 0
    }
  }

  const handleGroundClick = (event) => {
    event.stopPropagation()
    const point = event.point
    const newPlant = {
      id: Date.now(),
      plantId: selectedPlantId,
      position: [point.x, 0, point.z],
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
        azimuth={0.25}
        rayleigh={2}
        turbidity={10}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      <Ground onClick={handleGroundClick} />
      {plants.map((plant) => (
        <Plant
          key={plant.id}
          plantId={plant.plantId}
          position={plant.position}
          onClick={(e) => handlePlantClick(e, plant.id)}
        />
      ))}
      <OrbitControls
        ref={orbitRef}
        onChange={handleControlsChange}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={5}
        maxDistance={30}
        enableDamping
        dampingFactor={0.05}
        panSpeed={1.2}
        rotateSpeed={0.7}
        screenSpacePanning={false}
      />
    </>
  )
}

function PlantPicker({ selectedPlantId, onSelect, onClearGarden }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 10,
        maxWidth: 220,
      }}
    >
      <h3 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600, color: '#2d3a1f' }}>
        Plant Picker
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {PLANTS.map((plant) => {
          const isSelected = plant.id === selectedPlantId
          return (
            <button
              key={plant.id}
              onClick={() => onSelect(plant.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: 8,
                border: isSelected ? '2px solid #4a7c3a' : '2px solid transparent',
                background: isSelected ? '#e8f3df' : '#f5f5f5',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 11,
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: plant.color,
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              />
              <span style={{ color: '#333' }}>{plant.name}</span>
            </button>
          )
        })}
      </div>
      <button
        onClick={() => {
          if (window.confirm('Clear the entire garden? This cannot be undone.')) {
            onClearGarden()
          }
        }}
        style={{
          marginTop: 12,
          width: '100%',
          padding: '8px 12px',
          background: '#c14545',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        Clear Garden
      </button>
      <p style={{ marginTop: 8, fontSize: 11, color: '#666', lineHeight: 1.4 }}>
        Click ground to place. Click plant to delete. Garden saves automatically.
      </p>
    </div>
  )
}

function App() {
  const [selectedPlantId, setSelectedPlantId] = useState('oak')
  const [plants, setPlants] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Failed to load saved garden:', e)
    }
    return []
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plants))
    } catch (e) {
      console.warn('Failed to save garden:', e)
    }
  }, [plants])

  const handleClearGarden = () => {
    setPlants([])
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <PlantPicker
        selectedPlantId={selectedPlantId}
        onSelect={setSelectedPlantId}
        onClearGarden={handleClearGarden}
      />
      <Canvas
        shadows
        camera={{ position: [10, 10, 10], fov: 50 }}
      >
        <Scene
          selectedPlantId={selectedPlantId}
          plants={plants}
          setPlants={setPlants}
        />
      </Canvas>
    </div>
  )
}

export default App