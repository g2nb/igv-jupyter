from IPython.display import HTML, SVG, display
from ipykernel.comm import Comm
import json
import random
import time


class _IGVComm:
    """Wrapper class the for comm - the channel of communication between Jupyter's client-side and kernel-side"""

    def __init__(self, id):
        # Use comm to send a message from the kernel
        self.comm = Comm(target_name=id, data={})

    def send(self, message):
        self.comm.send(message)


class Browser(object):
    """Object representing the igv.js browser"""

    def __init__(self, config):
        """Initialize the igv browser object.

        :param: config - A dictionary specifying the browser configuration.  This will be converted to JSON and passed
                to igv.js  "igv.createBrowser(config)" as described in the igv.js documentation. See
                https://github.com/igvteam/igv.js/wiki/Browser-Configuration-2.0 for configuration options.
        :type dict
        """

        # Check for minimal igv.js requirements (the only required field for all tracks is url, which must be a string)
        if not isinstance(config, dict): raise Exception("config parameter must be a dictionary")
        has_genome = "genome" in config or "reference" in config
        if not has_genome: raise Exception("config must specify either 'genome' or 'reference'")

        # Initialize browser object properties
        id = self._gen_id()
        config["id"] = id
        self.igv_id = id
        self.config = config
        self.comm = _IGVComm("igvcomm")
        self._status = "initializing"
        self.locus = None
        self.eventHandlers = {}
        self.svg = None
        self.message_queue = []

        # Add a callback for received messages
        @self.comm.comm.on_msg
        def _recv(msg):
            data = json.loads(msg['content']['data'])
            if 'status' in data: self.status = data['status']
            elif 'locus' in data: self.locus = data['locus']
            elif 'svg' in data: self.svg = data['svg']
            elif 'event' in data:
                if data['event'] in self.eventHandlers:
                    handler = self.eventHandlers[data['event']]
                    event_data = None
                    if 'data' in data: event_data = data['data']
                    handler(event_data)

    @property
    def status(self):
        return self._status

    @status.setter
    def status(self, value):
        self._status = value
        if value == "ready" and len(self.message_queue) > 0:
            time.sleep(0.5)
            self._send(self.message_queue.pop(0))

    def show(self):
        """Create an igv.js "Browser" instance on the front end."""
        display(HTML(f"""<div class="igv-navbar"></div><div id="{self.igv_id}"></div>"""))

        # DON'T check status before showing browser,
        msg = json.dumps({
            "id": self.igv_id,
            "command": "create",
            "options": self.config
        })
        self.comm.send(msg)

    def search(self, locus):
        """
        Go to the specified locus.

        :param locus:  Chromosome location of the form  "chromsosome:start-end", or for supported genomes (hg38, hg19, and mm10) a gene name.
        :type str
        """
        self._send({
            "id": self.igv_id,
            "command": "search",
            "locus": locus
        })

    def zoom_in(self):
        """
        Zoom in by a factor of 2
        """
        self._send({
            "id": self.igv_id,
            "command": "zoomIn"
        })

    def zoom_out(self):
        """
        Zoom out by a factor of 2
        """
        self._send({
            "id": self.igv_id,
            "command": "zoomOut"
        })

    def load_track(self, track):
        """
        Load a track.  Corresponds to the igv.js Browser function loadTrack (see https://github.com/igvteam/igv.js/wiki/Browser-Control-2.0#loadtrack).

        :param  track: A dictionary specifying track options.  See https://github.com/igvteam/igv.js/wiki/Tracks-2.0.
        :type dict
        """

        # Check for minimal igv.js requirements (the only required field for all tracks is url, which must be a string)
        if not isinstance(track, dict): raise Exception("track parameter must be a dictionary")

        self._send({
            "id": self.igv_id,
            "command": "loadTrack",
            "track": track
        })

    def to_svg(self):
        """
        Fetch the current IGV view as an SVG image and display it in this cell
        """
        div_id = self._gen_id()
        display(HTML(f"""<div id="{div_id}"></div>"""))
        self._send({
            "id": self.igv_id,
            "div": div_id,
            "command": "toSVG"
        })

    def get_svg(self):
        """
        Fetch the current IGV view as an SVG image.  To display the message call display_svg()
        """
        self.svg = "FETCHING"
        return self._send({
            "id": self.igv_id,
            "command": "toSVG"
        })

    def display_svg(self):
        """
        Display the current SVG image.  You must call get_svg() before calling this method.
        """
        if self.svg is None: return "Must call get_svg() first"
        elif self.svg == "FETCHING": return 'Awaiting SVG - try again in a few seconds'
        else: display(SVG(self.svg))

    def roi(self, roi):
        """
        Specify a region of interest for all tracks
        """
        return self._send({
            "id": self.igv_id,
            "command": "loadROI",
            "roi": roi
        })

    def on(self, event_name, cb):
        """
        Subscribe to an igv.js event.

        :param event_name - Name of the event.  Currently only "locuschange" is supported.
        :type str
        :param cb - callback function taking a single argument.  For the locuschange event this argument will contain
                a dictionary of the form  {chr, start, end}
        :type function
        """
        self.eventHandlers[event_name] = cb
        self._send({
            "id": self.igv_id,
            "command": "on",
            "eventName": event_name
        })

    def remove(self):
        """
        Remove the igv.js Browser instance from the front end.  The server Browser object should be disposed of after calling
        this method.
        """
        self._send({
            "id": self.igv_id,
            "command": "remove"
        })

    def _send(self, msg):
        if self.status == "ready":
            self.status = "busy"
            self.comm.send(json.dumps(msg))
        else:
            self.message_queue.append(msg)

    @staticmethod
    def _gen_id():
        return 'igv_' + str(random.randint(1, 10000000))
