// Entry point for the notebook bundle containing custom model definitions.
//
define(function () {
    "use strict";

    const base_path = document.querySelector('body').getAttribute('data-base-url') +
        'nbextensions/igv/';

    function load_css(url) {
        const link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    }
    // load_css(base_path + 'notebook.css');

    window['requirejs'].config({
        map: {
            '*': {
                '@igvteam/igv-jupyter': 'nbextensions/igv/index',
            },
        }
    });

    // Load the toolbox
    require(['@igvteam/igv-jupyter'], function(igv) {
        console.log('igv-jupyter loaded');
        window.igv = igv;
        console.log(igv);
    });

    // Export the required load_ipython_extension function
    return {
        load_ipython_extension: function () {
        }
    };
});
