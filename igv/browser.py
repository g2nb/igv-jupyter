from IPython.display import HTML, Javascript
import json
import random

class Browser:

    jsURL = "location.origin + Jupyter.contents.base_url + \"nbextensions/igv/extension.js\""
    igvjupyter = "var igvjupyter = require(" +  jsURL + ")"

    # Always remember the *self* argument
    def __init__(self, config):

        self.igv_id = self._gen_id()
        self.config = config
        config["id"] =self.igv_id

    def show_browser(self):

        return HTML("""
            <div id="%s" class="igv-js"></div>
            <script type="text/javascript">
                require([%s], function(igvjupyter) {
                    var div = $("#%s.igv-js")[0], options = %s;
                    return igvjupyter.createBrowser(div, options)
                       .then(function (b) {
                          return b
                        });
                });
            </script>
            """ % (self.igv_id, Browser.jsURL, self.igv_id, json.dumps(self.config)))

    def search(self, locus):
        return Javascript("""
          %s
          igvjupyter.getBrowser("%s").search("%s")
        """ % (Browser.igvjupyter, self.igv_id, locus))

    def zoom_in(self):
        return Javascript("""
          %s
          igvjupyter.getBrowser("%s").zoomIn()
        """ % (Browser.igvjupyter, self.igv_id))

    def zoom_out(self):
        return Javascript("""
          %s
          igvjupyter.getBrowser("%s").zoomOut()
        """ % (Browser.igvjupyter, self.igv_id))

    def load_track(self, track):

        j = json.dumps(track)
        return Javascript("""
            %s
            igvjupyter.getBrowser("%s").loadTrack(%s)
        """ % (Browser.igvjupyter, self.igv_id, j))

    def dump_json(self):
        print(json.dumps(self.config))

    def _gen_id(self):
        return 'igv_' + str(random.randint(1, 10000000))

