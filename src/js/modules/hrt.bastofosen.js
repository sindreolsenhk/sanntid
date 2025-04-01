// Wrapped as anonymous function to not spill variables to window/global
(() => {
    // Bastø Fosen boat GPS
    // Waiting for Kystverket for AIS data
    // Meanwhile doing some trixing through nodered and 3rd party

    let basto_icon = new materialIcon("directions_boat", "#00f");
    let url = 'https://nodered.horten.kommune.no/ais.geojson';
    var BastoFosen = new MapMaker("AIS: Bastøfergene", [], mymap, layer_control_widget, true);

    // Helper-function for onEach
    // Thanks to https://gist.github.com/basarat/4670200 User: basarat
    function getCardinal(angle) {
        /** 
         * Customize by changing the number of directions you have
         * We have 8
         */
        const degreePerDirection = 360 / 8;
      
        /** 
         * Offset the angle by half of the degrees per direction
         * Example: in 4 direction system North (320-45) becomes (0-90)
         */
        const offsetAngle = angle + degreePerDirection / 2;
      
        return (offsetAngle >= 0 * degreePerDirection && offsetAngle < 1 * degreePerDirection) ? "N"
          : (offsetAngle >= 1 * degreePerDirection && offsetAngle < 2 * degreePerDirection) ? "NØ"
            : (offsetAngle >= 2 * degreePerDirection && offsetAngle < 3 * degreePerDirection) ? "Ø"
              : (offsetAngle >= 3 * degreePerDirection && offsetAngle < 4 * degreePerDirection) ? "SØ"
                : (offsetAngle >= 4 * degreePerDirection && offsetAngle < 5 * degreePerDirection) ? "S"
                  : (offsetAngle >= 5 * degreePerDirection && offsetAngle < 6 * degreePerDirection) ? "SV"
                    : (offsetAngle >= 6 * degreePerDirection && offsetAngle < 7 * degreePerDirection) ? "V"
                      : "NV";
      }

    function bastoOnRefresh(layer, current) {
        current.bindTooltip(layer._tooltip._content);
        current.bindPopup(layer._popup._content);
        current.setLatLng(layer.getLatLng());

        // TODO BUG!!! :
        // if setLatLng is called while marker is off map it will DUPLICATE! Looks like cluster issue?
        // Confirmed; doesn't happen without cluster.
        // Possible work-around: add null-return to refreshLayer() if not on map? stops any updating..
        // ^ altho not ajax, which is half the point
        /*
         * Test with: AndroidGPSTracker.getLayers()[0].setLatLng(AndroidGPSTracker.getLayers()[0].getLatLng())
         * and: AndroidGPSTracker.getLayers()
         * Works well, then remove from layer_ctrl clears markers
         * then, when adding to layer_ctrl, it creates a double!
        */
    }
    function bastoEachFeature(geoJsonPoint, latlng) {
        try {
            // Catch and return any vessel but Basto-ferries
            if (!geoJsonPoint.properties.name.toLowerCase().startsWith("basto")) {
                return;
            }
        }
        catch(e) {
            return;
            // Return nothing also if no name-property is set
        }
        let marker = L.marker(latlng, { 'icon': basto_icon });
        marker.bindTooltip(geoJsonPoint.properties.name || "[MANGLER NAVN]");
        try {
            marker.bindPopup(`Navn: ${geoJsonPoint.properties.name}<br>
                              Callsign: ${geoJsonPoint.properties.callSign}<br>
                              Fart: ${geoJsonPoint.properties.sog} knop<br>
                              Kurs: ${geoJsonPoint.properties.trueHeading}&deg; ${getCardinal(geoJsonPoint.properties.trueHeading)}<br>
                              Type: ${geoJsonPoint.properties.shipType}<br>
                              MMSI: ${geoJsonPoint.properties.mmsi}`);
        }
        catch(e) {
            // Fallback to ugly-print
            marker.bindPopup(JSON.stringify(geoJsonPoint.properties, undefined, 2).replace(/\n/g, "<br>"));
        }
        marker.uniqueId = geoJsonPoint.properties.mmsi;
        return marker;
    }

    function basto_wrapper() {
        ajax(url, 'GET', function (json) {
            let layerArray = geoJsonToLayerArray(json, bastoEachFeature);
            refreshLayer(BastoFosen, layerArray, bastoOnRefresh);
        });
    }
    basto_wrapper();
    setInterval(basto_wrapper, 5000); // 5s
})();