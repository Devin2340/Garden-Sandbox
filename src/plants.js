// Each plant definition includes:
// - id: unique string used to identify the plant type
// - name: display name for the UI
// - color: a representative color for the picker swatch
// - parts: array of meshes that make up the plant
//
// Each part has:
// - shape: 'cylinder' | 'sphere' | 'cone' | 'box'
// - args: arguments for the geometry (different per shape)
// - position: [x, y, z] relative to the plant's base
// - color: hex color string

export const PLANTS = [
  {
    id: 'oak',
    name: 'Oak Tree',
    color: '#2d5016',
    parts: [
      // Trunk
      { shape: 'cylinder', args: [0.1, 0.15, 1.2, 8], position: [0, 0.6, 0], color: '#5c3a1e' },
      // Foliage
      { shape: 'sphere', args: [0.6, 12, 12], position: [0, 1.5, 0], color: '#2d5016' },
    ],
  },
  {
    id: 'pine',
    name: 'Pine Tree',
    color: '#1a3d0d',
    parts: [
      // Trunk
      { shape: 'cylinder', args: [0.08, 0.12, 1.0, 8], position: [0, 0.5, 0], color: '#3d2511' },
      // Three stacked cones for layered pine look
      { shape: 'cone', args: [0.55, 0.8, 12], position: [0, 1.2, 0], color: '#1a3d0d' },
      { shape: 'cone', args: [0.4, 0.7, 12], position: [0, 1.7, 0], color: '#1a3d0d' },
      { shape: 'cone', args: [0.25, 0.6, 12], position: [0, 2.1, 0], color: '#1a3d0d' },
    ],
  },
  {
    id: 'bush',
    name: 'Bush',
    color: '#3a6b1f',
    parts: [
      // Three clustered spheres for irregular shape
      { shape: 'sphere', args: [0.35, 10, 10], position: [-0.15, 0.3, 0], color: '#3a6b1f' },
      { shape: 'sphere', args: [0.4, 10, 10], position: [0.15, 0.35, 0.1], color: '#3a6b1f' },
      { shape: 'sphere', args: [0.3, 10, 10], position: [0, 0.5, -0.15], color: '#3a6b1f' },
    ],
  },
  {
    id: 'flower',
    name: 'Flower',
    color: '#e84a5f',
    parts: [
      // Stem
      { shape: 'cylinder', args: [0.02, 0.02, 0.6, 6], position: [0, 0.3, 0], color: '#3a6b1f' },
      // Bloom
      { shape: 'sphere', args: [0.1, 8, 8], position: [0, 0.65, 0], color: '#e84a5f' },
    ],
  },
  {
    id: 'fern',
    name: 'Fern',
    color: '#4a8b2c',
    parts: [
      // Low spreading sphere flattened by scale (we'll fake this with a wider/shorter sphere)
      { shape: 'sphere', args: [0.45, 10, 6], position: [0, 0.2, 0], color: '#4a8b2c' },
    ],
  },
  {
    id: 'rock',
    name: 'Rock',
    color: '#6b6b6b',
    parts: [
      { shape: 'sphere', args: [0.3, 6, 6], position: [0, 0.2, 0], color: '#6b6b6b' },
    ],
  },
  {
    id: 'mushroom',
    name: 'Mushroom',
    color: '#c14545',
    parts: [
      // Stem
      { shape: 'cylinder', args: [0.06, 0.08, 0.25, 8], position: [0, 0.12, 0], color: '#f0e8d4' },
      // Cap
      { shape: 'sphere', args: [0.15, 10, 8], position: [0, 0.28, 0], color: '#c14545' },
    ],
  },
]

// Helper to look up a plant by id
export function getPlantById(id) {
  return PLANTS.find((p) => p.id === id)
}