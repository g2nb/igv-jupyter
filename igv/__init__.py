from .browser import Browser

def _jupyter_server_extension_paths():
    return [{
        "module": "igv"
    }]


def _jupyter_nbextension_paths():
    return [dict(
        section="notebook",
        # the path is relative to the `igv` directory
        src="static",
        # directory in the `nbextension/` namespace
        dest="igv",
        # also_ in the `nbextension/` namespace
        require="igv/extension")]


def load_jupyter_server_extension(nbapp):
    nbapp.log.info("igv enabled!")
