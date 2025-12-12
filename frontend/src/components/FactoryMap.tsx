"use client";

import { useMemo, useState } from "react";
import { useTenant } from "@/src/hooks/useTenant";
import { TenantLoadingSkeleton } from "@/src/components/TenantLoadingSkeleton";
import { TenantError } from "@/src/components/TenantError";

const statusColors: Record<string, string> = {
  optimal: "fill-green-500",
  warning: "fill-yellow-400",
  critical: "fill-red-500",
};

export function FactoryMap() {
  const { config, isLoading, error, refreshConfig } = useTenant();
  const factories = useMemo(() => config?.factories ?? [], [config?.factories]);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | undefined>(
    factories?.[0]?.id
  );
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const selectedFactory = useMemo(
    () => factories.find((factory) => factory.id === selectedFactoryId) ?? factories[0],
    [factories, selectedFactoryId]
  );

  const selectedZone = useMemo(
    () => selectedFactory?.zones.find((zone) => zone.id === selectedZoneId) ?? null,
    [selectedFactory, selectedZoneId]
  );

  if (isLoading) return <TenantLoadingSkeleton />;
  if (error) return <TenantError error={error} onRetry={() => refreshConfig()} />;

  if (!factories.length) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Factories</h2>
        <p className="text-sm text-gray-600">No factory data available for this tenant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Factory Map</h2>
          <p className="text-sm text-gray-600">
            Visualize zones and workshops from the tenant configuration.
          </p>
        </div>
        <select
          className="border rounded px-3 py-2 w-full md:w-64"
          value={selectedFactory?.id}
          onChange={(event) => {
            setSelectedFactoryId(event.target.value);
            setSelectedZoneId(null);
          }}
        >
          {factories.map((factory) => (
            <option key={factory.id} value={factory.id}>
              {factory.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="relative overflow-auto">
          <svg viewBox="0 0 800 600" className="w-full h-auto min-h-[300px]">
            {selectedFactory?.zones.map((zone) => (
              <g
                key={zone.id}
                transform={`translate(${zone.coordinates.x}, ${zone.coordinates.y})`}
                className="cursor-pointer"
                onClick={() => setSelectedZoneId(zone.id)}
              >
                <circle
                  r="30"
                  className={`${statusColors[zone.status] ?? "fill-gray-300"} drop-shadow`}
                  aria-label={`Zone ${zone.name}`}
                />
                <text
                  x="0"
                  y="50"
                  textAnchor="middle"
                  className="text-sm fill-gray-800"
                >
                  {zone.name}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Workshops</h3>
          {selectedFactory?.workshops.length ? (
            <ul className="space-y-2">
              {selectedFactory.workshops.map((workshop) => (
                <li
                  key={workshop.id}
                  className="flex items-center justify-between border rounded p-3"
                >
                  <div>
                    <p className="font-medium">{workshop.name}</p>
                    <p className="text-sm text-gray-600">Red tags: {workshop.redTags}</p>
                  </div>
                  <span className="text-sm text-gray-700">
                    Training: {workshop.activeTraining}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No workshops defined.</p>
          )}
        </div>

        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Zone Detail</h3>
          {selectedZone ? (
            <div className="space-y-1 text-sm text-gray-700">
              <p className="font-semibold">{selectedZone.name}</p>
              <p>Status: {selectedZone.status}</p>
              <p>
                Coordinates: x={selectedZone.coordinates.x}, y={selectedZone.coordinates.y}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Select a zone to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
