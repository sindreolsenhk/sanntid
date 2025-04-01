// Wrapped as anonymous function to not spill variables to window/global
(() => {
    let weather_icon = new materialIcon("filter_drama");
    let weather_html = `<iframe src="https://grafana.horten.kommune.no/d/U_yJLsO4k/vaerstasjoner?orgId=1&refresh=10s" width="100%" height="99%"></iframe>`;
    let weatherstations = {
        nykirke: L.marker([59.4241,10.3838], { icon: weather_icon })
                    .bindTooltip('Værstasjon: Nykirke')
                    .on('click', function(e) { html2modal(weather_html)}),
        rorasen: L.marker([59.4196,10.4641], { icon: weather_icon })
                    .bindTooltip('Værstasjon: Røråsen/Horten')
                    .on('click', function(e) { html2modal(weather_html)}),
        hortenHavn: L.marker([59.4138, 10.4873], { icon: weather_icon })
                    .bindTooltip('Værstasjon: Horten havn')
                    .on('click', function(e) { html2modal(weather_html)}),
        skoppum: L.marker([59.3834,10.4239], { icon: weather_icon })
                    .bindTooltip('Værstasjon: Skoppum')
                    .on('click', function(e) { html2modal(weather_html)}),
        asgardstrand: L.marker([59.3504,10.4554], { icon: weather_icon })
                    .bindTooltip('Værstasjon: Åsgårdstrand')
                    .on('click', function(e) { html2modal(weather_html)}),
    };
    var Weatherstations = new MapMaker("Værstasjoner", Object.values(weatherstations), mymap, layer_control_widget);
})();