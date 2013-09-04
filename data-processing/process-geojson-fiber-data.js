/**
 * Processes original data (as GeoJSON) to create
 * a better one.
 */
var fs = require('fs');
var path = require('path');
var source = require('../data/original-usi-fiber.geo.json');
var outputFile = path.join(__dirname, '../data/usi-fiber.geo.json');
var output = {};

// Alter
output.type = source.type;
output.crs = source.crs;
output.features = source.features.map(function(f) {
  var name = f.properties.Name;
  var desc = f.properties.Description;

  // Remove elevation data
  f.geometry.coordinates[0] = f.geometry.coordinates[0].map(function(c) {
    if (c.length === 3) {
      c.pop();
    }
    return c;
  });

  // Remove some columns
  delete f.properties.Name;
  delete f.properties.Description;

  // Add some better columns
  f.properties.description = desc;

  // Split name
  f.properties.name = name.split(' - ')[1];
  f.properties.phase = parseInt(name.split(' - ')[0].split(' ')[1], 10);

  // Add status fields
  f.properties.status = 'live';
  f.properties.capacity = false;

  // Full capacity
  if ([3, 4].indexOf(f.properties.phase) >= 0) {
    f.properties.capacity = true;
  }

  // Under construnction
  if (f.properties.phase >= 26) {
    f.properties.status = 'pending';
  }
  if ([5, 6, 17, 18].indexOf(f.properties.phase) >= 0) {
    f.properties.status = 'pending';
  }

  return f;
});

// Write new file
fs.writeFile(outputFile, JSON.stringify(output), function(err) {
  if (err) {
    throw new Error(err);
  }
  else {
    console.log('File saved to: ' + outputFile);
  }
}); 