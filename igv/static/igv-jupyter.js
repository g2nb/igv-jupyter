// Add file path shim for Jupyter 3/4
var IGV_PATH = location.origin + Jupyter.contents.base_url + "nbextensions/igv/";

define([
    "base/js/namespace",
    "jquery",
    IGV_PATH + "igvjs/igv-1.0.4.min.js"], function(Jupyter) {

    /**
     * Determines if the CSS file has been added to the head yet
     * @returns {boolean}
     */
    function is_css_loaded() {
        return $("link[href='" + IGV_PATH + "igvjs/igv-1.0.4.css']").length > 0;
    }

    function load_css() {
        $("head").append('<link rel="stylesheet" type="text/css" href="' + IGV_PATH + 'igvjs/igv-1.0.4.css">');
    }

    /**
     * Load the IGV.js nbextension
     */
    function load_ipython_extension() {
        // Attach the CSS file, if necessary
        if (!is_css_loaded()) load_css();
    }

    return {
        load_ipython_extension: load_ipython_extension
    };

});

