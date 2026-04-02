import React, { useEffect, useRef } from 'react';
import Globe from 'globe.gl';

export default function GlobeWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Base setup
    const globe = (Globe as any)()(containerRef.current)
      .backgroundColor('rgba(10,15,30,1)')
      .atmosphereColor('#00D4FF')
      .atmosphereAltitude(0.15)
      .showGlobe(true)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg');

    // Add some random arcs and points to simulate data
    const N = 10;
    const arcsData = [...Array(N).keys()].map(() => ({
      startLat: (Math.random() - 0.5) * 40 + 20, // rough india bounds
      startLng: (Math.random() - 0.5) * 40 + 80,
      endLat: (Math.random() - 0.5) * 40 + 20,
      endLng: (Math.random() - 0.5) * 40 + 80,
      color: ['#EF4444', '#F59E0B', '#22C55E'][Math.floor(Math.random() * 3)]
    }));

    globe
      .arcsData(arcsData)
      .arcColor('color')
      .arcDashLength(0.4)
      .arcDashGap(4)
      .arcDashInitialGap(() => Math.random() * 5)
      .arcDashAnimateTime(2000);

    // Add cities
    const citiesData = arcsData.flatMap(d => [
      { lat: d.startLat, lng: d.startLng, size: 0.5, color: '#00D4FF' },
      { lat: d.endLat, lng: d.endLng, size: 0.5, color: '#00D4FF' }
    ]);
    globe.pointsData(citiesData)
      .pointColor('color')
      .pointAltitude(0.01)
      .pointRadius('size');

    // Auto-rotate
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.8;
    globe.pointOfView({ lat: 20.5937, lng: 78.9629, altitude: 2.5 });

    const resize = () => {
      if (containerRef.current) {
        globe.width(containerRef.current.clientWidth);
        globe.height(containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', resize);
    resize();

    return () => {
      window.removeEventListener('resize', resize);
      globe._destructor();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden" />;
}
