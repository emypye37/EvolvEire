//react hooks for state management
import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";

//react wrapper for mapbox gl js
import ReactMapGL, { Source, Layer, MapEvent } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

//powerful open source library for spatial operations in the browser
import * as turf from "@turf/turf";

//style file
import "./MyMap.css";

//components to be rendered inside MyMap
import GeocoderControl from "./../geocoder/GeocoderControl";
import ControlPanel from "./../controlpanel/ControlPanel";
import RadioSelect from "./../radioselect/RadioSelect";

//filtered spatial data imports
import railnetwork_modern from "../../data/Modern_Railways_pyconvert_4326.json";
import railstops_historic from "../../data/Historical_Stops_pyconvert_4326.json";
import railstops_modern from "../../data/Modern_Stops_pyconvert_4326.json";
import railnetwork_1846 from "../../data/filtered_routes_1846.json";
import railnetwork_1876 from "../../data/filtered_routes_1876.json";
import railnetwork_1906 from "../../data/filtered_routes_1906.json";
import railnetwork_1920 from "../../data/filtered_routes_1920.json";
import railnetwork_1936 from "../../data/filtered_routes_1936.json";
import railnetwork_1976 from "../../data/filtered_routes_1976.json";
import stops_1846 from "../../data/filtered_stops_1846.json";
import stops_1876 from "../../data/filtered_stops_1876.json";
import stops_1906 from "../../data/filtered_stops_1906.json";
import stops_1920 from "../../data/filtered_stops_1920.json";
import stops_1936 from "../../data/filtered_stops_1936.json";
import stops_1976 from "../../data/filtered_stops_1976.json";

//hidden mapbox token in an environment variable to authenticate requests to the mapbox service
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

//typescript interface for hover feature
interface HoverInfo {
  feature: any;
  x: number;
  y: number;
  name?: string;
  company?: string;
  description?: string;
  additionalInfo?: string;
  startYear?: number;
  endYear?: number;
}

//type script interface for polygon search
interface CircleArea {
  center: [number, number];
  radiusInKm: number;
}

//tell typescript about react-map-gl function getMap
interface MapRef {
  getMap: () => any;
}

