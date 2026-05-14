import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, useTexture } from '@react-three/drei'
import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { PLANTS, getPlantById, GROUND_TYPES, getGroundById } from './plants'

const STORAGE_KEY = 'garden-sandbox-v1'

function Ground({ onClick, groundType }) {
  return groundType.texture ? (
    <TexturedGround onClick={onClick} groundType={groundType} />
  ) : (
    <SolidGround onClick={onClick} groundType={groundType} />
  )
}

function TexturedGround({ onClick, groundType }) {
  const texture = useTexture(groundType.texture)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(8, 8)

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={onClick}
      receiveShadow
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

function SolidGround({ onClick, groundType }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={onClick}
      receiveShadow
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color={groundType.color} />
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

function Scene({ selectedPlantId, plants, setPlants, groundType }) {
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
      <Ground onClick={handleGroundClick} groundType={groundType} />
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

function PlantPicker({ selectedPlantId, onSelect, onClearGarden, groundTypeId, onGroundSelect }) {
  const [isOpen, setIsOpen] = useState(true)
  const [holdProgress, setHoldProgress] = useState(0)
  const holdTimerRef = useRef(null)
  const holdStartRef = useRef(null)

  const startHold = () => {
    holdStartRef.current = Date.now()
    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current
      const progress = Math.min(elapsed / 1000, 1)
      setHoldProgress(progress)
      if (progress >= 1) {
        clearInterval(holdTimerRef.current)
        onClearGarden()
        setHoldProgress(0)
      }
    }, 16)
  }

  const cancelHold = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current)
      holdTimerRef.current = null
    }
    setHoldProgress(0)
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 10,
        maxWidth: 220,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 14,
          fontWeight: 600,
          color: '#2d3a1f',
        }}
      >
        <span>Plant Picker</span>
        <span style={{ fontSize: 12, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div style={{ padding: '0 16px 16px 16px' }}>
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

          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #e0e0e0' }}>
            <h4 style={{ fontSize: 12, fontWeight: 600, color: '#2d3a1f', marginBottom: 8 }}>
              Ground
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {GROUND_TYPES.map((ground) => {
                const isSelected = ground.id === groundTypeId
                return (
                  <button
                    key={ground.id}
                    onClick={() => onGroundSelect(ground.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: 6,
                      border: isSelected ? '2px solid #4a7c3a' : '2px solid transparent',
                      background: isSelected ? '#e8f3df' : '#f5f5f5',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        background: ground.color,
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                    <span style={{ color: '#333' }}>{ground.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchStart={startHold}
            onTouchEnd={cancelHold}
            style={{
              marginTop: 12,
              width: '100%',
              padding: '8px 12px',
              background: `linear-gradient(to right, #8b1f1f ${holdProgress * 100}%, #c14545 ${holdProgress * 100}%)`,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              userSelect: 'none',
              transition: 'background 0.05s linear',
            }}
          >
            {holdProgress > 0 ? 'Keep holding...' : 'Hold to Clear Garden'}
          </button>
          <p style={{ marginTop: 8, fontSize: 11, color: '#666', lineHeight: 1.4 }}>
            Click ground to place. Click plant to delete. Hold red button 1 second to clear.
          </p>
        </div>
      )}
    </div>
  )
}

function App() {
  const [selectedPlantId, setSelectedPlantId] = useState('oak')
  const [groundTypeId, setGroundTypeId] = useState('grass')
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
        groundTypeId={groundTypeId}
        onGroundSelect={setGroundTypeId}
      />
      <Canvas
        shadows
        camera={{ position: [10, 10, 10], fov: 50 }}
      >
        <Scene
          selectedPlantId={selectedPlantId}
          plants={plants}
          setPlants={setPlants}
          groundType={getGroundById(groundTypeId)}
        />
      </Canvas>
    </div>
  )
}

export default App