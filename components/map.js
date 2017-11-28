FW.components.Map = function (domr, controller) {
  
    "use strict";

    var Map = FW.components.Component('Map', domr, controller); 

    Map.map = null;
    
    Map.meta = {};

    Map.center = [-40, -10];
    Map.list = [];
    Map.layers = [];

    var zoom = 5;
    var marker = 'reservatorio';
    var center = [-40, -10];

    // popup
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');
    var overlay = new ol.Overlay(({
      element: container,
      autoPan: false,
      autoPanAnimation: {
        duration: 250
      }
    }));

    closer.onclick = function () {
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };

    function init(domr, controller) {

        if (FW.meta.hasOwnProperty(Map.getController()) && FW.meta[Map.getController()].hasOwnProperty('map'))
            Map.meta = FW.meta[Map.getController()].map;
                  
        zoom = Map.meta.zoom || zoom;
        center = Map.meta.center || center;
        fetch = Map.getAttr('fw-fetch');

        Map.map = new ol.Map({
            layers: [getRasterLayer()],
            overlays: [overlay],
            target: domr[0],
            view: new ol.View({                
                center: ol.proj.fromLonLat(center),
                zoom: zoom,                
            })
        });

        Map.load(null, Map.getParams());

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

                var geomObjects = [];

                Map.layers = [];

                for (var item in xhr.list) {

                    var reg = xhr.list[item];                    

                    for (var prop in reg) {
                        if (reg[prop] && typeof reg[prop] == 'object' && reg[prop].hasOwnProperty('type')) {

                            if (!geomObjects[prop]) {
                                geomObjects[prop] = {
                                    type: reg[prop].type,
                                    items: [],
                                    style: null
                                }
                            }

                            switch (reg[prop].type) {
                                case 'Point':
                                    geomObjects[prop].items.push(makePoint(prop, reg, reg[prop]));
                                    break;
                                case 'Polygon':                                
                                    geomObjects[prop].items.push(makePolygon(prop, reg, reg[prop]));
                                    break;
                                case 'MultiPolygon':    
                                    geomObjects[prop].items.push(makeMultiPolygon(prop, reg, reg[prop]));
                                    break;
                                default:
                                    alert(reg[prop].type);
                                    break;
                            }
                        }
                    }
                }

                for (item in geomObjects) {

                    if (geomObjects[item].type == 'Point') {

                        var vectorSource = new ol.source.Vector({
                            features: geomObjects[item].items
                        });

                        var vectorLayer = new ol.layer.Vector({
                            renderOrder: 1,
                            source: vectorSource                
                        });                        
                        
                        Map.layers.push({
                            type: 'Point',
                            vector: vectorLayer
                        }); 

                    } else if (geomObjects[item].type == 'Polygon') {

                        var vectorSource = new ol.source.Vector({
                            features: geomObjects[item].items
                        });   

                        var vectorLayer = new ol.layer.Vector({
                            renderOrder: 2,
                            source: vectorSource,
                            style: getStyle(item)
                        });

                        Map.layers.push({
                            type: 'Polygon',
                            vector: vectorLayer
                        });
                    }

                    mouseOver();
                    onClick();
                } 

                for (var layer in Map.layers) {
                    if (Map.layers[layer].type == 'Point')
                        Map.layers[layer].vector.setZIndex(2);
                    else
                        Map.layers[layer].vector.setZIndex(1);

                    Map.addLayer(Map.layers[layer].vector);
                }
            }

            //Map.loadLayer('macro-regiao', 'http://api.funceme.br/v1/geoserver/adm/macro-regiao');     
        }

        FW.helpers.Rest.getList(Map.getController(), callbacks, $.extend({limit: 9999999}, filters));

        return Map;
    };

    function getStyle(field) {

        var meta = getMeta(field);

        var fill = null;

        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: (meta 
                    && meta.hasOwnProperty('style') 
                    && meta.style.hasOwnProperty('stroke') 
                    && meta.style.stroke.hasOwnProperty('color'))? meta.style.stroke.color : getColor(),
                width: (meta 
                    && meta.hasOwnProperty('style')
                    && meta.style.hasOwnProperty('stroke')
                    && meta.style.stroke.hasOwnProperty('width'))? meta.style.stroke.width : 1
            }),
            fill: new ol.style.Fill({
                color: (meta 
                    && meta.hasOwnProperty('style')
                    && meta.style.hasOwnProperty('fill')
                    && meta.style.fill.hasOwnProperty('color'))? meta.style.fill.color : 'rgba(0, 0, 255, 0.1)'
            })
        });
    }

    function getMeta(field) {
        return (Map.meta.hasOwnProperty('fields') && Map.meta.fields.hasOwnProperty(field))? Map.meta.fields[field] : {};
    }

    function onClick() {

        var onClickFunction = function(e) {                                 
            var clicado = false;                    
            Map.map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
                if (!clicado) {
                    var coordinate = e.coordinate;
                    var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
                        coordinate, 'EPSG:3857', 'EPSG:4326'));

                    var meta = (Map.meta.fields.hasOwnProperty(feature.get('field')))? Map.meta.fields[feature.get('field')] : null;

                    if (meta && meta.hasOwnProperty('on') && meta.on.hasOwnProperty('click') && typeof meta.on.click == 'function')
                        meta.on.click(feature.get('id'));
                    else if (feature.get('id')) 
                        FW.getModule(Map.getController()).actions.modalShow({id: feature.get('id')});                    
                }

                clicado = true;
            });
        };

        Map.map.removeEventListener("click", onClickFunction);
        Map.map.on("click", onClickFunction);
    }

    function mouseOver() {

        var displayFeatureInfo = function(pixel, coordinate) {

            var feature = Map.map.forEachFeatureAtPixel(pixel, function(feature) {
                return feature;
            });

            var info = document.getElementById('info');

            if (feature && feature.get('nome')) {
                content.innerHTML = '<strong style="text-transform: uppercase"><small>' + feature.get('label') + '</small></strong><hr style="margin: 10px 0px"> ' + feature.get('nome') + '(' + feature.get('id') + ')';
                overlay.setPosition(coordinate);                
            }
            else {                
                content.innerHTML = '&nbsp;';
                overlay.setPosition(undefined);
            }
        };

        Map.map.on('pointermove', function(evt) {
            if (evt.dragging) {
              return;
            }
            var pixel = Map.map.getEventPixel(evt.originalEvent);
            displayFeatureInfo(pixel, evt.coordinate);
        });        
    }

    function makePoint(field, reg, geojsonPoint) {

        var meta = getMeta(field);
        
        var lon = geojsonPoint.coordinates[0];
        var lat = geojsonPoint.coordinates[1];

        var point = new ol.geom.Point(ol.proj.fromLonLat([parseFloat(lon), parseFloat(lat)]));

        var regPoint = new ol.Feature({
            geometry: point,
            field: field,
            id: reg.id,            
            nome: reg.nome,
            label: (meta.hasOwnProperty('label'))? meta.label : ''
        });

        var color = null;

        if (meta && meta.hasOwnProperty('color')) {
            if (typeof meta.color == 'function')
                color = meta.color(reg);
            else if (typeof meta.color == 'string')
                color = meta.color;
        }

        if (meta && meta.hasOwnProperty('marker')) 
            marker = meta.marker;
        
        var pointStyle = {
            crossOrigin: 'anonymous',
            src: FW.getUrlBase() + '/img/' + marker + '.png'
        }

        if (color)
            pointStyle.color = color;

        regPoint.setStyle(new ol.style.Style({
            image: new ol.style.Icon((pointStyle))
        })); 

        return regPoint;
    }

    function makePolygon(field, reg, geojsonObject) {

        var meta = getMeta(field);

        var geoJson = new ol.format.GeoJSON();

        var polygon = geoJson.readFeature(geojsonObject, {
            defaultDataProjection: 'EPSG:4674',
            featureProjection:'EPSG:3857'
        });

        polygon.setProperties({
            field: field,
            id: reg.id,
            nome: reg.nome,
            label: (meta.hasOwnProperty('label'))? meta.label : ''           
        });

        return polygon;
    }

    function getColor(indice) {

        if (!indice)
            indice = parseInt(Math.random()*1000)%12;

        var cores = ["#3983f9","#5938f9","#ef07c4","#c4002a","#07993f","#175e07","#7c001a","#9607ef","#777705","#aa6401","#c6400f","#c60f0f"];
        
        return cores[indice];
    }

    function createStyle(color, width) {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: color,
                width: width
            })
        });
    }

    Map.loadLayer = function(name, url, style) {        

        if (!style)
            style = createStyle(getColor(), 1);

        var layer = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: url,
                format: new ol.format.KML({
                    extractStyles: false
                })
            }),
            style
        });
        layer.set('name', name);        
        
        return Map.addLayer(layer);
    };

    Map.addLayer = function(layer) {
        Map.layers.push(layer);
        Map.map.addLayer(layer);  
        return Map;
    };

    Map.removeLayer = function(name) {
        Map.map.getLayers().forEach(function (el) {
            if (el.get('name') === name) {
                Map.map.removeLayer(el);
            }
        });
        return Map;
    }

    Map.refresh = function() {
        return Map.clean().load(null, Map.getParams());
    };

    Map.clean = function() {
        for (var _layer in Map.layers) {
            Map.map.removeLayer(Map.layers[_layer]);
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
