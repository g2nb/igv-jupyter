def _jupyter_nbextension_paths():
    return [dict(
        section="notebook",
        # the path is relative to the `igv` directory
        src="nbextension/static",
        # directory in the `nbextension/` namespace
        dest="igv",
        # also_ in the `nbextension/` namespace
        require="igv/extension")]
