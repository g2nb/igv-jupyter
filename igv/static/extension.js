// Add file path shim for Jupyter 3/4
var IGV_PATH = location.origin + Jupyter.contents.base_url + "nbextensions/igv/";
console.log(IGV_PATH)
define(
    [IGV_PATH + "igvjs/igv.min.js"],
    function (igv) {

        var browserCache = {}

        /**
         * Load the IGV.js nbextension
         */
        function load_ipython_extension() {

        }

        function createBrowser(div, config) {
            console.log("igv=" + igv);
console.log("window.igv= " + window.igv)
            // TODO -- send message that browser is ready
            igv.createBrowser(div, config)
                .then(function (browser) {
                    browserCache[config.id] = browser;
                })
        }

        function getBrowser(id) {
            return browserCache[id]
        }

        return {
            load_ipython_extension: load_ipython_extension,
            createBrowser: createBrowser,
            getBrowser: getBrowser
        };

    });
