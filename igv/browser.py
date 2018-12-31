from IPython.display import HTML, display
import json
import random
from .comm import IGVComm


class Browser:
    jsURL = "location.origin + Jupyter.contents.base_url + \"nbextensions/igv/extension.js\""
    igvjupyter = "var igvjupyter = require(" + jsURL + ")"

    # Always remember the *self* argument
    def __init__(self, config):
        id = self._gen_id()
        config["id"] = id
        self.igv_id = id
        self.config = config
        self.comm = IGVComm("igvcomm")
        self.status = "initializing"

        # Add a callback for received messages.
        @self.comm.comm.on_msg
        def _recv(msg):
            data = json.loads(msg['content']['data'])
            if data['status']:
                self.status = data['status']

    def show_browser(self):
        display(HTML("""<div id="%s" class="igv-js"></div>""" % (self.igv_id)))
        # DON'T check status before showing browser,
        msg = json.dumps({
            "id": self.igv_id,
            "command": "create",
            "options": self.config
        })
        self.comm.send(msg)

    def search(self, locus):
        return self._send({
            "id": self.igv_id,
            "command": "search",
            "locus": locus
        })

    def zoom_in(self):
        return self._send({
            "id": self.igv_id,
            "command": "zoomIn"
        })

    def zoom_out(self):
        return self._send({
            "id": self.igv_id,
            "command": "zoomOut"
        })

    def load_track(self, track):
        return self._send({
            "id": self.igv_id,
            "command": "loadTrack",
            "track": track
        })

    def remove(self):
        return self._send({
            "id": self.igv_id,
            "command": "remove"
        })

    def _send(self, msg):

        if self.status == "ready":
            self.comm.send(json.dumps(msg))
            return "OK"
        else:
            return "IGV Browser not ready"

    def _gen_id(self):
        return 'igv_' + str(random.randint(1, 10000000))
