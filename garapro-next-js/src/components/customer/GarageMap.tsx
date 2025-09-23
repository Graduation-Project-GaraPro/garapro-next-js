"use client";

import { useEffect, useRef } from "react";

interface Garage {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

export default function GarageMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMap = async () => {
      // Gọi API backend để lấy danh sách gara
      const res = await fetch("https://your-backend.com/api/garages");
      const garages: Garage[] = await res.json();

      // Khởi tạo Google Maps
      const map = new google.maps.Map(mapRef.current as HTMLElement, {
        zoom: 13,
        center: { lat: 16.047079, lng: 108.20623 }, // Tâm Đà Nẵng
      });

      // Hiển thị các marker
      garages.forEach((garage) => {
        const marker = new google.maps.Marker({
          position: { lat: garage.lat, lng: garage.lng },
          map,
          title: garage.name,
        });

        // Popup khi click marker
        const infoWindow = new google.maps.InfoWindow({
          content: `<div class="p-2">
                      <h2 class="font-bold">${garage.name}</h2>
                      <p>Lat: ${garage.lat}, Lng: ${garage.lng}</p>
                    </div>`,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      });
    };

    loadMap();
  }, []);

  return (
    <div className="w-full h-[500px] rounded shadow" ref={mapRef} />
  );
}
