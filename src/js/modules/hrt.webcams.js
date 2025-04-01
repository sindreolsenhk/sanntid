// Wrapped as anonymous function to not spill variables to window/global
(() => {

    /**
     * 
     * @param {string} imgSrc
     * @param {string} desc
     * @param {string} kilde 
     * @param {string} kildeHref 
     */
    const generateWebcamHTML = function (imgSrc, desc, kilde, kildeHref) {
        return `
        <a target="_blank" href="${imgSrc}" alt="${desc}">
            <img width="400px" src="${imgSrc}">
        </a>
        <br>
        <span>Kilde: <a target="_blank" href="${kildeHref}" alt="${kilde}">${kilde}</a></span>`;
    }

    // Video fra vannet
    let camera_icon = new materialIcon("videocam", "#000")
    let hortenHavn = L.marker([59.4135, 10.4880], { icon: camera_icon })
        .bindPopup(
            generateWebcamHTML(
                "https://nettkamera.cid.no/hortenHavn/current.jpg",
                "Horten gjestehavn",
                "Hortenhavn",
                "https://hortenhavn.no"
            ),
            { minWidth: "400px" })
        .bindTooltip("Horten Havn");
    let sykehusBrygga = L.marker([59.4249, 10.4858], { icon: camera_icon })
        .bindPopup(
            generateWebcamHTML(
                "https://nettkamera.cid.no/hortenindreHavn/current.jpg",
                "Sykehusbrygga Indre Havneby",
                "Hortenhavn",
                "https://hortenhavn.no"
            ),
            { minWidth: "400px" })
        .bindTooltip("Sykehusbrygga - Indre Havn");
    let fergeleiet = L.marker([59.4108, 10.4874], { icon: camera_icon })
        .bindPopup(
            generateWebcamHTML(
                "https://nettkamera.cid.no/hortenFergeHavn/current.jpg",
                "Horten fergeleie",
                "HortenHavn",
                "https://hortenhavn.no"),
            { minWidth: "400px" })
        .bindTooltip("Fergeleiet Bastø Fosen");
    let asgHavn = L.marker([59.3500, 10.4726], { icon: camera_icon })
        .bindPopup(
            generateWebcamHTML(
                "https://nettkamera.cid.no/asgardHavnVest/current.jpg",
                "Åsgårdstrand havn",
                "HortenHavn",
                "https://hortenhavn.no"),
            { minWidth: "400px" })
        .bindTooltip("Åsgårdstrand Havn");
    let braarudaasen = L.marker([59.4139, 10.4707], { icon: camera_icon })
        .bindPopup(
            generateWebcamHTML(
                "http://91.90.66.120/axis-cgi/jpg/image.cgi",
                "Braarudåsen",
                "Horten Kommune",
                "https://horten.kommune.no"),
            { minWidth: "400px" })
        .bindTooltip("Braarudåsen");

    // Add to map
    var Webkamera = new MapMaker("Webkamera", [hortenHavn, sykehusBrygga, fergeleiet, asgHavn, braarudaasen], mymap, layer_control_widget);
})();