define(
    ["/nbextensions/igv/igvjs/igv.js"],
    //["https://cdn.jsdelivr.net/npm/igv@2.1.0/dist/igv.min.js"],
    function (igv) {

        if (!igv.browserCache) {
            igv.browserCache = {}
        }

        /**
         * Load the IGV.js nbextension
         */
        function load_ipython_extension() {
            registerComm()
        }

        function registerComm() {

            Jupyter.notebook.kernel.comm_manager.register_target('igvcomm',

                function (comm, msg) {
                    // comm is the frontend comm instance
                    // msg is the comm_open message, which can carry data

                    // Register handlers for later messages:
                    comm.on_msg(function (msg) {
                        var data = JSON.parse(msg.content.data)
                        var method = data.command
                        var id = data.id
                        switch (method) {

                            case "create":
                                var div = document.getElementById(id)
                                createBrowser(div, data.options, comm)
                                break

                            case "zoomIn":
                                getBrowser(id).zoomIn()
                                break

                            case "zoomOut":
                                getBrowser(id).zoomOut()
                                break

                            case "loadTrack":
                                getBrowser(id).loadTrack(data.track)
                                break

                            case "search":
                                getBrowser(id).search(data.locus)
                                break

                            case "remove":
                                delete igv.browserCache[id]
                                var div = document.getElementById(id)
                                div.parentNode.removeChild(div)
                                break

                            case "toSVG":
                                var svg = getBrowser(id).toSVG()
                                comm.send(JSON.stringify({
                                    "svg": svg
                                }))
                                break;

                            case "on":
                                if ("locuschange" === data.eventName) {
                                    getBrowser(id).on(data.eventName, function (referenceFrame) {
                                        comm.send(JSON.stringify({
                                            "event": data.eventName,
                                            "data": referenceFrame
                                        }))
                                    })
                                }
                                else {
                                    console.log("Unsupported event: " + data.eventName)
                                }
                                break

                            default:
                                console.error("Unrecognized method: " + msg.method)
                        }

                        function createBrowser(div, config, comm) {
                            // TODO -- send message that browser is ready
                            igv.createBrowser(div, config)
                                .then(function (browser) {
                                    igv.browserCache[config.id] = browser;
                                    if (comm) {
                                        comm.send('{"status": "ready"}')
                                    }

                                    // Uncomment to send locus change events to server object (browser).  This generates a lot of traffic.
                                    //browser.on('locuschange', function (referenceFrame) {
                                    //    comm.send(JSON.stringify({"locus": referenceFrame}))
                                    //});
                                })
                        }

                        function getBrowser(id) {
                            return igv.browserCache[id]
                        }

                    });
                    comm.on_close(function (msg) {
                    });
                });
        }

        return {
            load_ipython_extension: load_ipython_extension,
        };

    });
