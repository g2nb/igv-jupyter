from IPython.display import HTML, display
import json
import random
from .comm import IGVComm

class Browser:

    jsURL = "location.origin + Jupyter.contents.base_url + \"nbextensions/igv/extension.js\""
    igvjupyter = "var igvjupyter = require(" +  jsURL + ")"

    # Always remember the *self* argument
    def __init__(self, config):

        id = self._gen_id()
        config["id"] = id
        self.igv_id = id
        self.config = config
        self.comm = IGVComm("igvcomm")

    def show_browser(self):

        display(HTML("""<div id="%s" class="igv-js"></div>""" % (self.igv_id)))

        msg = json.dumps({
            "id": self.igv_id,
            "command": "create",
            "options": self.config
        })
        self.comm.send(msg)


    def search(self, locus):
        msg = json.dumps({
            "id": self.igv_id,
            "command": "search",
            "locus": locus
        })
        self.comm.send(msg)

    def zoom_in(self):
        msg = json.dumps({
            "id": self.igv_id,
            "command": "zoomIn"
        })
        self.comm.send(msg)

    def zoom_out(self):
        msg = json.dumps({
            "id": self.igv_id,
            "command": "zoomOut"
        })
        self.comm.send(msg)

    def load_track(self, track):
        msg = json.dumps({
            "id": self.igv_id,
            "command": "loadTrack",
            "track": track
        })
        self.comm.send(msg)

    def remove(self):
        msg = json.dumps({
            "id": self.igv_id,
            "command": "remove"
        })
        self.comm.send(msg)



    def dump_json(self):
        print(json.dumps(self.config))

    def _gen_id(self):
        return 'igv_' + str(random.randint(1, 10000000))

