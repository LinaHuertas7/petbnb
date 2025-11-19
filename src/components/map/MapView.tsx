import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import React, { useEffect } from 'react';

export type Caregiver = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  price: number;
  petTypes: string[];
  rating?: number;
};

// Fix iconos en Vite
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
});

interface MapViewProps {
  center: [number, number];
  caregivers: Caregiver[];
  zoom?: number;
}

const ResizeHelper: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    // Esperar a que el DOM esté listo
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    // También ante resize de ventana
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);
  
  return null;
};

const MapView: React.FC<MapViewProps> = ({ center, caregivers, zoom = 13 }) => {
  return (
    <div className="leaflet-wrapper">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        className="leaflet-container-fixed"
        style={{ width: '100%', height: '100%' }}
      >
        <ResizeHelper />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {caregivers.map(cg => (
          <Marker key={cg.id} position={[cg.lat, cg.lng]}>
            <Popup>
              <div>
                <strong>{cg.name}</strong>
                <div>Precio desde: ${cg.price}</div>
                <div>Mascotas: {cg.petTypes.join(', ')}</div>
                {cg.rating != null && <div>Rating: ⭐ {cg.rating.toFixed(1)}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;