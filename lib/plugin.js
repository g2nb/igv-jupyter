import igv from './igv';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

let current_panel = null;
let notebook_tracker = null;
let prepare_urls = null;
if (!igv.browserCache) {
    igv.browserCache = {}
}

function handle_message(msg, comm) {
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
        return igv.browserCache[id];
    }

    async function createBrowser(div, config) {
        await prepare_urls(config);
        igv.createBrowser(div, config)
            .then(function (browser) {
                igv.browserCache[config.id] = browser;
                if (comm) {
                    comm.send('{"status": "ready"}')
                }
            })
            .catch(function (error) {
                comm.send('{"status": "ready"}');
                alert(error.message);
                console.error(error);
            })
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
                console.error(error);
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
                console.error(error);
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
                console.error(error);
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
}

async function prepare_urls_nb(config) {
    const to_check = ['url', 'indexURL', 'fastaURL', 'cytobandURL'];
    const base_path = document.querySelector('body').getAttribute('data-base-url');
    const nb_path = document.querySelector('body').getAttribute('data-notebook-path');
    const nb_name = document.querySelector('body').getAttribute('data-notebook-name');
    const nb_dir = nb_path.slice(0, -1 * nb_name.length);

    function is_local(url) {
        if (url.startsWith('data:')) return false;  // Special case for embedded data URLs
        const regexp = /(ftp|http|https|gs):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return !regexp.test(url);
    }

    for (const key of Object.keys(config)) {
        if (typeof config[key] === 'object' && config[key] !== null)
            await prepare_urls(config[key]);
        else if (to_check.includes(key)) {
            const url = config[key];
            if (!url) return;  // If this param is not defined, skip
            if (is_local(url)) {
                config[key] = `${location.origin}${base_path}files/${nb_dir}${url}`;
            }
        }
    }
}

async function prepare_urls_lab(config) {
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

export function init_comm_nb() {
    prepare_urls = prepare_urls_nb;
    Jupyter.notebook.kernel.comm_manager.register_target('igvcomm', (comm) => {
        comm.on_msg((msg) => handle_message(msg, comm));
        comm.on_close((msg) => {});
    });
}

function init_comm_lab(notebook_tracker) {
    prepare_urls = prepare_urls_lab;
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
            const kernel = current_panel.context.sessionContext.session.kernel;
            kernel.registerCommTarget('igvcomm', (comm) => {
                comm.onMsg = (msg) => handle_message(msg, comm);
                comm.onClose = (msg) => {};
            });
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
            init_comm_lab(notebook_tracker);
        }
    }
];

export default igv_plugin;
