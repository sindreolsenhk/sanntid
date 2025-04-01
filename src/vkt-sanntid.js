{
    var buses_realtime;
    var vkt_markers = {};
    var vkt_mark_for_flush = false;

    function getVKTbuses() {
        console.debug("Fetching buses from VKT");
        // Set flush flag, used by getRealtimeBus()
        vkt_mark_for_flush = true;
        // url for active buses from BusStop: Horten Rutebilstasjon, multiple stopCodes
        let url = 'https://sanntid.vkt.no/api/fara/schedule/departures?citySymbol=NO_VESTFOLD&fullSchedule=false&stopGroupDepartures=true&stopCode=NSR_QUAY_32738&stopCode=NSR_QUAY_105828&stopCode=NSR_QUAY_105825&stopCode=NSR_QUAY_105827&stopCode=NSR_QUAY_105826';
        // Get active buses
        let request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                //console.debug("VKT replied " + this.status);
                let buses_available = JSON.parse(this.response);

                // Place all stops into one array (All lines from all stops at Horten rutebilstasjon)
                let lines = [];
                buses_available.stops.forEach(stop => { lines.push(...stop.lines); });

                // Register all buses with realtime info to variable
                buses_realtime = _getAvaiableRealtimes(lines); //buses_available.stops[0].lines
            }
        }
        request.send();
    }

    function _getAvaiableRealtimes(lines) {
        // Array for all buses with available realtime info
        let buses_realtime = [];
        // Loop through all available lines from the busStop
        lines.forEach(function (line) {
            // Skip if line has no departures
            if (line.departures === undefined) {
                return null;
            }
            // Get all departures from the line
            line.departures.forEach(function (departure) {
                if (departure.realtimeId !== undefined) {
                    // Populate the global object buses_realtime with all available realtimeIds and metadata
                    buses_realtime.push({
                        lineName: line.lineName,
                        lineDirectionName: line.lineDirectionName,
                        realtimeId: departure.realtimeId
                    });
                }
            });
        });

        return buses_realtime;
    }

    function getRealtimeBus() {
        // Stop executing if layer control has unchecked the VKT layer.
        if (layer_control_widget._map.hasLayer(vkt_layerGroup) === false) {
            return undefined;
        }
        // Flush exisiting vkt_markers from map and reset object if flush-flag is set
        // Is put in this function so markers will be as good as instanly reloaded, instead of waiting for setInterval
        if (vkt_mark_for_flush === true) {
            _flushVktMarkers();
        }

        // Check for global (window) variable for buses with realtime info about them
        if (buses_realtime !== undefined && buses_realtime.length > 0) {
            // Prepare jsondata packet to VKT
            let jsondata = {
                "citySymbol": "NO_VESTFOLD",
                "vehicles": []
            };
            // Fill jsondata with each realtimeId we want info about
            buses_realtime.forEach(function (realtimeBus) {
                jsondata.vehicles.push({ "realtimeId": realtimeBus.realtimeId });
            });

            // Go request info about the realtimeIds from VKT API
            let url = 'https://sanntid.vkt.no/api/fara/realtime';
            // Get active buses
            let request = new XMLHttpRequest();
            request.open('POST', url, true);
            request.onload = function () {
                if (this.status >= 200 && this.status < 400) {
                    _processRecievedRealtimeBuses(JSON.parse(this.response));
                }
            }
            request.setRequestHeader("Content-type", "application/json");
            request.send(JSON.stringify(jsondata));
        }
    }

    function _processRecievedRealtimeBuses(vkt_response) {
        window.kekbur = vkt_response;
        // Check response for vehicles, else return
        if (vkt_response.vehicles === undefined) return null;
        // Loop through each vehicle
        // Process of adding or editing coordinates on vkt_markers. If new, add to layer. Layer flushing is done in getRealtimeBus()
        vkt_response.vehicles.forEach(function (vehicle, index) {
            if (vehicle.path[0].coordinate !== undefined) {
                let long = vehicle.path[0].coordinate.x_lon;
                let lat = vehicle.path[0].coordinate.y_lat;
                if (vkt_markers.hasOwnProperty(vehicle.realtimeId)) {
                    vkt_markers[vehicle.realtimeId].setLatLng([lat, long]);
                } else {
                    // Link resulted json object to buses_realtime object by joining on realtimeId.
                    // TODO: This sometimes fails. Casts error about lineName not existing. Not sure why.
                    let obj_link = buses_realtime.filter((x) => x.realtimeId == vehicle.realtimeId);
                    if (obj_link[0].lineName === undefined) console.debug(obj_link);
                    vkt_markers[vehicle.realtimeId] = L.marker([lat, long], { icon: bus_icon })
                        .bindTooltip(obj_link[0].lineName + " til " + obj_link[0].lineDirectionName)
                        .bindPopup("<a target=\"_blank\" href=\"https://sanntid.vkt.no\">Bussinfo fra VKT</a>");
                    // Register this marker with the map layer
                    vkt_layerGroup.addLayer(vkt_markers[vehicle.realtimeId]);
                }
            }
        });
    }

    // TODO: If we pass the newest array to this function, it can clean up only the lost buses!! :)
    function _flushVktMarkers() {
        // Clear existing vkt_markers, as some buses might no longer be available for realtime
        for (let [key, value] of Object.entries(vkt_markers)) {
            vkt_layerGroup.removeLayer(value);
        }
        vkt_markers = {};
        // Remove flush-flag
        vkt_mark_for_flush = false;
    }

    // No more stuff here, going async!

}
