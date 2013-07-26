/**
 * Some core functionality for minnpost applications
 */

/**
 * Global variable to hold the "applications".
 */
var mpApps = mpApps || {};

/**
 * Extend underscore
 */
_.mixin({
  /**
   * Formats number 
   */
  formatNumber: function(num, decimals) {
    decimals = (_.isUndefined(decimals)) ? 2 : decimals;
    var rgx = (/(\d+)(\d{3})/);
    split = num.toFixed(decimals).toString().split('.');
    
    while (rgx.test(split[0])) {
      split[0] = split[0].replace(rgx, '$1' + ',' + '$2');
    }
    return (decimals) ? split[0] + '.' + split[1] : split[0];
  },
  
  /**
   * Formats number into currency
   */
  formatCurrency: function(num) {
    return '$' + _.formatNumber(num, 2);
  },
  
  /**
   * Formats percentage
   */
  formatPercent: function(num) {
    return _.formatNumber(num * 100, 1) + '%';
  },
  
  /**
   * Formats percent change
   */
  formatPercentChange: function(num) {
    return ((num > 0) ? '+' : '') + _.formatPercent(num);
  }
});
  
/**
 * Override Backbone's ajax function to use $.jsonp as it handles
 * errors for JSONP requests
 */
if (typeof Backbone != 'undefined' && !_.isUndefined($.jsonp) && _.isFunction(Backbone.$.jsonp)) {
  Backbone.ajax = function() {
    return Backbone.$.jsonp.apply(Backbone.$, arguments);
  };
}

/**
 * Create "class" for the main application.  This way it could be
 * used more than once.
 */
(function($, undefined) {
  var App;
  
  mpApps['minnpost-usi-fiber'] = App = (function() {
    function App(options) {
      this.options = _.extend(this.defaultOptions, options);
      this.$el = $(this.options.el);
    }
    
    // Default options
    App.prototype.defaultOptions = {
      dataPath: './data/',
      jsonpProxy: 'http://mp-jsonproxy.herokuapp.com/proxy?callback=?&url='
    };
  
    /**
     * Template handling.  For development, we want to use
     * the template files directly, but for build, they should be
     * compiled into JS.
     *
     * See JST grunt plugin to understand how templates
     * are compiled.
     *
     * Expects callback like: function(compiledTemplate) {  }
     */
    App.prototype.templates = {};
    App.prototype.getTemplate = function(name, callback, context) {
      var thisApp = this;
      var templatePath = 'js/templates/' + name + '.html';
      context = context || app;
      
      if (!_.isUndefined(this.templates[templatePath])) {
        callback.apply(context, [ this.templates[templatePath] ]);
      }
      else {
        $.ajax({
          url: templatePath,
          method: 'GET',
          async: false,
          contentType: 'text',
          success: function(data) {
            thisApp.templates[templatePath] = _.template(data);
            callback.apply(context, [ thisApp.templates[templatePath] ]);
          }
        });
      }
    };
    // Wrapper around getting a template
    App.prototype.template = function(name) {
      var templatePath = 'js/templates/' + name + '.html';
      return this.templates[templatePath];
    };
  
    /**
     * Data source handling.  For development, we can call
     * the data directly from the JSON file, but for production
     * we want to proxy for JSONP.
     *
     * `name` should be relative path to dataset minus the .json
     *
     * Returns jQuery's defferred object.
     */
    App.prototype.data = {};
    App.prototype.getLocalData = function(name) {
      var thisApp = this;
      var proxyPrefix = this.options.jsonpProxy;
      var useJSONP = false;
      var defers = [];
      
      name = (_.isArray(name)) ? name : [ name ];
      
      // If the data path is not relative, then use JSONP
      if (this.options && this.options.dataPath.indexOf('http') === 0) {
        useJSONP = true;
      }
      
      // Go through each file and add to defers
      _.each(name, function(d) {
        var defer;
        if (_.isUndefined(thisApp.data[d])) {
          
          if (useJSONP) {
            defer = $.jsonp({
              url: proxyPrefix + encodeURI(thisApp.options.dataPath + d + '.json')
            });
          }
          else {
            defer = $.getJSON(thisApp.options.dataPath + d + '.json');
          }
          
          $.when(defer).done(function(data) {
            thisApp.data[d] = data;
          });
          defers.push(defer);
        }
      });
      
      return $.when.apply($, defers);
    };
    
    /**
     * Get remote data.  Provides a wrapper around
     * getting a remote data source, to use a proxy
     * if needed, such as using a cache.
     */
    App.prototype.getRemoteData = function(options) {
      if (this.options.remoteProxy) {
        options.url = options.url + '&callback=proxied_jqjsp';
        options.url = app.options.remoteProxy + encodeURIComponent(options.url);
        options.callback = 'proxied_jqjsp';
        options.cache = true;
      }
      else {
        options.url = options.url + '&callback=?';
      }
      
      return $.jsonp(options);
    };
    
    // Placeholder start
    App.prototype.start = function() {
    };
    
    return App;
  })();
})(jQuery);



this["mpApp"] = this["mpApp"] || {};
this["mpApp"]["minnpost-usi-fiber"] = this["mpApp"]["minnpost-usi-fiber"] || {};
this["mpApp"]["minnpost-usi-fiber"]["templates"] = this["mpApp"]["minnpost-usi-fiber"]["templates"] || {};

this["mpApp"]["minnpost-usi-fiber"]["templates"]["js/templates/template-application.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div id="fiber-map">\n</div>\n\n<div class="footnote-container">\n</div>';

}
return __p
};

this["mpApp"]["minnpost-usi-fiber"]["templates"]["js/templates/template-footnote.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="footnote">\n  <p>Code, techniques, and data on <a href="https://github.com/MinnPost/minnpost-usi-fiber" target="_blank">Github</a>.</p>\n</div>';

}
return __p
};

this["mpApp"]["minnpost-usi-fiber"]["templates"]["js/templates/template-loading.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="loading-container">\n  <div class="loading"><span>Loading...</span></div>\n</div>';

}
return __p
};

this["mpApp"]["minnpost-usi-fiber"]["templates"]["js/templates/template-map-label.html"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="map-label-inner-container">\n  <h4>' +
((__t = ( street )) == null ? '' : __t) +
' <br /> ' +
((__t = ( numbers )) == null ? '' : __t) +
'</h4>\n  Status: ' +
((__t = ( status )) == null ? '' : __t) +
'\n  \n  ';
 if (status == 'live') { ;
__p += '\n    <br />At capacity: ' +
((__t = ( (capacity) ? 'Yes' : 'No' )) == null ? '' : __t) +
'\n  ';
 } ;
__p += '\n</div>';

}
return __p
};

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