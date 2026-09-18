'use client'

import React, { useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  CASE_LOCATIONS,
  CaseLocation,
  RouteResult
} from '@/lib/case-locations-data'

interface RealLeafletMapProps {
  origin: CaseLocation
  destination: CaseLocation
  activeRoute: RouteResult
  selectedPlace: CaseLocation | null
  onSelectPlace: (place: CaseLocation | null) => void
  useAlternativeRoute: boolean
  onToggleAlternativeRoute: () => void
  mapLayer: 'standard' | 'satellite'
  droppedPin: { lat: number; lng: number; title: string } | null
  onDropPin: (pin: { lat: number; lng: number; title: string } | null) => void
  isNavigating: boolean
  navProgress: number // 0 to 100
}

export default function RealLeafletMap({
  origin,
  destination,
  activeRoute,
  selectedPlace,
  onSelectPlace,
  useAlternativeRoute,
  onToggleAlternativeRoute,
  mapLayer,
  droppedPin,
  onDropPin,
  isNavigating,
  navProgress
}: RealLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const routesLayerRef = useRef<L.LayerGroup | null>(null)
  const vehicleMarkerRef = useRef<L.Marker | null>(null)
  const droppedPinMarkerRef = useRef<L.Marker | null>(null)

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    // Center on Case Origin (Số 14 Đường Bờ Sông / Cảng Hà Nội)
    const map = L.map(mapContainerRef.current, {
      center: [origin.lat, origin.lng],
      zoom: 14.5,
      zoomControl: false,
      attributionControl: false
    })

    // Google Maps Direct Tiles (100% authentic Google Maps, zero watermark, no API key required)
    const googleStandardTileUrl = 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
    const tileLayer = L.tileLayer(googleStandardTileUrl, {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3']
    }).addTo(map)

    tileLayerRef.current = tileLayer
    markersLayerRef.current = L.layerGroup().addTo(map)
    routesLayerRef.current = L.layerGroup().addTo(map)
    mapInstanceRef.current = map

    // Handle map click for Dropped Pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      onDropPin({
        lat: Math.round(e.latlng.lat * 10000) / 10000,
        lng: Math.round(e.latlng.lng * 10000) / 10000,
        title: 'Vị trí đã thả ghim'
      })
      onSelectPlace(null)
    })

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, []) // Run once on mount

  // 2. Switch Map Layer (Standard vs Satellite)
  useEffect(() => {
    if (!tileLayerRef.current || !mapInstanceRef.current) return

    mapInstanceRef.current.removeLayer(tileLayerRef.current)

    if (mapLayer === 'satellite') {
      // Google Maps Satellite Hybrid (Satellite imagery + road labels)
      tileLayerRef.current = L.tileLayer(
        'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        { maxZoom: 20, subdomains: ['0', '1', '2', '3'] }
      ).addTo(mapInstanceRef.current)
    } else {
      // Google Maps Standard Roadmap
      tileLayerRef.current = L.tileLayer(
        'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        { maxZoom: 20, subdomains: ['0', '1', '2', '3'] }
      ).addTo(mapInstanceRef.current)
    }
  }, [mapLayer])

  // 3. Render Case POI Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return

    markersLayerRef.current.clearLayers()

    CASE_LOCATIONS.forEach((loc) => {
      const isOrigin = loc.id === origin.id
      const isDestination = loc.id === destination.id

      let markerHtml = ''
      let iconSize: [number, number] = [32, 32]
      let iconAnchor: [number, number] = [16, 16]

      if (isOrigin) {
        // Point A: Google Maps Pulsing Blue Circle with label
        markerHtml = `
          <div class="flex flex-col items-center pointer-events-auto cursor-pointer">
            <div class="w-7 h-7 rounded-full bg-[#1A73E8] border-2 border-white flex items-center justify-center shadow-lg ring-4 ring-blue-400/40 animate-pulse">
              <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
            </div>
            <div class="mt-1 px-2 py-0.5 rounded-full bg-[#1A73E8] text-white text-[9.5px] font-bold shadow-md whitespace-nowrap border border-white">
              A: ${loc.name}
            </div>
          </div>
        `
        iconSize = [160, 48]
        iconAnchor = [80, 14]
      } else if (isDestination) {
        // Point B: Google Maps Red Pin with label
        markerHtml = `
          <div class="flex flex-col items-center pointer-events-auto cursor-pointer">
            <svg class="w-8 h-8 text-[#EA4335] drop-shadow-md" viewBox="0 0 24 24" fill="#EA4335">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#EA4335"/>
              <circle cx="12" cy="9" r="2.5" fill="#FFFFFF"/>
            </svg>
            <div class="px-2 py-0.5 rounded-full bg-[#EA4335] text-white text-[9.5px] font-bold shadow-md whitespace-nowrap border border-white -mt-1">
              B: ${loc.name}
            </div>
          </div>
        `
        iconSize = [160, 52]
        iconAnchor = [80, 32]
      } else {
        // Regular POI Category Badge with white outline label
        const bgBadgeColor =
          loc.category === 'residential'
            ? '#475569'
            : loc.category === 'food'
            ? '#EA580C'
            : loc.category === 'shopping'
            ? '#2563EB'
            : loc.category === 'transit'
            ? '#0891B2'
            : loc.category === 'finance'
            ? '#059669'
            : '#4B5563'

        markerHtml = `
          <div class="flex flex-col items-center pointer-events-auto cursor-pointer group transition-transform hover:scale-115">
            <div style="background-color: ${bgBadgeColor};" class="w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-sm text-white">
              <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
            <span style="paint-order: stroke fill; -webkit-text-stroke: 2.5px white;" class="mt-0.5 text-[9px] font-semibold text-gray-800 whitespace-nowrap drop-shadow-xs">
              ${loc.shortName}
            </span>
          </div>
        `
        iconSize = [130, 36]
        iconAnchor = [65, 10]
      }

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-poi-marker',
        iconSize,
        iconAnchor
      })

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon })
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e)
        onSelectPlace(loc)
        onDropPin(null)
      })

      markersLayerRef.current?.addLayer(marker)
    })
  }, [origin, destination, onSelectPlace, onDropPin])

  // 4. Render Dropped Pin Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return

    if (droppedPinMarkerRef.current) {
      mapInstanceRef.current.removeLayer(droppedPinMarkerRef.current)
      droppedPinMarkerRef.current = null
    }

    if (droppedPin) {
      const pinHtml = `
        <div class="flex flex-col items-center -mt-6 animate-bounce">
          <svg class="w-9 h-9 text-[#EA4335]" viewBox="0 0 24 24" fill="#EA4335">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span class="px-2 py-0.5 rounded-full bg-black/90 text-white text-[9px] font-bold shadow-md -mt-1 whitespace-nowrap">
            Ghim đã thả
          </span>
        </div>
      `
      const droppedIcon = L.divIcon({
        html: pinHtml,
        className: 'dropped-pin-icon',
        iconSize: [120, 50],
        iconAnchor: [60, 36]
      })

      droppedPinMarkerRef.current = L.marker([droppedPin.lat, droppedPin.lng], { icon: droppedIcon }).addTo(
        mapInstanceRef.current
      )
    }
  }, [droppedPin])

  // 5. Render Navigation Route Polylines (Primary Blue & Alternative Gray)
  useEffect(() => {
    if (!mapInstanceRef.current || !routesLayerRef.current) return

    routesLayerRef.current.clearLayers()

    // Alternative Route (Gray Line)
    if (activeRoute.alternativeLatLngs && activeRoute.alternativeLatLngs.length > 1) {
      const altPolyline = L.polyline(activeRoute.alternativeLatLngs, {
        color: useAlternativeRoute ? '#1A73E8' : '#9AA0A6',
        weight: useAlternativeRoute ? 6 : 5,
        opacity: useAlternativeRoute ? 1 : 0.75,
        lineCap: 'round',
        lineJoin: 'round'
      })

      altPolyline.on('click', () => {
        onToggleAlternativeRoute()
      })

      routesLayerRef.current.addLayer(altPolyline)
    }

    // Primary Route (Google Maps Blue Line with White Casing)
    if (activeRoute.latLngs && activeRoute.latLngs.length > 1) {
      // White casing outline
      const casingPolyline = L.polyline(activeRoute.latLngs, {
        color: '#FFFFFF',
        weight: useAlternativeRoute ? 7 : 9,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      })
      routesLayerRef.current.addLayer(casingPolyline)

      // Inner Blue Polyline
      const mainPolyline = L.polyline(activeRoute.latLngs, {
        color: useAlternativeRoute ? '#9AA0A6' : '#1A73E8',
        weight: useAlternativeRoute ? 5 : 7,
        opacity: useAlternativeRoute ? 0.75 : 1,
        lineCap: 'round',
        lineJoin: 'round'
      })

      mainPolyline.on('click', () => {
        if (useAlternativeRoute) onToggleAlternativeRoute()
      })

      routesLayerRef.current.addLayer(mainPolyline)
    }

    // Auto-fit bounds on route change when NOT in navigation mode
    if (!isNavigating && activeRoute.latLngs && activeRoute.latLngs.length > 1) {
      const bounds = L.latLngBounds(activeRoute.latLngs)
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 15.5
      })
    }
  }, [activeRoute, useAlternativeRoute, isNavigating, onToggleAlternativeRoute])

  // 6. Turn-by-Turn Real-time Moving Vehicle Puck
  const vehicleLatLng = useMemo<[number, number]>(() => {
    const coords = useAlternativeRoute && activeRoute.alternativeLatLngs
      ? activeRoute.alternativeLatLngs
      : activeRoute.latLngs

    if (!coords || coords.length < 2) return [origin.lat, origin.lng]

    const totalSegments = coords.length - 1
    const progressSegment = (navProgress / 100) * totalSegments
    const segIndex = Math.min(Math.floor(progressSegment), totalSegments - 1)
    const segT = progressSegment - segIndex
    const p1 = coords[segIndex]
    const p2 = coords[segIndex + 1]

    return [
      p1[0] + (p2[0] - p1[0]) * segT,
      p1[1] + (p2[1] - p1[1]) * segT
    ]
  }, [activeRoute, useAlternativeRoute, navProgress, origin])

  // Update Moving Vehicle Puck on Leaflet Map
  useEffect(() => {
    if (!mapInstanceRef.current) return

    if (!isNavigating) {
      if (vehicleMarkerRef.current) {
        mapInstanceRef.current.removeLayer(vehicleMarkerRef.current)
        vehicleMarkerRef.current = null
      }
      return
    }

    if (!vehicleMarkerRef.current) {
      const vehicleHtml = `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <!-- Direction Light Beam -->
          <div class="absolute -top-8 w-10 h-10 bg-gradient-to-t from-blue-500/40 to-transparent rounded-t-full"></div>
          <!-- Vehicle Circle Puck -->
          <div class="w-6 h-6 rounded-full bg-[#1A73E8] border-2 border-white shadow-2xl flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
          </div>
        </div>
      `
      const vehicleIcon = L.divIcon({
        html: vehicleHtml,
        className: 'vehicle-puck-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      })

      vehicleMarkerRef.current = L.marker(vehicleLatLng, { icon: vehicleIcon }).addTo(mapInstanceRef.current)
    } else {
      vehicleMarkerRef.current.setLatLng(vehicleLatLng)
    }

    // Camera auto-pans to follow vehicle
    mapInstanceRef.current.panTo(vehicleLatLng, { animate: true, duration: 0.6 })
  }, [isNavigating, vehicleLatLng])

  // Center on Selected Place if triggered externally
  useEffect(() => {
    if (selectedPlace && mapInstanceRef.current && !isNavigating) {
      mapInstanceRef.current.flyTo([selectedPlace.lat, selectedPlace.lng], 16, {
        duration: 0.8
      })
    }
  }, [selectedPlace, isNavigating])

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
    </div>
  )
}
