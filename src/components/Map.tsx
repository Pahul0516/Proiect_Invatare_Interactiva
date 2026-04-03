import React, { useMemo, useCallback, useEffect, useRef } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { useAppContext } from "../context/AppContext";
import { getStoryForCounty } from "../services/llmService";
import { getWeatherForCounty, WeatherInfo } from "../services/weatherService";

import romaniaGeo from "../data/romania-counties.json";
import "./Map.css";

const COLOR_MAP: Record<string, string> = {
    red: "#ef4444",
    yellow: "#eab308",
    green: "#22c55e",
};

const DEFAULT_CENTER: [number, number] = [24.9668, 45.9432];
const DEFAULT_SCALE = 3000;
const ZOOM_SCALE = 12000;

const RomaniaMap: React.FC = () => {
    const {
        currentCounty,
        setCurrentCounty,
        countyColors,
        phase,
        setPhase,
        setStoryText,
        avatarMode,
        setAvatarEmotion,
        setIsLoading,
        isLoading,
        userCoords,
        setUserCoords,
        detectedCounty,
        setDetectedCounty,
        visitedCounties,
        markVisited,
        setShowNewCountyNotification,
        setWeatherInfo,
    } = useAppContext();

    const [mapWeatherInfo, setMapWeatherInfo] = React.useState<WeatherInfo | null>(null);

    const geoRef = useRef<any[]>([]);

    // Geolocation on mount
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                () => {
                    // Default to Bucharest if geolocation fails
                    setUserCoords({ lat: 44.4268, lng: 26.1025 });
                }
            );
        } else {
            setUserCoords({ lat: 44.4268, lng: 26.1025 });
        }
    }, [setUserCoords]);

    // Detect which county the user is in based on coords
    useEffect(() => {
        if (!userCoords || geoRef.current.length === 0) return;

        // Simple point-in-polygon check using centroids (approximate)
        let closestCounty = "";
        let minDist = Infinity;

        for (const geo of geoRef.current) {
            const centroid = geoCentroid(geo);
            const dx = centroid[0] - userCoords.lng;
            const dy = centroid[1] - userCoords.lat;
            const dist = dx * dx + dy * dy;
            if (dist < minDist) {
                minDist = dist;
                closestCounty = geo.properties.NAME_1 || geo.properties.name;
            }
        }

        if (closestCounty && closestCounty !== detectedCounty) {
            const oldDetected = detectedCounty;
            setDetectedCounty(closestCounty);

            if (oldDetected && !visitedCounties.has(closestCounty)) {
                setShowNewCountyNotification(closestCounty);
                setTimeout(() => setShowNewCountyNotification(null), 4000);
            }
            markVisited(closestCounty);
        }
    }, [userCoords, detectedCounty, setDetectedCounty, visitedCounties, markVisited, setShowNewCountyNotification]);

    const activeCounty = currentCounty || detectedCounty;

    useEffect(() => {
        if (phase === "idle" && activeCounty) {
            getWeatherForCounty(activeCounty)
                .then((info) => setMapWeatherInfo(info))
                .catch(() => setMapWeatherInfo(null));
        }
    }, [activeCounty, phase]);

    const isZoomed = phase !== "idle" && currentCounty;

    // Compute zoom center
    const zoomCenter = useMemo<[number, number]>(() => {
        if (!isZoomed || geoRef.current.length === 0) return DEFAULT_CENTER;

        const geo = geoRef.current.find(
            (g) => (g.properties.NAME_1 || g.properties.name) === currentCounty
        );
        if (geo) {
            const c = geoCentroid(geo);
            return [c[0], c[1]];
        }
        return DEFAULT_CENTER;
    }, [isZoomed, currentCounty]);

    const handleStartAdventure = useCallback(async () => {
        const county = currentCounty || detectedCounty;
        if (!county) return;

        setCurrentCounty(county);
        markVisited(county);
        setIsLoading(true);
        setAvatarEmotion("thinking");
        setPhase("story");

        const result = await getStoryForCounty(county, avatarMode);
        setStoryText(result.story);
        setWeatherInfo(result.weather);
        setIsLoading(false);
        setAvatarEmotion("happy");
    }, [
        currentCounty,
        detectedCounty,
        avatarMode,
        setCurrentCounty,
        markVisited,
        setIsLoading,
        setAvatarEmotion,
        setPhase,
        setStoryText,
        setWeatherInfo,
    ]);

    const getCountyFill = useCallback(
        (name: string, isSelected: boolean) => {
            const quizColor = countyColors[name];
            if (quizColor) return COLOR_MAP[quizColor];
            if (isSelected) return "var(--county-hover)";
            return "var(--county-fill)";
        },
        [countyColors]
    );

    return (
        <div className="map-wrapper">
            <div
                className={`map-container ${isZoomed ? "zoomed" : ""}`}
                style={{ width: "100%", height: "100%" }}
            >
                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                        scale: isZoomed ? ZOOM_SCALE : DEFAULT_SCALE,
                        center: isZoomed ? zoomCenter : DEFAULT_CENTER,
                    }}
                    style={{ width: "100%", height: "100%" }}
                >
                    <Geographies geography={romaniaGeo}>
                        {({ geographies }) => {
                            geoRef.current = geographies;
                            return geographies.map((geo) => {
                                const centroid = geoCentroid(geo);
                                const name =
                                    geo.properties.NAME_1 || geo.properties.name;

                                const isSelected = activeCounty === name;

                                return (
                                    <g key={geo.rsmKey}>
                                        <Geography
                                            geography={geo}
                                            onClick={() => {
                                                if (phase === "idle") setCurrentCounty(name);
                                            }}
                                            style={{
                                                default: {
                                                    fill: getCountyFill(name, isSelected),
                                                    stroke: isSelected
                                                        ? "#60a5fa"
                                                        : "var(--county-stroke)",
                                                    strokeWidth: isSelected ? 1.2 : 0.6,
                                                    outline: "none",
                                                    transition: "all 0.4s ease",
                                                    pointerEvents:
                                                        phase === "idle" ? "all" : "none",
                                                },
                                                hover: {
                                                    fill:
                                                        phase === "idle"
                                                            ? "var(--county-hover)"
                                                            : getCountyFill(name, isSelected),
                                                    stroke: "#60a5fa",
                                                    strokeWidth: 1,
                                                    outline: "none",
                                                    cursor:
                                                        phase === "idle"
                                                            ? "pointer"
                                                            : "default",
                                                },
                                                pressed: {
                                                    fill: "var(--county-hover)",
                                                    outline: "none",
                                                },
                                            }}
                                        />

                                        {/* County label */}
                                        <Marker coordinates={centroid}>
                                            <text
                                                textAnchor="middle"
                                                style={{
                                                    fontSize: isZoomed ? 3 : 6,
                                                    fill: "var(--label-fill)",
                                                    fontWeight: "bold",
                                                    paintOrder: "stroke",
                                                    stroke: "var(--label-stroke)",
                                                    strokeWidth: isZoomed ? 1 : 2,
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    pointerEvents: "none",
                                                }}
                                            >
                                                {name}
                                            </text>
                                        </Marker>

                                        {/* Avatar marker on user's county */}
                                        {isSelected && detectedCounty === name && (
                                            <Marker coordinates={centroid}>
                                                <circle
                                                    r={isZoomed ? 2 : 4}
                                                    fill="#f59e0b"
                                                    stroke="#fff"
                                                    strokeWidth={isZoomed ? 0.5 : 1}
                                                />
                                                <text
                                                    textAnchor="middle"
                                                    y={isZoomed ? -4 : -7}
                                                    style={{
                                                        fontSize: isZoomed ? 3 : 5,
                                                        fill: "#f59e0b",
                                                        fontWeight: "bold",
                                                        pointerEvents: "none",
                                                    }}
                                                >
                                                    📍
                                                </text>
                                            </Marker>
                                        )}
                                    </g>
                                );
                            });
                        }}
                    </Geographies>
                </ComposableMap>
            </div>

            {/* Start button - only in idle phase */}
            {phase === "idle" && (
                <div className="map-start-area">
                    <div className="selected-county-label">
                        {activeCounty
                            ? `Județ selectat: ${activeCounty}`
                            : "Selectează un județ sau permite localizarea"}
                    </div>
                    {mapWeatherInfo && activeCounty && (
                        <div className="map-weather-badge">
                            <span className="weather-icon">{mapWeatherInfo.icon}</span>
                            <div className="weather-details">
                                <span className="weather-temp">{mapWeatherInfo.temp}°C</span>
                                <span className="weather-desc">{mapWeatherInfo.description}</span>
                                <span className="weather-city">{mapWeatherInfo.cityName}</span>
                            </div>
                        </div>
                    )}
                    <button
                        className="start-button"
                        onClick={handleStartAdventure}
                        disabled={!activeCounty || isLoading}
                    >
                        {isLoading ? "Se încarcă..." : "▶ Start Aventura"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default RomaniaMap;