// Add file path shim for Jupyter 3/4
var IGV_PATH = location.origin + Jupyter.contents.base_url + "nbextensions/igv/";
console.log(IGV_PATH)
define(
    ["./igvjs/igv.min.js"],
    function (igv) {

        /**
         * Load the IGV.js nbextension
         */
        function load_ipython_extension() {

        }

        function createBrowser(div, config) {
            console.log("igv=" + igv);

            // TODO -- send message that browser is ready
            return igv.createBrowser(div, config)
        }

        return {
            load_ipython_extension: load_ipython_extension,
            createBrowser: createBrowser
        };

    });
