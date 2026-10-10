'use client'

import React, { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// ==========================================
// 3D GLB ASSET AUTO-SCALER (100% REAL-WORLD HUMAN SCALE IN METERS)
// ==========================================
export function AutoScaledGLB({
  url,
  preRotation,
  filterMesh,
  targetDimensions,
  targetHeight,
  targetWidth,
  targetDepth,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  castShadow = true,
  receiveShadow = true,
  materialTweaks
}: {
  url: string
  preRotation?: [number, number, number]
  filterMesh?: (mesh: THREE.Mesh) => boolean
  targetDimensions?: [number, number, number] // [X, Y, Z] in exact meters
  targetHeight?: number
  targetWidth?: number
  targetDepth?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  castShadow?: boolean
  receiveShadow?: boolean
  materialTweaks?: (mat: THREE.Material) => void
}) {
  const { scene } = useGLTF(url)

  const wrapper = useMemo(() => {
    const c = scene.clone()

    if (preRotation) {
      c.rotation.set(...preRotation)
    }
    c.updateMatrixWorld(true)

    c.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = castShadow
        mesh.receiveShadow = receiveShadow
        if (filterMesh && !filterMesh(mesh)) {
          mesh.visible = false
        }
        if (mesh.name.includes('Plane')) {
          mesh.visible = false
        }
        if (materialTweaks && mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(materialTweaks)
          } else {
            materialTweaks(mesh.material)
          }
        }
      }
    })

    const inner = new THREE.Group()
    inner.add(c)
    inner.updateMatrixWorld(true)

    const box = new THREE.Box3()
    inner.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (mesh.isMesh && mesh.visible) {
        mesh.geometry.computeBoundingBox()
        if (mesh.geometry.boundingBox) {
          const b = mesh.geometry.boundingBox.clone()
          b.applyMatrix4(mesh.matrixWorld)
          box.union(b)
        }
      }
    })

    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    let sx = 1.0
    let sy = 1.0
    let sz = 1.0

    if (targetDimensions) {
      if (size.x > 0) sx = targetDimensions[0] / size.x
      if (size.y > 0) sy = targetDimensions[1] / size.y
      if (size.z > 0) sz = targetDimensions[2] / size.z
    } else if (targetHeight && size.y > 0) {
      const s = targetHeight / size.y
      sx = s
      sy = s
      sz = s
    } else if (targetWidth && size.x > 0) {
      const s = targetWidth / size.x
      sx = s
      sy = s
      sz = s
    } else if (targetDepth && size.z > 0) {
      const s = targetDepth / size.z
      sx = s
      sy = s
      sz = s
    }

    inner.position.set(-center.x, -box.min.y, -center.z)

    const outer = new THREE.Group()
    outer.add(inner)
    outer.scale.set(sx, sy, sz)
    return outer
  }, [
    scene,
    preRotation,
    filterMesh,
    targetDimensions,
    targetHeight,
    targetWidth,
    targetDepth,
    castShadow,
    receiveShadow,
    materialTweaks
  ])

  return <primitive object={wrapper} position={position} rotation={rotation} />
}

// Preload models
useGLTF.preload('/models/case_000/phich-nuoc__hot_water_flask.glb')
useGLTF.preload('/models/case_000/old_television_from_90s.glb')
useGLTF.preload('/models/case_000/wooden_dresser_drawer_pair.glb')
useGLTF.preload('/models/case_000/bedroom_bed_clean.glb')
useGLTF.preload('/models/case_000/concrete_trash_bin.glb')
useGLTF.preload('/models/case_000/medieval_wardrobe.glb')
useGLTF.preload('/models/case_000/table_fan.glb')
