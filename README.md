# USI Fiber

Where USI has installed and will install fiber optic Internet connections.

## Data

Source data comes from the [data feed](https://my.usinternet.com/fiber/order/kml/Phases1to43v20130812.kml) found at [my.usinternet.com/fiber/](https://my.usinternet.com/fiber/).  Some processing has been done to supplement the data.

## Data Processing

1. Get the original data: `wget -O data/original-usi-fiber.kml https://my.usinternet.com/fiber/order/kml/Phases1to43v20130812.kml`
1. Convert to GeoJSON: `ogr2ogr -f GeoJSON -t_srs EPSG:4326 data/original-usi-fiber.geo.json data/original-usi-fiber.kml`
1. Process the GeoJSON file: `node data-processing/process-geojson-fiber-data/js`

## Prerequisites

1. Install [Git](http://git-scm.com/).
1. Install [NodeJS](http://nodejs.org/).
1. Optionally, for development, install [Grunt](http://gruntjs.com/): `npm install -g grunt-cli`
1. Install [Bower](http://bower.io/): `npm install -g bower` 
1. Install [Ruby](http://www.ruby-lang.org/en/downloads/), though it is probably already installed on your system.
1. Install [Sass](http://sass-lang.com/): `gem install sass`
1. Because Leaflet comes unbuilt, we need to build it with Jake: `npm install -g jake`

## Install

1. Check out this code with [Git](http://git-scm.com/): `git clone https://github.com/MinnPost/minnpost-usi-fiber.git`
1. Go into the template directory: `cd minnpost-usi-fiber`
1. Install NodeJS packages: `npm install`
1. Install Bower components: `bower install`
1. Because Leaflet comes unbuilt, we need to build it: `cd bower_components/leaflet/ && npm install && jake; cd -;`

## Development and Run Locally

* Run: `grunt server`
   * This will run a local webserver for development and you can view the application in your web browser at [http://localhost:8899](http://localhost:8899).
    * Utilize `index.html` for development, while `index-deploy.html` is used for the deployed version, and `index-build.html` is used to test the build before deployment.
    * The server runs `grunt watch` which will watch for linting JS files and compiling SASS.  If you have your own webserver, feel free to use that with just this command.

## Build

1. Run: `grunt`

## Deploy

1. Run: `grunt mp-deploy`


