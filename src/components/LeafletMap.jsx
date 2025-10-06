import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export const LeafletMap = ({ latitude, longitude, displayDate }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  
  console.log('🗺️ LeafletMap renderizado com:', {
    latitude,
    longitude,
    displayDate,
    hasContainer: !!mapContainerRef.current
  });
  
  // This is the main hook for creating and updating the map
  useEffect(() => {
    console.log('🔄 LeafletMap useEffect executed:', {
      latitude,
      longitude,
      displayDate,
      hasContainer: !!mapContainerRef.current,
      hasMap: !!mapInstanceRef.current
    });
    
    // 1. First, do nothing until we have the coordinates and the container div is ready.
    if (!latitude || !longitude || !mapContainerRef.current) {
      console.log('❌ LeafletMap: Coordinates or container not available');
      return; 
    }

    const timeoutId = setTimeout(() => {
      console.log('⏰ Running map creation after delay');
      createOrUpdateMap();
    }, 100);

    function createOrUpdateMap() {

    // 2. This is your "if (!map)" block. We check the ref. If it's null, we create the map.
    if (!mapInstanceRef.current) {
      console.log('🆕 Creating a new Leaflet map');
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 7,
        zoomControl: true,
        attributionControl: false,
      });
      console.log('✅ Map successfully created');
    } else {
      // 3. This is your "else" block. If the map already exists, we just update its view.
      console.log('🔄 Updating existing map view');
      mapInstanceRef.current.setView([latitude, longitude]);
    }

    // 4. This logic for updating the satellite image layer now runs correctly
    //    because we know for sure the map instance exists.
    if (mapInstanceRef.current && displayDate) {
      console.log('🛰️ Configuring satellite layer for data:', displayDate);
      const dateObj = new Date(displayDate);
      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getDate().toString().padStart(2, '0');
      const fullDateForYear = `${year}-${month}-${day}`;

      const gibsUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${fullDateForYear}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
      
      console.log('🔗 URL do GIBS:', gibsUrl);
      
      if (tileLayerRef.current) {
        console.log('🗑️ Removendo camada anterior');
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      console.log('🆕 Criando nova camada de tiles');
      tileLayerRef.current = L.tileLayer(gibsUrl, {
        attribution: '&copy; NASA Worldview',
        tileSize: 256,
        noWrap: true,
      });

      tileLayerRef.current.on('tileerror', (error) => {
        console.error('❌ Erro ao carregar tile:', error);
        console.error(`No satellite imagery available for ${fullDateForYear}`);
        // Here you could set an error state to show a message on the map
      });

      tileLayerRef.current.on('tileload', () => {
        console.log('✅ Tile successfully loaded');
      });

      console.log('➕ Adding a layer to the map');
      tileLayerRef.current.addTo(mapInstanceRef.current);
      console.log('✅ Layer successfully added');
    }
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [latitude, longitude, displayDate]); // This hook correctly re-runs when the props change.

  // This is a separate, simple hook whose only job is to clean up the map when the component is removed.
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // The empty array [] ensures this cleanup only runs once when the component unmounts.
  
  return (
    <div className="relative w-full h-80">
      <div 
        ref={mapContainerRef} 
        className="w-full h-full rounded-lg shadow-md z-0"
        style={{ 
          width: '100%', 
          height: '320px',
          minHeight: '320px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc'
        }}
      />
    </div>
  );
};
