import React from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";

import romaniaGeo from "../data/romania-counties.json";

const Map: React.FC = () => {
    const [selectedCounty, setSelectedCounty] = React.useState<string | null>(null);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background: "var(--app-bg)"
            }}
        >
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 3000,
                    center: [24.9668, 45.9432]
                }}
                style={{ width: "100%", height: "100%" }}
            >
                <Geographies geography={romaniaGeo}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            const centroid = geoCentroid(geo);
                            const name =
                                geo.properties.NAME_1 || geo.properties.name;

                            const isSelected = selectedCounty === name;

                            return (
                                <g key={geo.rsmKey}>
                                    <Geography
                                        geography={geo}
                                        onClick={() => setSelectedCounty(name)}
                                        style={{
                                            default: {
                                                fill: isSelected
                                                    ? "var(--county-hover)"
                                                    : "var(--county-fill)",
                                                stroke: "var(--county-stroke)",
                                                strokeWidth: 0.6,
                                                outline: "none",
                                                transition: "all 0.2s ease",
                                                pointerEvents: "all"
                                            },
                                            hover: {
                                                fill: "var(--county-hover)",
                                                stroke: "#60a5fa",
                                                strokeWidth: 1,
                                                outline: "none",
                                                cursor: "pointer"
                                            },
                                            pressed: {
                                                fill: "var(--county-hover)",
                                                outline: "none"
                                            }
                                        }}
                                    />

                                    {/* County label */}
                                    <Marker coordinates={centroid}>
                                        <text
                                            textAnchor="middle"
                                            style={{
                                                fontSize: 6,
                                                fill: "var(--label-fill)",
                                                fontWeight: "bold",

                                                paintOrder: "stroke",
                                                stroke: "var(--label-stroke)",
                                                strokeWidth: 2,
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",

                                                pointerEvents: "none"
                                            }}
                                        >
                                            {name}
                                        </text>
                                    </Marker>
                                </g>
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>
        </div>
    );
};

export default Map;