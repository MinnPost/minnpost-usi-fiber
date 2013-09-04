/**
 * Main app logic for: minnpost-usi-fiber
 */
(function(app, $, undefined) {

  // Colors
  app.prototype.colors = {
    live: '#6DAC15',
    capacity: '#ACA015',
    pending: '#AC5415'
  };

  // Default map style
  app.prototype.defaultMapStyle = {
    'color': app.prototype.colors.pending,
    'weight': 1,
    'opacity': 0.85,
    'fillOpacity': 0.5
  };

  // Get templates.  The get template method should be updated
  // to handle multiple templates.
  app.prototype.startTemplates = function(done, context) {
    this.getTemplate('template-application', function(compiledTemplate) {
      this.getTemplate('template-footnote', function(compiledTemplate) {
        this.getTemplate('template-loading', function(compiledTemplate) {
          this.getTemplate('template-map-label', function(compiledTemplate) {
            done.apply(context, []);
          }, this);
        }, this);
      }, this);
    }, this);
  };

  // Start function that starts the application.
  app.prototype.start = function() {
    var thisApp = this;

    this.startTemplates(function() {
      this.$el.html(this.template('template-application')({ }));
      this.$el.find('.footnote-container').html(this.template('template-footnote')({ }));

      // Mark as loading
      this.$el.find('.message-container').html(this.template('template-loading')({ })).slideDown();

      // Get data
      this.getLocalData('usi-fiber.geo').done(function() {
        thisApp.fiberJSON = arguments[0];
        thisApp.makeMap();

        thisApp.$el.find('.message-container').slideUp(function() {
          $(this).html('');
        });
      });

    }, this);
  };

  // Make Map
  app.prototype.makeMap = function() {
    var thisApp = this;
    var baseLayer = new L.tileLayer('//{s}.tiles.mapbox.com/v3/minnpost.map-wi88b700/{z}/{x}/{y}.png');

    // Create map
    this.map = new L.map('fiber-map', {
      zoom: 10,
      center: [44.9800, -93.2636],
      minZoom: 10,
      maxZoom: 18,
      scrollWheelZoom: false
    });
    this.map.attributionControl.setPrefix(false);
    this.map.addLayer(baseLayer);

    // Create a label container
    this.LabelControl = this.LabelControl || L.Control.extend({
      options: {
        position: 'topright'
      },

      onAdd: function (map) {
        var container = L.DomUtil.create('div', 'map-label-container');
        return container;
      }
    });
    this.map.addControl(new this.LabelControl());
    this.$el.find('.map-label-container').hide();

    // Create geojson layer, handle styles and interaction
    this.fiberJSONLayer = L.geoJson(this.fiberJSON, {
      style: function(feature) {
        // feature.properties.party
        var style = _.clone(thisApp.defaultMapStyle);

        // If live, then green, but if capacity full, yellow
        if (feature.properties.status === 'live') {
          style.color = thisApp.colors.live;

          if (feature.properties.capacity === true) {
            style.color = thisApp.colors.capacity;
          }
        }

        // Determine thickness from zoom
        style.weight = 0.05 * (thisApp.map.getZoom());

        return style;
      },
      onEachFeature: function(feature, layer) {
        layer.on({
          mouseover: function(e) {
            var layer = e.target;
            var options = _.clone(layer.options);

            // Label
            thisApp.$el.find('.map-label-container').html(
              thisApp.template('template-map-label')(layer.feature.properties)
            ).show();

            // Set style
            options.opacity = 0.95;
            options.fillOpacity = 0.85;
            layer.setStyle(options);
            layer.bringToFront();
          },
          mouseout: function(e) {
            thisApp.$el.find('.map-label-container').hide();
            thisApp.fiberJSONLayer.resetStyle(e.target);
          },
          click: function(e) {
            thisApp.map.fitBounds(e.target.getBounds());
          }
        });
      }
    });
    this.map.addLayer(this.fiberJSONLayer);

    // Handle zooming
    this.map.on('zoomend', function(e) {
      _.each(thisApp.fiberJSONLayer._layers, function(l) {
        thisApp.fiberJSONLayer.resetStyle(l);
      });
    });

    // Zoom to extents
    this.map.fitBounds(this.fiberJSONLayer.getBounds());

    // Color in legend
    this.$el.find('.live .swatch').css('background-color', this.colors.live);
    this.$el.find('.live-no-capcity .swatch').css('background-color', this.colors.capacity);
    this.$el.find('.pending .swatch').css('background-color', this.colors.pending);

    // Siumple reset map view
    this.$el.find('.reset-map-view').text('Reset map view')
      .on('click', this.$el, function(e) {
        e.preventDefault();
        thisApp.map.fitBounds(thisApp.fiberJSONLayer.getBounds());
      });
  };

})(mpApps['minnpost-usi-fiber'], jQuery);