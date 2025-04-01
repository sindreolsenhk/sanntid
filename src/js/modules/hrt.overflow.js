// Wrapped as anonymous function to not spill variables to window/global
(() => {
    console.log("Starting module: hrt.overflow");
    // Overløpssensorer

    let overflow_icon = new materialIcon("water_damage", "blue");
    let url = 'https://nodered.horten.kommune.no/geojson/overlop.geojson';
    var Overflow = new MapMaker("Overløp", [], undefined, layer_control_widget);

    function onRefresh(layer, current) {
        current.bindTooltip(layer._tooltip._content);
        current.bindPopup(layer._popup._content);
    }
    let onEachFeature = (geoJsonPoint, latlng) => {
        if (geoJsonPoint.properties && geoJsonPoint.properties.device) {
            // Convert to local time
            let local_time = new Date(geoJsonPoint.properties.time).toLocaleString();

            // Create the marker
            let marker = L.marker(latlng, { 'icon': overflow_icon });

            // Add stuff/settings/whatever to marker
            marker.bindPopup(`ID: ${geoJsonPoint.properties.device}<br>
                              Avlest: ${local_time}<br>
                              Overløpsnivå 1: ${geoJsonPoint.properties.overflow01 ? "Nådd" : "Ikke nådd"}<br>
                              Overløpsnivå 2: ${geoJsonPoint.properties.overflow02 ? "Nådd" : "Ikke nådd"}<br>`);
            marker.bindTooltip(geoJsonPoint.properties.overflow01 + " / " + geoJsonPoint.properties.overflow02);
            marker.uniqueId = geoJsonPoint.properties.device;

            return marker
        }
        return undefined
    }

    function overflow_wrapper() {
        ajax(url, 'GET', function (json) {
            let layerArray = geoJsonToLayerArray(json, onEachFeature);
            refreshLayer(Overflow, layerArray, onRefresh);
        });
    }
    overflow_wrapper();
    setInterval(overflow_wrapper, 1000 * 5); // 1000ms=s, *5 = 5 secs
})();