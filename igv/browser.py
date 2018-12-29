from IPython.display import HTML, Javascript
import json
import random

class Browser:

    # Always remember the *self* argument
    def __init__(self, config):

        self.igv_id = self._gen_id()
        self.config = config

    def dump_json(self):

        print(json.dumps(self.config))

    def create_browser(self):

        return HTML("""
            <div id="%s" class="igv-js"></div>
            <script type="text/javascript">
                require([location.origin + Jupyter.contents.base_url + "nbextensions/igv/extension.js"], function(igvjupyter) {
                    var div = $("#%s.igv-js")[0], options = %s;
                    return igvjupyter.createBrowser(div, options)
                       .then(function (b) {
                          igv.browser = b
                          return b
                        });
                });
            </script>
            """ % (self.igv_id, self.igv_id, json.dumps(self.config)))

    def search(self, locus):
        return Javascript("igv.browser.search(\"" + locus + "\")")

    def load_track(self, track):

        j = json.dumps(track)
        return Javascript("igv.browser.loadTrack(" + j + ")")


    def _gen_id(self):
        return 'igv_' + str(random.randint(1, 10000000))