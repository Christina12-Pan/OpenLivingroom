'use client';

import React from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/** 与外层 aspect-[2/1] 一致，避免 800×600 viewBox 在宽屏上被纵向“压底” */
const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;

interface MapProps {
  markers: {
    city: string;
    slug: string;
    coordinates: [number, number];
    status: 'available' | 'pending' | 'booked';
  }[];
}

/**
 * 世界地图组件，显示 Anchor 城市（可缩放平移）
 */
const Map = ({ markers }: MapProps) => {
  if (markers.length === 0) {
    return (
      <div className="flex aspect-[2/1] w-full items-center justify-center rounded-xl border border-[#E2DDD4] bg-[#FAF8F4] p-6 text-center text-secondary">
        No Anchors yet. Be the first.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="aspect-[2/1] w-full overflow-hidden rounded-lg border border-near-black/5 bg-surface">
        <ComposableMap
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          projectionConfig={{
            scale: 175,
            /** 略向北偏移，减少底部南极空白造成的“下沉”感 */
            center: [0, 12] as [number, number],
          }}
          className="block h-full w-full max-h-full"
        >
          <ZoomableGroup zoom={1} minZoom={0.75} maxZoom={8} center={[0, 0]}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#FAF8F4"
                    stroke="#D0CDC7"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: '#F0EDE6' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>
            {markers.map(({ city, slug, coordinates, status }) => (
              <Marker key={slug} coordinates={coordinates}>
                <a href={`/city/${slug}`}>
                  <circle
                    r={4}
                    fill={
                      status === 'available' ? '#2A9D6F' :
                      status === 'pending' ? '#E8C97A' : '#D85A30'
                    }
                    stroke="#fff"
                    strokeWidth={1}
                    className="cursor-pointer hover:r-6 transition-all"
                  />
                  <text
                    textAnchor="middle"
                    y={-10}
                    style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '8px', fill: '#1A1A18' }}
                  >
                    {city}
                  </text>
                </a>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>
      <p className="mt-2 text-center text-xs text-secondary">
        Scroll or pinch to zoom · Drag to move the map
      </p>
    </div>
  );
};

export default Map;
