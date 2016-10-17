__author__ = 'Jim Robinson, Thorin Tabor, Douglass Turner'
__copyright__ = 'Copyright 2016, Broad Institute'
__version__ = '0.2.1'
__status__ = 'Beta'
__license__ = 'MIT'

from IPython.display import HTML
import random
import json

# Constant for JavaScript's Number.MAX_VALUE
MAX_VALUE = 1.7976931348623157e+308


class IGVBase:
    """
    Base class for all IGV classes
    """

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def __unicode__(self):
        return json.dumps(self.create_map())

    def __str__(self):
        return str(self.__unicode__())

    @staticmethod
    def __to_camel_case(snake_str):
        components = snake_str.split('_')
        for i in range(1, len(components)):
            if components[i] == 'url':
                components[i] = 'URL'
        return components[0] + "".join(x.title() for x in components[1:])

    def create_map(self):
        """Return a map based on IGV.js Reference object specification"""
        obj = self.__dict__
        for i in obj.keys():
            # Remove null entries
            if obj[i] is None:
                del obj[i]
            # Change keys to camel case
            camel = self.__to_camel_case(i)
            if camel != i:
                obj[camel] = obj.pop(i)
        return obj


class Track(IGVBase):
    """
    This class represents a track in IGV.js
    """

    # Options for all track types
    type = None
    source_type = 'file'
    format = None
    name = None
    url = None
    index_url = None
    indexed = None
    order = None
    color = None
    height = True
    auto_height = True
    min_height = 50
    max_height = 500
    visibility_window = None

    # Options for type = "annotation"
    display_mode = None
    expanded_row_height = None
    squished_row_height = None
    name_field = None
    max_rows = None
    searchable = None

    # Options for type = "wig"
    min = None
    max = None
    # color = None

    # Options for type = "alignment"
    view_as_pairs = None
    pairs_supported = None
    deletion_color = None
    skipped_color = None
    insertion_color = None
    neg_strand_color = None
    pos_strand_color = None
    color_by = None
    color_by_tag = None
    bam_color_tag = None
    sampling_window_size = None
    sampling_depth = None
    # max_rows = None
    filter = None

    # Options for type = "alignment" && source_type = "ga4gh"
    # url = None
    read_group_set_ids = None

    # Options for type = "variant"
    # display_mode = None
    homvar_color = None
    hetvar_color = None
    homref_color = None

    # Options for type = "variant" && source_type = "ga4gh"
    # url = None
    variant_set_ids = None
    call_set_ids = None


class Reference(IGVBase):
    """
    This class represents a reference genome in IGV.js
    """
    id = None
    fasta_url = None
    index_url = None
    cytoband_url = None
    indexed = True


class Search(IGVBase):
    """
    Class representing a search web service as defined by IGV.js
    """
    url = None
    results_field = None
    coords = 1
    chr_field = 'chromosome'
    start_field = 'start'
    end_field = 'end'


class IGV(IGVBase):
    """
    This class represents an instance of IGV.js in a Jupyter notebook
    """
    igv_id = None
    reference = None
    show_karyo = False
    show_navigation = True
    show_ruler = True
    tracks = None
    track_defaults = None
    locus = None
    flanking = 1000
    search = None
    api_key = None
    double_click_delay = 500
    hide_ideogram = False
    show_cursor_tracking_guide = True
    show_center_guide = True

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
        self.__gen_id()

    def __gen_id(self):
        """Generates a random id so that references to multiple IGV.js instances do not get confused"""
        self.igv_id = 'igv_' + str(random.randint(1, 10000000))

    def _repr_html_(self):
        """Display IGV.js when this object is returned in the notebook"""
        return self.display().__html__()

    def __unicode__(self):
        return json.dumps(self.create_map())

    def __str__(self):
        return str(self.__unicode__())

    def create_map(self):
        """Return a map based on IGV.js Browser object specification"""
        obj = {}
        if self.reference is not None:
            obj['reference'] = self.reference.create_map()
        if self.show_karyo is not None:
            obj['showKaryo'] = self.show_karyo
        if self.show_navigation is not None:
            obj['showNavigation'] = self.show_navigation
        if self.show_ruler is not None:
            obj['showRuler'] = self.show_ruler
        if self.tracks is not None:
            obj['tracks'] = [i.create_map() for i in self.tracks]
        if self.track_defaults is not None:
            obj['trackDefaults'] = self.track_defaults
        if self.locus is not None:
            obj['locus'] = self.locus
        if self.flanking is not None:
            obj['flanking'] = self.flanking
        if self.search is not None:
            obj['search'] = self.search.create_map()
        if self.api_key is not None:
            obj['apiKey'] = self.api_key
        if self.double_click_delay is not None:
            obj['doubleClickDelay'] = self.double_click_delay
        if self.hide_ideogram is not None:
            obj['hideIdeogram'] = self.hide_ideogram
        if self.show_cursor_tracking_guide is not None:
            obj['showCursorTrackingGuide'] = self.show_cursor_tracking_guide
        if self.show_center_guide is not None:
            obj['showCenterGuide'] = self.show_center_guide
        return obj

    def display(self):
        """Display the IGV.js instance"""
        return HTML("""
            <div id="%s" class="igv-js"></div>
            <script type="text/javascript">
                require([location.origin + Jupyter.contents.base_url + "nbextensions/igv/igv-jupyter.js"], function() {
                    var div = $("#%s.igv-js")[0], options = %s;
                    igv.createBrowser(div, options);
                });
            </script>
            """ % (self.igv_id, self.igv_id, self))

    @staticmethod
    def load_track(track):
        """Dynamically add a track using IGV.js' loadTrack() API call"""
        print("Loading track into IGV.js")
        return HTML("""
            <script type="text/javascript">
                require([location.origin + Jupyter.contents.base_url + "nbextensions/igv/igv-jupyter.js"], function() {
                    igv.browser.loadTrack(%s);
                });
            </script>
            """ % str(track))

    @staticmethod
    def goto(search_str):
        """Search the tracks using a webservice via IGV.js' search() API call"""
        print("Goto track location ")
        return HTML("""
            <script type="text/javascript">
                require([location.origin + Jupyter.contents.base_url + "nbextensions/igv/igv-jupyter.js"], function() {
                    igv.browser.search("%s");
                });
            </script>
            """ % search_str)

    @staticmethod
    def zoom_in():
        """Zoom in by a factor of 2 using IGV.js' zoomIn() API call"""
        print("Zooming in with IGV.js")
        return HTML("""
            <script type="text/javascript">
                require([location.origin + Jupyter.contents.base_url + "nbextensions/igv/igv-jupyter.js"], function() {
                    igv.browser.zoomIn();
                });
            </script>
            """)

    @staticmethod
    def zoom_out():
        """Zoom out by a factor of 2 using IGV.js' zoomIn() API call"""
        print("Zooming out with IGV.js")
        return HTML("""
            <script type="text/javascript">
                require([location.origin + Jupyter.contents.base_url + "nbextensions/igv/igv-jupyter.js"], function() {
                    igv.browser.zoomOut();
                });
            </script>
            """)


################################################
# Jupyter extension functions after this point #
################################################


def _jupyter_server_extension_paths():
    return [{
        "module": "igv"
    }]


def _jupyter_nbextension_paths():
    return [dict(
        section="notebook",
        # the path is relative to the `my_fancy_module` directory
        src="static",
        # directory in the `nbextension/` namespace
        dest="igv",
        # _also_ in the `nbextension/` namespace
        require="igv/igv-jupyter")]


def load_jupyter_server_extension(nbapp):
    nbapp.log.info("igv enabled!")
