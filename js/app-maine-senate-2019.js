var public_spreadsheet_url = '1nQt3d78MuITuaIzIQOep17c3ATm3uazA_S1BfocUQgU';
var MESenateDistricts = {};
var app = {};
var map = L.map('map', {scrollWheelZoom: false}).setView([45.3, -69], 7);

function init() {
    Tabletop.init( { key: public_spreadsheet_url,
        callback: showInfo,
        // simpleSheet: true,
        parseNumbers: true
    } )
}


var geoStyle = function(data) {
    var dist = data.properties.NAMELSAD.split(' ').pop();
    console.log(dist);
    // var sldlst = data.properties.SLDLST;
    // sldlst = sldlst.replace(/^0+/, '');
    // var fillColor = getColor(MESenateDistricts[dist].score_2019.toString());
    // var rownum = Number(data.properties.rownum);
    console.log("geoStyle MESenateDistricts[dist]",MESenateDistricts);
    var score = MESenateDistricts[dist].score_2019;
    var scoreColor = getColor(score);

    return {
        fillColor: scoreColor,
        weight: 2,
        opacity: 0.3,
        color: '#666',
        dashArray: '0',
        fillOpacity:.7
    }
};

window.addEventListener('DOMContentLoaded', init);

var dist;

$(document).ready(function () {
    Tabletop.init( { key: public_spreadsheet_url,
        callback: showInfo,
        simpleSheet: true } )
// }
    // showInfo(data);
    loadGeo();
});
function showInfo(sheet_data) {
    var scoreColor;
    var source = $("#senate-template").html();
    var template = Handlebars.compile(source);
    var sourcebox = $("#senate-template-infobox").html();
    app.infoboxTemplate = Handlebars.compile(sourcebox);

    for (i = 0; i < sheet_data.length; i++) {
        console.log("showInfo", sheet_data[i]);
        scoreColor = getColor(sheet_data[i].score_2019);
        sheet_data[i]['scoreColor'] = scoreColor;
        MESenateDistricts[sheet_data[i].current_district] = sheet_data[i];
        var html = template(sheet_data[i]);
        $("#content").append(html);
    }
}

function loadGeo(district) {
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.light'
    }).addTo(map);
}
Layer = L.geoJson(geosenate, {
    onEachFeature:onEachFeature,
    style: geoStyle
});

Layer.addTo(map);
// control that shows state info on hover
var info = L.control({position: 'bottomright'});

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML =  (props ?
        '<b>' + props.NAMELSAD + '</b><br />' + props.AWATER + ' people / mi<sup>2</sup>'
        : 'Hover over a district');
};

info.addTo(map);


// get color depending on score value
function getColor(score) {
    return score > 99 ? '#4EAB07' :
        score > 74 ? '#82e0c3' :
            score > 49 ? '#FEF200' :
                score > 24 ? '#FDC300' :
                    score > 0 ? '#FC8400' :
                        'rgb(255,0,0)';
}

function style(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.AWATER)
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

geojson = L.geoJson(geosenate, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

map.attributionControl.addAttribution('District Boundaries &copy; <a href="http://census.gov/">US Census Bureau</a>');


var legend = L.control({position: 'topright'});

legend.onAdd = function (map) {

    const div = L.DomUtil.create('div', 'info legend');

    // div.innerHTML = labels.join('<br>');
    div.innerHTML = "" +
        "        <i style=\"background:#FF0000\"></i> 0%<br>\n" +
        "        <i style=\"background:#FC8400\"></i>1–24%<br>\n" +
        "        <i style=\"background:#FDC300\"></i> 25–49%<br>\n" +
        "        <i style=\"background:#FEF200\"></i> 50–74%<br>\n" +
        "        <i style=\"background:#82e0c3\"></i> 75–99%<br>\n" +
        "         <i style=\"background:#4EAB07\"></i> 100%";
    return div;
};

legend.addTo(map);
