/**
 * @param {string} layerName
 * @param {function,array} markers
 * @param {L.map} mapObj
 * @param {L.control} Lcontrol
 * @param {bool} nonClustered
 **/
function MapMaker(layerName, markers, mapObj, Lcontrol, nonClustered = false, args) {

    // Init helper function
    /*function _checkArgs(args) {
        // Define required keys of args
        const requiredParamsOfArgs = ["markers", "icon"];
        // Check for args as type object
        if (typeof args !== "object") throw new Error("MapMaker needs an array containing: "+requiredParamsOfArgs.toString());
        // Make a const holder for boolean value and check if all required properties are present in args
        const hasAllRequiredKeys = requiredParamsOfArgs.every(item => args.hasOwnProperty(item));
        if (hasAllRequiredKeys !== true) throw new Error("Required params of MapMaker({}): "+requiredParamsOfArgs.toString());
    }*/
    // Public functions of returned object


    // Check args for required params
    //_checkArgs(args);

    // Accept both a generator-function and array as markers
    _markers = typeof markers === "function" ? markers() : markers;
    // Next line commented. Doesn't work well with L.control. Want to have all types in same Cluster tho..
    //this.layersGroup = L.layerGroup(Object.values(this._markers));
    this._layerName = layerName;

    // Checks if the layer should be clustered or not
    if (nonClustered === true) {
        this.markerClusterGroup = L.layerGroup(Object.values(_markers));
    }
    else {
        this.markerClusterGroup = L.featureGroup.subGroup(
            globalClusterGroup,
            Object.values(_markers)
        );
        //this.markerClusterGroup = L.markerClusterGroup({ disableClusteringAtZoom: 15, spiderfyOnMaxZoom: false }).addLayers(Object.values(_markers));
    }

    // Does some auto
    if (Lcontrol !== undefined && Lcontrol !== null) {
        Lcontrol.addOverlay(this.markerClusterGroup, this._layerName);
    }
    if (mapObj !== undefined && mapObj !== null) {
        this.markerClusterGroup.addTo(mapObj);
    }

    return this.markerClusterGroup;

}

/**
 * Takes a layerGroup as input and makes it contain layerArray by either adding, deleting or updating currently existing layers in layerGroup.
 * IMPORTANT: YOU NEED TO HAVE A .uniqueId ON YOUR L.marker's in layerArray!!
 * @param {object} layerGroup: Object of layerGroup type or inherited type, like cluster
 * @param {array} layerArray: Array of new layers/markers which the layerGroup should contain
 **/
function refreshLayer(layerGroup, layerArray, updateFn) {
    if (typeof layerGroup !== "object") throw new Error("Requires object: layerGroup as first arg")
    if (!Array.isArray(layerArray)) throw new Error("Requires array: layerArray as second arg")
    if (typeof updateFn !== "function") updateFn = function () { return null };
    // Delete, add and update existing

    // Do adds, updates and deletes in current dataset
    layerArray.forEach((layer) => {
        let curExisting = layerGroup.getLayers().find((curLayer) => { return curLayer.uniqueId === layer.uniqueId; });
        // If already exists, update or do nothing
        if (typeof curExisting !== "undefined") {
            // Skipping, nothing to update - should update tho, but how the heeeck, that's alot of looping and checking
            updateFn(layer, curExisting);
        }
        // Else, this is new
        else {
            // Add the newly seen layer
            layerGroup.addLayer(layer);
        }

    });
    // Now loop for curExisting not in rense_layer to delete old
    // TODO: Can be made better if we add timestamp earlier to LayerUpdates, then rense_layer.filter(x=>x.timestamp > now())
    layerGroup.getLayers().forEach((curLayer) => {
        if (layerArray.find((layer) => { return layer.uniqueId === curLayer.uniqueId })) {
            // Skip, it exists
        }
        else {
            // Remove obsolete layer
            layerGroup.removeLayer(curLayer);
        }
    });
}
