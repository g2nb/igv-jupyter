import igv from './igv';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

let current_panel = null;
if (!igv.browserCache) {
    igv.browserCache = {}
}

function registerComm(current) {
    const kernel = current.context.sessionContext.session.kernel;
    kernel.registerCommTarget('igvcomm', (comm) => {
            // comm is the frontend comm instance
            // msg is the comm_open message, which can carry data

            // Register handlers for later messages:
            comm.onMsg = (msg) => {
                var data = JSON.parse(msg.content.data);
                var method = data.command;
                var id = data.id;
                var browser = getBrowser(id);
                switch (method) {

                    case "create":
                        var div = document.getElementById(id);
                        createBrowser(div, data.options, comm);
                        break;

                    case "loadTrack":
                        loadTrack(id, data.track);
                        break;

                    case "search":
                        search(id, data.locus);
                        break;

                    case "zoomIn":
                        try {
                            browser.zoomIn()
                        } catch (e) {
                            alert(e.message);
                            console.error(e)
                        } finally {
                            comm.send('{"status": "ready"}')
                        }
                        break;

                    case "zoomOut":
                        try {
                            browser.zoomOut()
                        } catch (e) {
                            alert(e.message);
                            console.error(e)
                        } finally {
                            comm.send('{"status": "ready"}')
                        }
                        break;

                    case "remove":
                        try {
                            delete igv.browserCache[id];
                            var div = document.getElementById(id);
                            div.parentNode.removeChild(div)
                        } catch (e) {
                            alert(e.message);
                            console.error(e)
                        } finally {
                            comm.send('{"status": "ready"}')
                        }
                        break;

                    case "toSVG":
                        try {
                            var svg = browser.toSVG();
                            var div = document.getElementById(data.div);
                            if (div) {
                                div.outerHTML += svg
                            }
                            comm.send(JSON.stringify({
                                "svg": svg
                            }))
                        } catch (e) {
                            alert(e.message);
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
                            alert(e.message);
                            console.error(e)
                        } finally {
                            comm.send('{"status": "ready"}')
                        }
                        break;

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
                            comm.send('{"status": "ready"}');
                            alert(error.message);
                            console.error(e)
                        })
                }

                function loadTrack(id, config) {
                    var browser = getBrowser(id);
                    config.sync = true;
                    browser.loadTrack(config)
                        .then(function (track) {
                            comm.send('{"status": "ready"}')
                        })
                        .catch(function (error) {
                            comm.send('{"status": "ready"}');
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
                            comm.send('{"status": "ready"}');
                            alert(error.message);
                            console.error(e)
                        })
                }
            };

            comm.onClose = (msg) => {};
        });
}

function initComms(notebook_tracker) {
    notebook_tracker.activeCellChanged.connect(() => {
        const current_widget = notebook_tracker.currentWidget;

        // Current notebook hasn't changed, no need to do anything, return
        if (current_panel === current_widget) return;

        // Otherwise, update the current notebook reference
        current_panel = current_widget;

        // If the current selected widget isn't a notebook, no comm is needed
        if (!(current_panel instanceof NotebookPanel)) return;

        // Initialize the comm
        current_panel.context.sessionContext.ready.then(() => {
            registerComm(current_panel);
        });
    });
}

const igv_plugin = [
    {
        id: '@igvteam/igv-jupyter',
        autoStart: true,
        optional: [INotebookTracker],
        activate: function (app, notebook_tracker) {
            console.log('JupyterLab extension @igvteam/igv-jupyter is activated!');
            console.log(app.commands);
            initComms(notebook_tracker);
        }
    }
];

export default igv_plugin;
