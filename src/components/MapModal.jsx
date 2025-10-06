// src/components/MapModal.jsx

import React from 'react';
import { LeafletMap } from './LeafletMap'; // Ajuste o caminho se necessário
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from 'lucide-react';

export const MapModal = ({ isOpen, onClose, year, latitude, longitude }) => {
  console.log('🚪 MapModal renderizado com:', {
    isOpen,
    year,
    latitude,
    longitude
  });

  if (!isOpen) {
    console.log('❌ MapModal não está aberto');
    return null;
  }

  // A API da NASA GIBS precisa de uma data completa (YYYY-MM-DD).
  // Usamos o meio do ano para ter uma imagem representativa.
  const displayDate = `${year}-07-01`;
  console.log('📅 Data de exibição calculada:', displayDate);

  return (
    // Backdrop
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
      onClick={onClose}
    >
      {/* Container do Modal */}
      <div 
        className="bg-card p-1 rounded-lg shadow-2xl w-11/12 max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>NASA Worldview - {year}</CardTitle>
            <button onClick={onClose} className="text-muted-foreground hover:text-primary">
              <X className="h-6 w-6" />
            </button>
          </CardHeader>
          <CardContent>
            {latitude && longitude ? (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  Coordenadas: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </p>
                <LeafletMap 
                  latitude={latitude}
                  longitude={longitude}
                  displayDate={displayDate}
                />
              </>
            ) : (
              <div className="w-full h-80 flex items-center justify-center">
                <p className="text-muted-foreground">Coordenadas inválidas.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};