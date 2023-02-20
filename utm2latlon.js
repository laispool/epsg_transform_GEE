///////////////////////////////////////////////////////////
///// Laís Pool  (lais.pool@gmail.com)                /////                       
///// Florianopolis, 17/02/2023                       /////             
///// Code Editor - Earth Engine                      /////                           
///// Laís Pool  (lais.pool@gmail.com)                /////                            
///// A code to transform the EPSG of bathymetry data /////
///////////////////////////////////////////////////////////

// Creating the geometry

var geometry = ee.Geometry.Polygon(
  [[[-48.62663139683636,-26.181471289601653],
    [-48.59491903013435,-26.22224989855073],
    [-48.571855490714995,-26.215708024099186],
    [-48.60288951802147,-26.175992478152494],
    [-48.62663139683636,-26.181471289601653]]]);
Map.addLayer(geometry, {color: 'black'},'Gometry');
Map.centerObject(geometry, 12);

// Importing the data to convert
// first you need to import to your asset page the file (use mine as an example)
var bathymetry = ee.FeatureCollection('projects/ee-laispool/assets/bathymetry_1K_20052018_UTM'); // change the path to your own
print(bathymetry);

// Create a FeatureCollection containing each points' position and depth
function createPoints(bathymetry) {
return ee.Feature(ee.Geometry.Point([bathymetry.get('X'),bathymetry.get('Y')], 'EPSG:32722'), // change this EPSG to your data's EPSG
{'depth': bathymetry.get('Z')});
}
var points = bathymetry.map(createPoints);
print("points", points.getInfo());
Map.addLayer(points, {}, "data training");

// Creating and applying the funciton to tranform the EPSG
var utm2latlon = points.map(function(feature) {
return feature.transform('EPSG: 4326'); // choose the EPSG to transform into
});
print('Lat Long', utm2latlon);

// Organizing the table to export
var feature2table = utm2latlon.map(function(feature) {
var geom = feature.geometry().coordinates();
//geom.copyProperties(elevationSamples);
return ee.Feature(null, {
 'X': ee.Number(geom.get(0)),
 'Y': ee.Number(geom.get(1)),
 'Z': ee.Number(feature.get('depth')).multiply(+1), // change the +1 to -1 in case you want negative depths
});
});
print('Coordinates added as colums', feature2table.getInfo());
var list = feature2table.toList(feature2table.size());
//print('First of the list', list.get(0));

// Export to Drive as CSV
Export.table.toDrive({
collection: feature2table,
description: 'batimetria_1K_ESPG4326_20052018', // change the name if you want to
fileFormat: 'CSV'
});

