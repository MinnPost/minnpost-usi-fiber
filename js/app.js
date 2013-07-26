/**
 * Main app logic for: minnpost-usi-fiber
 */
(function(app, $, undefined) {

  // Green: 6DAC15, Yellow: ACA015  Brown/red: AC5415
  app.prototype.defaultMapStyle = {
    'color': '#AC5415',
    'weight': 3,
    'opacity': 0.65
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
      
      // Get data
      this.getLocalData('usi-fiber.geo').done(function() {
        thisApp.fiberJSON = arguments[0];
        thisApp.makeMap();
      });
      
    }, this);
  };
  
  // Make Map
  app.prototype.makeMap = function() {
    var thisApp = this;
    var baseLayer = new L.tileLayer('http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png');

    // Create map
    this.map = new L.map('fiber-map');
    this.map.setView([44.9800, -93.2636], 12);
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
          style.color = '#6DAC15';
          
          if (feature.properties.capacity === 1) {
            style.color = '#ACA015';
          }
        }
        
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
            options.opacity = 0.9;
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
    
    // Zoom to extents
    //this.map.fitBounds(this.fiberJSONLayer.getBounds());
  };
  
})(mpApps['minnpost-usi-fiber'], jQuery);