FW.components.Map = function (domr, controller) {
  
    "use strict";

    var Map = FW.components.Component(domr, controller); 

    Map.map = null;
    Map.zoom = 5;
    Map.center = [-40, -10];
    Map.list = [];
    Map.layers = [];

    function init(domr, controller) {

        Map.map = new ol.Map({
            layers: [getRasterLayer()],
            target: domr[0],
            view: new ol.View({
              center: ol.proj.fromLonLat(Map.center),
              zoom: Map.zoom
            })
        }); 

        Map.load();

        return Map;
    };

    function getRasterLayer() {
        return new ol.layer.Tile({
            source: new ol.source.OSM()
        });
    }

    Map.load = function(callbacks, filters) {

        if (!callbacks)
            callbacks = [];

        if (!callbacks.hasOwnProperty('done')) {
            callbacks['done'] = function(xhr) {

                for (var item in xhr.list) {

                    var reg = xhr.list[item];

                    if (reg.geom) {

                        var lat = null;
                        var lon = null;

                        if (reg.hasOwnProperty('latitude')) 
                            lat = reg.latitude;

                        if (reg.hasOwnProperty('longitude'))  
                            lon = reg.longitude;

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

                        regPoint.setStyle(new ol.style.Style({
                            image: new ol.style.Icon(({                                
                                crossOrigin: 'anonymous',
                                src: 'http://localhost:8080/web/applications/portal-ana/application/public/img/reservatorio-azul.png'
                            }))
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

                Map.map.on("click", function(e) {                                    
                    var clicado = false;                    
                    Map.map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
                        if (!clicado) {
                            var coordinate = e.coordinate;
                            var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
                                coordinate, 'EPSG:3857', 'EPSG:4326'));

                            var name = feature.get('name');

                            FW.getModule(Map.getController()).actions.modalShow({id: feature.get('id')});
                        }

                        clicado = true;
                    });
                });

                Map.addLayer(vectorLayer);                
            }
        }

        FW.helpers.Rest.getList(Map.getController(), callbacks, $.extend({limit: 999}, filters));

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