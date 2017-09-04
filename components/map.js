FW.components.Map = function (domr, controller) {
  
    "use strict";

    var Map = FW.components.Component('Map', domr, controller); 

    Map.map = null;
    
    Map.center = [-40, -10];
    Map.list = [];
    Map.layers = [];

    var zoom = 5;
    var marker = 'reservatorio';
    var center = [-40, -10];

    function init(domr, controller) {

        marker = Map.getAttr('fw-map-marker') || marker;            
        zoom = Map.getAttr('fw-map-zoom') || zoom;
        center = parseCenter(Map.getAttr('fw-map-center')) || center;

        Map.map = new ol.Map({
            layers: [getRasterLayer()],
            target: domr[0],
            view: new ol.View({
              center: ol.proj.fromLonLat(center),
              zoom: zoom
            })
        }); 

        Map.load();

        return Map;
    };

    function getRasterLayer() {
        return new ol.layer.Tile({
            source: new ol.source.OSM()
        });
    };

    function parseCenter(center) {
        if (!center)
            return null;

        if (!typeof center == 'string')
            return null;

        var parts = center.split(',');

        if (parts.length != 2)
            return null;

        return [parseFloat(parts[0]), parseFloat(parts[1])];
    };

    Map.load = function(callbacks, filters) {

        if (!callbacks)
            callbacks = [];

        Map.list = [];

        if (!callbacks.hasOwnProperty('done')) {
            callbacks['done'] = function(xhr) {

                for (var item in xhr.list) {

                    var reg = xhr.list[item];

                    if (reg.geom) {

                        var lat = null;
                        var lon = null;

                        if (reg.hasOwnProperty('latitude')) 
                            lat = reg.latitude;
                        else if (reg.hasOwnProperty('lat'))
                            lat = reg.lat;

                        if (reg.hasOwnProperty('longitude'))  
                            lon = reg.longitude;
                        else if (reg.hasOwnProperty('lon'))
                            lon = reg.lon;

                        if (!lat && reg.hasOwnProperty('geom') && reg.geom.hasOwnProperty('coordinates')) {
                            lat = reg.geom.coordinates[0];
                            lon = reg.geom.coordinates[1];
                        }

                        if (!lat || !lon)
                            return;

                        var point = new ol.geom.Point(ol.proj.fromLonLat([parseFloat(lon), parseFloat(lat)]));

                        var regPoint = new ol.Feature({
                            geometry: point,
                            id: reg.id,
                            name: reg.nome,
                        });

                        var color = null;

                        if (FW.getModule(Map.getController()).parsers.hasOwnProperty('color')) 
                            color = FW.getModule(Map.getController()).parsers.color(reg);

                        if (FW.getModule(Map.getController()).parsers.hasOwnProperty('marker')) 
                            marker = FW.getModule(Map.getController()).parsers.marker(reg);

                        if (!marker) return;

                        var pointStyle = {                                     
                            crossOrigin: 'anonymous',
                            src: FW.getUrlBase() + '/img/' + marker + '.png'
                        }

                        if (color)
                            pointStyle.color = color;

                        regPoint.setStyle(new ol.style.Style({
                            image: new ol.style.Icon((pointStyle))
                        })); 
                                                
                        Map.list.push(regPoint);
                    }                    
                }

                var vectorSource = new ol.source.Vector({
                    features: Map.list
                });

                var vectorLayer = new ol.layer.Vector({
                    source: vectorSource                
                });

                Map.layers.push(vectorLayer);

                var onClickFunction = function(e) {                                 
                    var clicado = false;                    
                    Map.map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
                        if (!clicado) {
                            var coordinate = e.coordinate;
                            var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
                                coordinate, 'EPSG:3857', 'EPSG:4326'));

                            FW.getModule(Map.getController()).actions.modalShow({id: feature.get('id')});
                        }

                        clicado = true;
                    });
                };

                Map.map.removeEventListener("click", onClickFunction);
                Map.map.on("click", onClickFunction);

                Map.addLayer(vectorLayer);                
            }
        }

        FW.helpers.Rest.getList(Map.getController(), callbacks, $.extend({limit: 9999999}, filters));

        return Map;
    };

    Map.addLayer = function(layer) {
        Map.map.addLayer(layer);  
        return Map;
    };

    Map.refresh = function() {

        Map.clean();

        Map.load(null, Map.getParams());

        return Map;
    };

    Map.clean = function() {

        for (var item in Map.layers) {
            Map.map.removeLayer(Map.layers[item]);
        }

        return Map;
    };

    Map.setZoom = function(zoom) {
        Map.zoom = zoom;
        return Map;
    };

    Map.setCenter = function(center) {
        Map.center = center;
        return Map;
    }

    return init(domr, controller);    
};