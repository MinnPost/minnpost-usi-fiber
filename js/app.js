/**
 * Main app logic for: minnpost-usi-fiber
 */
(function(app, $, undefined) {
  // Start function that starts the application.  This is not
  // necessary, but just a helpful way to do this.  The main
  // application HTML file calls this by default.
  app.prototype.start = function() {
    // Add in footnote HTML
    this.getTemplate('template-footnote', function(compiledTemplate) {
      $(this.options.el).append(compiledTemplate({ }));
    }, this);
  };
  
})(mpApps['minnpost-usi-fiber'], jQuery);