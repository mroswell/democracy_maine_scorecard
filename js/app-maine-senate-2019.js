var public_spreadsheet_url = '1nQt3d78MuITuaIzIQOep17c3ATm3uazA_S1BfocUQgU';
var senateLayer;
var MESenateDistricts = {};
var app = {};
var freeze=0;
var $sidebar = $('#sidebar');

var map = L.map('map', {
    scrollWheelZoom: false,
    zoomSnap: 0.25
}).setView([45.3, -69],7);
// var map = L.map('map', {scrollWheelZoom: true}).setView([45.3, -69],7);

// control that shows state info on hover
var info = L.control({position: 'bottomright'});

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = (props ?
        '<b>' + props.NAMELSAD + '</b>'
        : 'Hover over a district');
};

info.addTo(map);
function init() {
    Tabletop.init( {
        key: public_spreadsheet_url,
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
    console.log("geoStyle MESenateDistricts[dist]",MESenateDistricts[dist]);
    var score = MESenateDistricts[dist].score_2019;
    console.log("SCOOOOOOOOORE", score);
    var scoreColor = getColor(score);

    return {
        fillColor: scoreColor,
        weight: 2,
        opacity: 0.3,
        color: '#666',
        dashArray: '0',
        fillOpacity:.6
    }
};

window.addEventListener('DOMContentLoaded', init);

var dist;

$(document).ready(function () {
    var allDistrictsSource = $("#senate-template-bottom").html();
    app.template = Handlebars.compile(allDistrictsSource);
    var sourcebox = $("#senate-template-infobox").html();
    app.infoboxTemplate = Handlebars.compile(sourcebox);
    Tabletop.init( { key: public_spreadsheet_url,
        callback: showInfo,
        simpleSheet: true } )
// }
    // showInfo(data);
});
function showInfo(sheet_data, tabletop) {
    var scoreColor;

    $.each(tabletop.sheets("Maine State Senate").all(), function(i, member) {
        scoreColor = getColor(member.score_2019);
        member['scoreColor'] = scoreColor;

        MESenateDistricts[member.current_district] = member;
         // console.log('member', member);
        // MESenateDistricts[member.current_district].partyAbbrev = MESenateDistricts[member.current_district].current_party.charAt(0).toUpperCase();
        var html = app.template(member);
        $("#allDistricts").append(html);

    });
    loadGeo();

}
// console.log('MESenateDistricts', MESenateDistricts);
function loadGeo(district) {
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.light'
    }).addTo(map);

    senateLayer = L.geoJson(geosenate, {
        onEachFeature: onEachFeature,
        style: geoStyle
    });

    senateLayer.addTo(map);
}

// get color depending on score value
function getColor(score) {
    return score > 99 ? '#4EAB07' :
        score > 74 ? '#82e0c3' :
            score > 49 ? '#FEF200' :
                score > 24 ? '#FDC300' :
                    score > 0 ? '#FC8400' :
                        'rgb(255,0,0)';
}


function highlightFeature(e) {
    var layer = e.target;
    var districtNumber = layer.feature.properties.NAMELSAD.split(' ').pop();
    var memberDetail = MESenateDistricts[districtNumber];
    if(!memberDetail){
        console.log("No memberDetail");
        return;
    }
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    if (!freeze) {
        html = app.infoboxTemplate(memberDetail);
        $sidebar.html(html);
        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
        info.update(layer.feature.properties);
    }
}

function resetHighlight(e) {
    var layer = e.target;
    senateLayer.resetStyle(e.target);
    // layer.resetStyle(e.target);
    info.update();
}

function mapMemberDetailClick(e) {
    freeze = 1;
    var boundary = e.target;
    // var memberNumber = Number(boundary.feature.properties.SLDUST);
    var districtNumber = boundary.feature.properties.NAMELSAD.split(' ').pop();

    // console.log("mapMemberDetailClick: ", memberNumber);
    var member = memberDetailFunction(districtNumber);
}

function memberDetailFunction(memberNumber) {
    var districtDetail = MESenateDistricts[memberNumber];
    var html = app.infoboxTemplate(districtDetail);
    $('#sidebar').html(html);
}
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: mapMemberDetailClick
    });
}

map.attributionControl.addAttribution('District Boundaries &copy; <a href="http://census.gov/">US Census Bureau</a>');


// var legend = L.control({position: 'topright'});
//
// legend.onAdd = function (map) {
//
//     const div = L.DomUtil.create('div', 'info legend');
//
//     // div.innerHTML = labels.join('<br>');
//     div.innerHTML = "" +
//         "        <i style=\"background:#FF0000\"></i> 0%<br>\n" +
//         "        <i style=\"background:#FC8400\"></i>1–24%<br>\n" +
//         "        <i style=\"background:#FDC300\"></i> 25–49%<br>\n" +
//         "        <i style=\"background:#FEF200\"></i> 50–74%<br>\n" +
//         "        <i style=\"background:#82e0c3\"></i> 75–99%<br>\n" +
//         "         <i style=\"background:#4EAB07\"></i> 100%";
//     return div;
// };
//
// legend.addTo(map);

$(document).on("click",".close",function(event) {
    event.preventDefault();
    clearInfobox();
    freeze=0;
});

function clearInfobox() {
    $sidebar.html(' ');
    // styleDistrict(frozenDist,1,0.3,'#666',1); //TODO
}
