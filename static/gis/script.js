
var map = new ol.Map({
    // view: new ol.View({
    //     center: [-15000, 6700000],
    //     zoom: 5
    // }),
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    // controls:ol.control.defaults().extend([ new ol.control.FullScreen()]),
    // target: 'js-map'
});


var mousePositionControl = new ol.control.MousePosition({
    coordinateFormat:ol.coordinate.createStringXY(6),
    projection:'EPSG:4326'
});

map.addControl(mousePositionControl);
map.setTarget('js-map');

var view = new ol.View({
    zoom:4,
    projection:'EPSG:3857',
    maxZoom:6,
    minZoom:3,
    rotation:0.34 // 20 degrees
});

view.setCenter([-10800000,4510000]);

map.setView(view);