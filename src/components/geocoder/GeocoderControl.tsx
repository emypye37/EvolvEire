import * as React from "react";
import { useState } from "react";
import { useControl, Marker, MarkerProps, ControlPosition } from "react-map-gl";
import MapboxGeocoder, { GeocoderOptions } from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "./GeocoderControl.css";

//typescript utility omit to ensure type safety
type GeocoderControlProps = Omit<
  GeocoderOptions,
  "accessToken" | "mapboxgl" | "marker"
> & {
  mapboxAccessToken: string;
  marker?: boolean | Omit<MarkerProps, "longitude" | "latitude">;

  position: ControlPosition;

  onLoading?: (e: object) => void;
  onResults?: (e: object) => void;
  onResult?: (e: object) => void;
  onError?: (e: object) => void;
  onSearchAreaDefined?: (area: {
    center: [number, number];
    radiusInKm: number;
  }) => void;
};

export default function GeocoderControl(props: GeocoderControlProps) {
  const [marker, setMarker] = useState(null);

  //custom react map gl hook for using mapbox controls in React, where the wrapper comes in handy
  const geocoder = useControl<MapboxGeocoder>(
    () => {
      const ctrl = new MapboxGeocoder({
        ...props,
        marker: false,
        accessToken: props.mapboxAccessToken,
      });
      //functions from MyMap that are passed as props and act on the MapboxGeocoder
      ctrl.on("loading", props.onLoading);
      ctrl.on("results", props.onResults);
      //when user selects a result for searching
      ctrl.on("result", (evt) => {
        props.onResult(evt);

        const { result } = evt;
        //extracts location geometry info about the result
        const location =
          result &&
          (result.center ||
            (result.geometry?.type === "Point" && result.geometry.coordinates));
        //sets a marker if location exists, using lat and long
        if (location) {
          if (props.marker) {
            setMarker(
              <Marker
                {...props.marker}
                longitude={location[0]}
                latitude={location[1]}
              />
            );
          } else {
            setMarker(null);
          }
          //sets the search area to be the center of the location plus a radius of 5km, which is used in MyMap
          props.onSearchAreaDefined?.({
            center: location,
            radiusInKm: 5,
          });
        }
      });
      ctrl.on("error", props.onError);
      return ctrl;
    },
    {
      //defines where the search bar is in the UI
      position: props.position,
    }
  );

  //MaxBox geocoder option
  if (geocoder._map) {
    if (
      geocoder.getProximity() !== props.proximity &&
      props.proximity !== undefined
    ) {
      geocoder.setProximity(props.proximity);
    }
    if (
      geocoder.getRenderFunction() !== props.render &&
      props.render !== undefined
    ) {
      geocoder.setRenderFunction(props.render);
    }
    if (
      geocoder.getLanguage() !== props.language &&
      props.language !== undefined
    ) {
      geocoder.setLanguage(props.language);
    }
    if (geocoder.getZoom() !== props.zoom && props.zoom !== undefined) {
      geocoder.setZoom(props.zoom);
    }
    if (geocoder.getFlyTo() !== props.flyTo && props.flyTo !== undefined) {
      geocoder.setFlyTo(props.flyTo);
    }
    if (
      geocoder.getPlaceholder() !== props.placeholder &&
      props.placeholder !== undefined
    ) {
      geocoder.setPlaceholder(props.placeholder);
    }
    if (
      geocoder.getCountries() !== props.countries &&
      props.countries !== undefined
    ) {
      geocoder.setCountries(props.countries);
    }
    if (geocoder.getTypes() !== props.types && props.types !== undefined) {
      geocoder.setTypes(props.types);
    }
    if (
      geocoder.getMinLength() !== props.minLength &&
      props.minLength !== undefined
    ) {
      geocoder.setMinLength(props.minLength);
    }
    if (geocoder.getLimit() !== props.limit && props.limit !== undefined) {
      geocoder.setLimit(props.limit);
    }
    if (geocoder.getFilter() !== props.filter && props.filter !== undefined) {
      geocoder.setFilter(props.filter);
    }
    if (geocoder.getOrigin() !== props.origin && props.origin !== undefined) {
      geocoder.setOrigin(props.origin);
    }
  }
  return marker;
}

const noop = () => {};

GeocoderControl.defaultProps = {
  marker: true,
  onLoading: noop,
  onResults: noop,
  onResult: noop,
  onError: noop,
};