export default function MyMap() {
  //setting up initial view state for the map on load
  const [viewState, setViewState] = useState({
    latitude: 53.429012,
    longitude: -7.713983,
    zoom: 6.3,
  });

  //state hooks to manage hover info, selected timeline year and search area
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(1846);
  const [searchArea, setSearchArea] = useState<CircleArea | null>(null);

  //storing a reference to the map instance for later manipulation
  const mapRef = useRef<MapRef | null>(null);

  //called to zoom the user to the circle defined by the search
  const fitMapToCircle = useCallback(() => {
    if (mapRef.current && searchArea) {
      //sets the turf search circle to equal the searchArea from the user search query in geocoder
      const searchCircle = turf.circle(
        searchArea.center,
        searchArea.radiusInKm,
        { steps: 64, units: "kilometers" }
      );

      //turf function calculating the bounding box of the search circle
      const bbox = turf.bbox(searchCircle);

      //adjust map viewport to the bounds
      mapRef.current.getMap().fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        {
          padding: { top: 10, bottom: 10, left: 10, right: 10 },
          duration: 1000,
        }
      );
    }
  }, [searchArea]);

  //called whenever search updates to fit map again
  useEffect(() => {
    fitMapToCircle();
  }, [fitMapToCircle, searchArea]);

  //handling the mouse hover events, setting hover info state
  //memoize the function with useCallback
  //MapEvent from react map gl which handles user interaction with features
  const onHover = useCallback((event: MapEvent) => {
    const {
      features,
      point: { x, y },
    } = event;

    //checks the attributes of the hovered feature
    const hoveredFeature = features && features[0];

    if (hoveredFeature) {
      let tooltipInfo: Partial<HoverInfo> = {};
      //if its a station layer look for these attributes
      if (hoveredFeature.layer.id === "point") {
        tooltipInfo = {
          name: hoveredFeature.properties.StopName,
          description: `Type: ${hoveredFeature.properties.Type}`,
          additionalInfo: `Lat: ${hoveredFeature.properties.Lat}, 
          Long: ${hoveredFeature.properties.Long}`,
        };
        //else if it's a modern rail line look for different features
      } else if (hoveredFeature.layer.id === "line-modern") {
        tooltipInfo = {
          name: hoveredFeature.properties.RouteName,
          company: hoveredFeature.properties.Company,
          additionalInfo: `Distance: ${hoveredFeature.properties.Distance} km`,
        };
        //else if it's a historic line, do this
      } else if (hoveredFeature.layer.id === "line") {
        tooltipInfo = {
          name: hoveredFeature.properties.RouteName,
          company: hoveredFeature.properties.Company,
          startYear: hoveredFeature.properties.StartDate,
          endYear: hoveredFeature.properties.FinishDate,
        };
      }

      //appends the information to the feature that was hovered over
      setHoverInfo({
        feature: hoveredFeature,
        x,
        y,
        ...tooltipInfo,
      });
    } else {
      setHoverInfo(null);
    }
  }, []);

  const validYears = [1846, 1876, 1906, 1920, 1936, 1976, 2024];

  //making sure only years with data are selectable on the slider
  const handleYearChange = useCallback((year: string) => {
    const numYear = parseInt(year);
    // Find the closest valid year for the slider
    const closestYear = validYears.reduce((prev, curr) =>
      Math.abs(curr - numYear) < Math.abs(prev - numYear) ? curr : prev
    );
    setSelectedYear(closestYear);
  }, []);

  const currentStopsData = useMemo(() => {
    // switch (selectedYear) {
    //   case 1846:
    //     return stops_1846;
    //   case 1876:
    //     return stops_1876;
    //   case 1906:
    //     return stops_1906;
    //   case 1920:
    //     return stops_1920;
    //   case 1936:
    //     return stops_1936;
    //   case 1976:
    //     return stops_1976;
    //   default:
    //     return railstops_modern;
    // }
    return selectedYear === 2024 ? railstops_modern : null;
  }, [selectedYear]);

  const currentData = useMemo(() => {
    switch (selectedYear) {
      case 1846:
        return railnetwork_1846;
      case 1876:
        return railnetwork_1876;
      case 1906:
        return railnetwork_1906;
      case 1920:
        return railnetwork_1920;
      case 1936:
        return railnetwork_1936;
      case 1976:
        return railnetwork_1976;
      default:
        return railnetwork_modern;
    }
  }, [selectedYear]);

  useEffect(() => {
    console.log(selectedYear, currentData);
  }, [selectedYear, currentStopsData, currentData]);

  const handleSearchAreaDefined = useCallback((area: CircleArea) => {
    setSearchArea(area);

    console.log("Search area defined:", area);
  }, []);

  const combinedData = useMemo(() => {
    // For years 1936 and 1976, combine historical and modern data
    if ([1936, 1976].includes(selectedYear)) {
      // Combine features from both the selected year's data and the modern rail data
      return {
        type: "FeatureCollection",
        features: [...currentData.features, ...railnetwork_modern.features],
      };
    }

    return selectedYear >= 1936 ? railnetwork_modern : currentData;
  }, [selectedYear, currentData]);

  useEffect(() => {
    if (searchArea && combinedData) {
      // Convert the search area circle to a polygon for the spatial query
      const searchPolygon = turf.circle(
        searchArea.center,
        searchArea.radiusInKm,
        { steps: 64, units: "kilometers" }
      );

      // to capture specific properties from features within the search area
      const featureDetails = [];

      combinedData.features.forEach((feature) => {
        if (turf.booleanIntersects(feature, searchPolygon)) {
          //feature to differentiate historic from modern
          const isHistoric = feature.properties.hasOwnProperty("Length");
          const detail = {
            // Common property
            RouteName: feature.properties.RouteName || "Unknown route name",

            // Conditionally include 'length' if it's a historic rail feature
            ...(isHistoric && { Length: feature.properties.Length + " km" }),
          };
          featureDetails.push(detail);
        }
      });

      //next step is to pass this data to a new component that renders conditionally on the map
      //hold values in state, update them accordingly, pass those down to a new component that renders on the UI and displays the features
      console.log(
        `Features within 5km of searched location and relevant to the year ${selectedYear}:`,
        featureDetails
      );
    }
  }, [searchArea, selectedYear, combinedData]);

  const pointLayerStyle = {
    id: "point",
    type: "circle",
    source: "stations",
    paint: {
      "circle-radius": 7,
      "circle-color": "#80C5AF",
    },
  };

  const lineLayerStyle = {
    id: "line",
    type: "line",
    source: "railway",
    paint: {
      "line-width": 3,
      "line-color": "#FDF3AC",
    },
  };

  const lineLayerStyleModern = {
    id: "line-modern", // Unique ID for the modern layer
    type: "line",
    source: "railway-modern",
    paint: {
      "line-width": 3,
      "line-color": "#FDF3AC",
    },
  };

  return (
    <ReactMapGL
      style={{ width: "100vw", height: "80vh" }}
      {...viewState} //takes initial state instructions
      reuseMaps //prevents unnecessary reloading
      mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
      onMove={(evt) => setViewState(evt.viewState)} //updates state for view upon movement on the map
      mapStyle='mapbox://styles/e-pye2/cltlvd85s00a001ph4vebdrn4' //link to JSON style from mapbox studio
      interactiveLayerIds={[
        "line",
        "point",
        ...(selectedYear >= 1936 ? ["line-modern"] : []), //making sure to render both layers if year is equal or greater than 1936
      ]}
      onMouseMove={onHover} //hover features display function
      ref={mapRef} //storing details about current map view
      onLoad={fitMapToCircle} //triggers once search goes off
    >
      {/*render modern routes if the year is 1936 or later to make up for data gap -- temporary fix*/}
      {selectedYear >= 1936 && (
        <Source id='railway-modern' type='geojson' data={railnetwork_modern}>
          <Layer {...lineLayerStyleModern} />
        </Source>
      )}

      <Source id='railway' type='geojson' data={currentData}>
        <Layer {...lineLayerStyle} />
      </Source>
      {selectedYear == 2024 && (
        <Source id='stations' type='geojson' data={currentStopsData}>
          <Layer {...pointLayerStyle} />
        </Source>
      )}

      {hoverInfo && (
        <div
          className='tooltip'
          style={{ left: hoverInfo.x + 10, top: hoverInfo.y + 10 }}
        >
          <div>
            <strong>Name: </strong>
            {hoverInfo.name}
          </div>
          <div>
            <strong>Company: </strong>
            {hoverInfo.company}
          </div>
          {hoverInfo.startYear && (
            <div>
              <strong>Opening Year: </strong> {hoverInfo.startYear}
            </div>
          )}
          {hoverInfo.endYear && (
            <div>
              <strong>Closing Year: </strong> {hoverInfo.endYear}
            </div>
          )}
          {hoverInfo.additionalInfo && (
            <div>
              <strong>Other Info: </strong> {hoverInfo.additionalInfo}
            </div>
          )}
        </div>
      )}

      <GeocoderControl
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        position='top-left'
        placeholder='See your 5km radius'
        onSearchAreaDefined={handleSearchAreaDefined}
      />
      {/*when the search area is defined by a user search, create the radius circle layer on the map which is the search polygon utilised by turf.js*/}
      {searchArea && (
        <Source
          id='search-area'
          type='geojson'
          data={turf.circle(searchArea.center, searchArea.radiusInKm, {
            steps: 64,
            units: "kilometers",
          })}
        >
          <Layer
            id='circle-fill'
            type='fill'
            paint={{
              "fill-color": "#F8DBCF",
              "fill-opacity": 0.4,
            }}
          />
        </Source>
      )}
      <ControlPanel selectedYear={selectedYear} onChange={handleYearChange} />
    </ReactMapGL>
  );
}
