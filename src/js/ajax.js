function ajax(url, method, callbackFn) {
    method = typeof method !== 'undefined' ? method : 'GET';
    if (typeof callbackFn !== "function") throw new Error("Requires callback-function that takes json");
    let request = new XMLHttpRequest();
    request.open(method, url, true);
    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            let json = JSON.parse(this.response);
            callbackFn(json);
        }
    }
    request.onerror = function () {
        throw new Error(request.statusText);
        // This is probably not right
    }
    request.send();
    // Should it return a Promise or something?
}

function geoJsonToLayerArray(json, markerDesignerFn) {
    let geojsonObj = L.geoJSON(json, {
        pointToLayer: markerDesignerFn // (geoJsonPoint, latlng) gets passed
    });

    return Object.values(geojsonObj._layers); // No idea what the keys in _layers are for..
}