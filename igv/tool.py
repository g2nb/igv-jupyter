from .browser import Browser
from urllib.parse import urlparse
from os.path import basename

# Attempt to import nbtools, if it's not installed create a dummy decorator that does nothing
try:
    from nbtools import build_ui
except ImportError:
    def build_ui(*args, **kwargs):
        def decorator(func):
            return func
        return decorator


@build_ui(name="igv.js: Integrative Genomics Viewer",
          description="Use igv.js to embed an interactive genome visualization",
          logo="http://igv.org/web/img/favicon.ico",
          origin="+",
          run_label="Visualize",
          parameter_groups=[
              {
                  "name": "Basic Parameters",
                  "parameters": ["genome", "tracks", "indices", "locus"],
              },
              {
                  "name": "Advanced Parameters",
                  "parameters": ["track_format", "track_type"],
                  "hidden": True
              }
          ],
          parameters={
              "genome": {
                  "name": "genome",
                  "description": "Choose the genome for your data.",
                  "type": "choice",
                  "combo": True,
                  "sendto": False,
                  "default": "hg38",
                  "choices": {  # Find a way to read this directly from genomes.json and populate dynamically
                      "Human (GRCh38/hg38)": "hg38",
                      "Human (CRCh37/hg19)": "hg19",
                      "Human (hg18)": "hg18",
                      "Mouse (GRCm38/mm10)": "mm10",
                      "Gorilla (gorGor4.1/gorGor4)": "gorGor4",
                      "Chimp (SAC 2.1.4/panTro4)": "panTro4",
                      "Bonobo (MPI-EVA panpan1.1/panPan2)": "panPan2",
                      "Pig (SGSC Sscrofa11.1/susScr11)": "susScr11",
                      "Cow (UMD_3.1.1/bosTau8)": "bosTau8",
                      "Dog (Broad CanFam3.1/canFam3)": "canFam3",
                      "Rat (RGCS 6.0/rn6)": "rn6",
                      "Zebrafish (GRCZ11/danRer11)": "danRer11",
                      "Zebrafish (GRCZ10/danRer10)": "danRer10",
                      "D. melanogaster (dm6)": "dm6",
                      "C. elegans (ce11)": "ce11",
                      "S. cerevisiae (sacCer3)": "sacCer3"
                  }
              },
              "tracks": {
                  "name": "tracks",
                  "description": "Enter the URL to the track dataset(s)",
                  "type": "file",
                  "optional": True,
                  "default": "",
                  "maximum": 100
              },
              "indices": {
                  "name": "indices",
                  "description": "Enter the URL to the index files that correspond to each track",
                  "type": "file",
                  "optional": True,
                  "default": "",
                  "maximum": 100
              },
              "track_format": {
                  "name": "track format",
                  "description": "Enter the format of the track datasets",
                  "type": "choice",
                  "combo": True,
                  "optional": True,
                  "default": "",
                  "choices": {  # Display some common track formats
                      "": "",
                      "bw": "bw",
                      "bigwig": "bigwig",
                      "wig": "wig",
                      "bedgraph": "bedgraph",
                      "tdf": "tdf",
                      "vcf": "vcf",
                      "seg": "seg",
                      "mut": "mut",
                      "bam": "bam",
                      "cram": "cram",
                      "bedpe": "bedpe",
                      "bedpe-loop": "bedpe-loop",
                      "bp": "bp",
                      "gwas": "gwas",
                      "bed": "bed",
                      "bigbed": "bigbed",
                      "bb": "bb"
                  }
              },
              "track_type": {
                  "name": "track type",
                  "description": "Enter the type of the track datasets",
                  "type": "choice",
                  "combo": True,
                  "optional": True,
                  "default": "",
                  "choices": {  # Display some common track types
                      "": "",
                      "annotation": "annotation",
                      "variant": "variant",
                      "alignment": "alignment",
                      "interaction": "interaction",
                      "wig": "wig",
                      "seg": "seg",
                      "mut": "mut",
                      "arc": "arc",
                      "gwas": "gwas",
                      "bedtype": "bedtype"
                  }
              },
              "locus": {
                  "name": "locus",
                  "description": "Provide a locus or gene of interest for your data",
                  "type": "text",
                  "optional": True,
                  "default": "",
              }
          })
def igv_tool(genome, tracks=None, indices=None, track_format=None, track_type=None, locus=None):
    # Create the genome browser and display it
    browser = Browser({"genome": genome, "locus": locus})
    browser.show()

    # Ensure tracks and indices are represented as lists
    if tracks is None: tracks = []
    if indices is None: indices = []
    if type(tracks) == str: tracks = [tracks]
    if type(indices) == str: indices = [indices]

    # Add tracks to the browser
    for i in range(len(tracks)):
        track_spec = {
            "name": basename(urlparse(tracks[i]).path),
            "url": tracks[i]
        }
        if track_format: track_spec['format']: track_format
        if track_type: track_spec['type']: track_type
        if i < len(indices) and indices[i]:
            track_spec['indexURL'] = indices[i]
        else:
            track_spec['indexed'] = False

        browser.load_track(track_spec)
