define(
    ["nbextensions/igv/igvjs/igv"],
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
                        var browser = getBrowser(id)
                        switch (method) {

                            case "create":
                                var div = document.getElementById(id)
                                createBrowser(div, data.options, comm)
                                break

                            case "loadROI":
                                loadROI(id, data.roi);
                                break;

                            case "loadTrack":
                                loadTrack(id, data.track)
                                break

                            case "search":
                                search(id, data.locus)
                                break

                            case "zoomIn":
                                try {
                                    browser.zoomIn()
                                } catch (e) {
                                    alert(e.message)
                                    console.error(e)
                                } finally {
                                    comm.send('{"status": "ready"}')
                                }
                                break

                            case "zoomOut":
                                try {
                                    browser.zoomOut()
                                } catch (e) {
                                    alert(e.message)
                                    console.error(e)
                                } finally {
                                    comm.send('{"status": "ready"}')
                                }
                                break

                            case "remove":
                                try {
                                    delete igv.browserCache[id]
                                    var div = document.getElementById(id)
                                    div.parentNode.removeChild(div)
                                } catch (e) {
                                    alert(e.message)
                                    console.error(e)
                                } finally {
                                    comm.send('{"status": "ready"}')
                                }
                                break

                            case "toSVG":
                                try {
                                    var svg = browser.toSVG()
                                    var div = document.getElementById(data.div)
                                    if(div) {
                                        div.outerHTML += svg
                                    }
                                    comm.send(JSON.stringify({
                                        "svg": svg
                                    }))
                                } catch (e) {
                                    alert(e.message)
                                    console.error(e)
                                } finally {
                                    comm.send('{"status": "ready"}')
                                }
                                break;

                            case "on":
                                try {
                                    if ("locuschange" === data.eventName) {
                                        browser.on(data.eventName, function (referenceFrame) {
                                            comm.send(JSON.stringify({
                                                "event": data.eventName,
                                                "data": referenceFrame
                                            }))
                                        })
                                    } else {
                                        alert("Unsupported event: " + data.eventName)
                                    }
                                } catch (e) {
                                    alert(e.message)
                                    console.error(e)
                                } finally {
                                    comm.send('{"status": "ready"}')
                                }
                                break

                            default:
                                console.error("Unrecognized method: " + msg.method)
                        }

                        function getBrowser(id) {
                            return igv.browserCache[id]
                        }

                        // ASYNC functino wrappers

                        function createBrowser(div, config) {
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
                                .catch(function (error) {
                                    comm.send('{"status": "ready"}')
                                    alert(error.message);
                                    console.error(e)
                                })
                        }

                        function is_local(url) {
                            if (url.startsWith('data:')) return false;  // Special case for embedded data URLs
                            const regexp = /(ftp|http|https|gs):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
                            return !regexp.test(url);
                        }

                        function download_url(url) {
                            return `files/${url}`;
                        }

                        function prepare_urls(config) {
                            const to_check = ['url', 'indexURL', 'fastaURL', 'cytobandURL'];
                            for (const param of to_check) {
                                const url = config[param];
                                if (!url) return;  // If this param is not defined, skip
                                if (is_local(url)) {
                                    config[param] = download_url(url);
                                }
                            }
                        }

                        function loadROI(id, roi) {
                            const browser = getBrowser(id);
                            browser.loadROI([roi])
                                .then(function (track) {
                                    comm.send('{"status": "ready"}')
                                })
                                .catch(function (error) {
                                    comm.send('{"status": "ready"}');
                                    alert(error.message);
                                    console.error(e)
                                });
                        }

                        function loadTrack(id, config) {
                            var browser = getBrowser(id)
                            prepare_urls(config);
                            config.sync = true
                            browser.loadTrack(config)
                                .then(function (track) {
                                    comm.send('{"status": "ready"}')
                                })
                                .catch(function (error) {
                                    comm.send('{"status": "ready"}')
                                    alert(error.message);
                                    console.error(e)
                                })
                        }

                        function search(id, locus) {
                            var browser = getBrowser(id);
                            browser.search(locus)
                                .then(function (ignore) {
                                    comm.send('{"status": "ready"}')
                                })
                                .catch(function (error) {
                                    comm.send('{"status": "ready"}')
                                    alert(error.message)
                                    console.error(e)
                                })
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
