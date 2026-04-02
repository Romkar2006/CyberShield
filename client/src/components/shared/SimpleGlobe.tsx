import React, { useEffect, useRef } from 'react';
import Globe from 'globe.gl';

export default function SimpleGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- ENHANCED WORLD HUBS ---
    const WORLD_CITIES = [
      // India
      { lat: 28.6139, lng: 77.2090, name: 'Delhi' },
      { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
      { lat: 12.9716, lng: 77.5946, name: 'Bengaluru' },
      { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
      // Asia
      { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
      { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
      { lat: 22.3193, lng: 114.1694, name: 'Hong Kong' },
      { lat: 37.5665, lng: 126.9780, name: 'Seoul' },
      { lat: 25.2048, lng: 55.2708, name: 'Dubai' },
      // Americas
      { lat: 40.7128, lng: -74.0060, name: 'New York' },
      { lat: 37.7749, lng: -122.4194, name: 'San Francisco' },
      { lat: 43.6532, lng: -79.3832, name: 'Toronto' },
      { lat: -23.5505, lng: -46.6333, name: 'Sao Paulo' },
      { lat: 19.4326, lng: -99.1332, name: 'Mexico City' },
      // Europe
      { lat: 51.5074, lng: -0.1278, name: 'London' },
      { lat: 48.8566, lng: 2.3522, name: 'Paris' },
      { lat: 52.5200, lng: 13.4050, name: 'Berlin' },
      { lat: 52.3676, lng: 4.9041, name: 'Amsterdam' },
      { lat: 55.7558, lng: 37.6173, name: 'Moscow' },
      { lat: 47.3769, lng: 8.5417, name: 'Zurich' },
      // Others
      { lat: -33.8688, lng: 151.2093, name: 'Sydney' },
      { lat: -33.9249, lng: 18.4241, name: 'Cape Town' },
      { lat: 6.5244, lng: 3.3792, name: 'Lagos' }
    ];

    // --- GLOBAL CYBER ARCS (High Intensity) ---
    const arcsData: any[] = [];
    const arcCount = 100; // High Density

    for (let i = 0; i < arcCount; i++) {
      const src = WORLD_CITIES[Math.floor(Math.random() * WORLD_CITIES.length)];
      const dest = WORLD_CITIES[Math.floor(Math.random() * WORLD_CITIES.length)];
      
      if (src.name === dest.name) continue;

      const randomVal = Math.random();
      let color, velocity, stroke;

      if (randomVal > 0.7) {
        // Bright Red: Critical Attack
        color = ['#FF3131', '#FF0000'];
        velocity = 0.05 + Math.random() * 0.1;
        stroke = 0.6; // Thin & Sharp
      } else if (randomVal > 0.3) {
        // Bright Amber: Suspicious
        color = ['#FFD700', '#FFA500'];
        velocity = 0.03 + Math.random() * 0.06;
        stroke = 0.5;
      } else {
        // Bright Emerald: Secure
        color = ['#39FF14', '#00FF00'];
        velocity = 0.02 + Math.random() * 0.04;
        stroke = 0.4;
      }

      arcsData.push({
        startLat: src.lat, startLng: src.lng,
        endLat: dest.lat, endLng: dest.lng,
        color, velocity, stroke
      });
    }

    // --- INDIA HIGHLIGHT (Subcontinent Glow) ---
    const indiaHighlight = [{
      lat: 20.5937, lng: 78.9629, // India Center
      maxR: 15,
      propagationSpeed: 0.5,
      repeatPeriod: 3000,
      color: '#00D4FF'
    }];

    // --- CONTINENT SAFETY DATA ---
    const CONTINENTS_DATA = [
      { lat: 35, lng: 105, name: 'ASIA', safety: 'CRITICAL', color: '#FF3131' },
      { lat: 50, lng: 15, name: 'EUROPE', safety: 'HIGH THREAT', color: '#f59e0b' },
      { lat: 40, lng: -100, name: 'N. AMERICA', safety: 'SECURE', color: '#39FF14' },
      { lat: -15, lng: -60, name: 'S. AMERICA', safety: 'ELEVATED', color: '#f59e0b' },
      { lat: 0, lng: 20, name: 'AFRICA', safety: 'MONITORED', color: '#00D4FF' },
      { lat: -25, lng: 135, name: 'OCEANIA', safety: 'SECURE', color: '#39FF14' }
    ];

    // --- PULSING ORANGE RINGS (All Cities) ---
    const ringsData = [
      ...indiaHighlight,
      ...WORLD_CITIES.map(c => ({
        lat: c.lat,
        lng: c.lng,
        maxR: 3,
        propagationSpeed: 2.5,
        repeatPeriod: 800 + Math.random() * 400,
        color: '#f97316'
      })),
      ...CONTINENTS_DATA.map(c => ({
        lat: c.lat,
        lng: c.lng,
        maxR: 6,
        propagationSpeed: 1,
        repeatPeriod: 2000,
        color: c.color
      }))
    ];

    // --- GLOBE INITIALIZATION ---
    const globe = (Globe as any)()(containerRef.current)
      .backgroundColor('rgba(10,15,30,0)')
      .showAtmosphere(true)
      .atmosphereColor('#00D4FF')
      .atmosphereAltitude(0.25)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      
      // Arcs
      .arcsData(arcsData)
      .arcColor('color')
      .arcDashLength(0.8) // Long laser streaks
      .arcDashGap(2)
      .arcDashInitialGap(() => Math.random() * 5)
      .arcDashAnimateTime(d => 1000 / d.velocity)
      .arcStroke('stroke')
      .arcCurveResolution(96)
      
      // Points (City Hubs)
      .pointsData([
        ...WORLD_CITIES.map(c => ({ ...c, size: 0.3, color: '#f97316' })),
        ...CONTINENTS_DATA.map(c => ({ ...c, size: 0.6, color: c.color }))
      ])
      .pointColor('color')
      .pointAltitude(0.01)
      .pointRadius('size')
      .pointsMerge(true)
      
      // Rings (Pulsing Grid & India Highlight & Continent Anchors)
      .ringsData(ringsData)
      .ringColor(d => (d as any).color)
      .ringMaxRadius('maxR')
      .ringPropagationSpeed('propagationSpeed')
      .ringRepeatPeriod('repeatPeriod')
      
      // Labels (Continent Alerts)
      .labelsData(CONTINENTS_DATA)
      .labelText(d => `${d.name}\n[${d.safety}]`)
      .labelSize(2.2)
      .labelDotRadius(0.5)
      .labelColor('color')
      .labelResolution(4)
      .labelAltitude(0.06);

    // Cinematic Navigation
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.4; // Slightly faster rotation for intensity
    globe.controls().enableZoom = false;

    const resize = () => {
      if (containerRef.current) {
        globe.width(containerRef.current.clientWidth);
        globe.height(containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', resize);
    setTimeout(resize, 100);

    return () => {
      window.removeEventListener('resize', resize);
      globe._destructor();
    };
  }, []);

  return (
    <div className="relative w-full h-full group">
       <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing opacity-90 transition-opacity group-hover:opacity-100" />
       {/* Soft Bloom overlay */}
       <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,15,30,0.4)_100%)]" />
    </div>
  );
}
