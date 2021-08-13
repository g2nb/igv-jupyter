import igv from './igv';
import Menu from './menu';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

let current_panel = null;
let notebook_tracker = null;
if (!igv.browserCache) {
    igv.browserCache = {}
}

export function registerComm(current) {
    const kernel = current.context.sessionContext.session.kernel;
    kernel.registerCommTarget('igvcomm', (comm) => {
            // comm is the frontend comm instance
            // msg is the comm_open message, which can carry data

            // Register handlers for later messages:
            comm.onMsg = (msg) => {
                const data = JSON.parse(msg.content.data);
                const method = data.command;
                const id = data.id;
                const browser = getBrowser(id);
                const div = document.getElementById(id);

                if      (method === "create")       createBrowser(div, data.options);
                else if (method === "loadTrack")    loadTrack(id, data.track);
                else if (method === "loadROI")      loadROI(id, data.roi);
                else if (method === "search")       search(id, data.locus);
                else if (method === "zoomIn")       zoom_in();
                else if (method === "zoomOut")      zoom_out();
                else if (method === "remove")       remove(div);
                else if (method === "toSVG")        to_svg(div);
                else if (method === "on")           on(data);
                else                                console.error("Unrecognized method: " + msg.method);

                function getBrowser(id) {
                    return igv.browserCache[id]
                }

                async function createBrowser(div, config) {
                    await prepare_urls(config);
                    Menu.init();
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
                            console.error(error);
                        })
                }

                async function prepare_urls(config) {
                    const resolver = notebook_tracker.currentWidget.context.urlResolver;
                    const to_check = ['url', 'indexURL', 'fastaURL', 'cytobandURL'];

                    for (const key of Object.keys(config)) {
                        if (typeof config[key] === 'object' && config[key] !== null)
                            await prepare_urls(config[key]);
                        else if (to_check.includes(key)) {
                            const url = config[key];
                            if (!url) return;  // If this param is not defined, skip
                            if (resolver && resolver.isLocal(url)) {
                                const abs_path = await resolver.resolveUrl(url);
                                config[key] = await resolver.getDownloadUrl(abs_path);
                            }
                        }
                    }
                }

                async function loadROI(id, roi) {
                    const browser = getBrowser(id);
                    await prepare_urls(roi);
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

                async function loadTrack(id, config) {
                    const browser = getBrowser(id);
                    await prepare_urls(config);
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

                async function search(id, locus) {
                    const browser = getBrowser(id);
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

                async function zoom_in() {
                    try {           browser.zoomIn(); }
                    catch (e) {     console.error(e); }
                    finally {       comm.send('{"status": "ready"}'); }
                }

                async function zoom_out() {
                    try {           browser.zoomOut(); }
                    catch (e) {     console.error(e); }
                    finally {       comm.send('{"status": "ready"}'); }
                }

                async function remove(div) {
                    try {
                        delete igv.browserCache[id];
                        div.parentNode.removeChild(div);
                    } catch (e) {
                        alert(e.message);
                        console.error(e);
                    } finally {
                        comm.send('{"status": "ready"}');
                    }
                }

                async function to_svg(div) {
                    try {
                        const svg = browser.toSVG();
                        if (div) div.outerHTML += svg;
                        comm.send(JSON.stringify({
                            "svg": svg
                        }));
                    } catch (e) {
                        alert(e.message);
                        console.error(e);
                    } finally {
                        comm.send('{"status": "ready"}')
                    }
                }

                async function on(data) {
                    try {
                        if ("locuschange" === data.eventName) {
                            browser.on(data.eventName, function (referenceFrame) {
                                comm.send(JSON.stringify({
                                    "event": data.eventName,
                                    "data": referenceFrame
                                }));
                            })
                        } else {
                            alert("Unsupported event: " + data.eventName);
                        }
                    } catch (e) {
                        alert(e.message);
                        console.error(e);
                    } finally {
                        comm.send('{"status": "ready"}');
                    }
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
        activate: function (app, tracker) {
            console.log('JupyterLab extension @igvteam/igv-jupyter is activated!');
            notebook_tracker = tracker;
            initComms(notebook_tracker);
        }
    }
];

export default igv_plugin;
