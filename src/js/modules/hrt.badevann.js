// Wrapped as anonymous function to not spill variables to window/global
(() => {
    // Badevannssensorer

    let bade_icon = new materialIcon("pool", "blue");
    let url = 'https://nodered.horten.kommune.no/badevannstemp_last.geojson';
    var Badevann = new MapMaker("Badevannssensorer", [], mymap, layer_control_widget);

    function badeOnRefresh(layer, current) {
        current.bindTooltip(layer._tooltip._content);
        current.bindPopup(layer._popup._content);
    }
    let onEachFeature = (geoJsonPoint, latlng) => {
        if (geoJsonPoint.properties && geoJsonPoint.properties.device && geoJsonPoint.properties.last) {
            // Convert to local time
            let local_time = new Date(geoJsonPoint.properties.time).toLocaleString();

            // Create the marker
            let marker = L.marker(latlng, { 'icon': bade_icon });

            // Add stuff/settings/whatever to marker
            marker.bindPopup('Sted: '
                + geoJsonPoint.properties.device
                + '<br/>Temperatur: '
                + geoJsonPoint.properties.last
                + '&deg;C<br/>Siste måling: '
                + local_time);
            marker.bindTooltip(geoJsonPoint.properties.device + ": " + geoJsonPoint.properties.last + "&deg;C", { /*permanent: true,*/ opactity: 0.7 })
            marker.uniqueId = geoJsonPoint.properties.device;

            return marker
        }
        return undefined
    }

    function bade_wrapper() {
        ajax(url, 'GET', function (json) {
            let layerArray = geoJsonToLayerArray(json, onEachFeature);
            refreshLayer(Badevann, layerArray, badeOnRefresh);
        });
    }
    bade_wrapper();
    setInterval(bade_wrapper, 1000 * 60); // 1000ms=s, *60=1min
})();
