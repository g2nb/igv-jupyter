# igv.js Jupyter Extension

This is an extension for [Jupyter Notebook](http://jupyter.org/) which
wraps igv.js [igv.js](https://github.com/igvteam/igv.js).  With this
extension you can render igv.js in a cell and call its API from
the notebook.

## Installation_

Tested against Python 3.7.1 and Jupyter version 4.4.0. It will not work on Python 2.X.

This extension has not been released to pipy and can only be installed
in development mode.  To install run the following from the project
root folder.

```
python setup.py build
pip install -e .
jupyter nbextension install --py igv
jupyter nbextension enable --py igv

```

## Usage

To insert an IGV instance into a cell:  (1) create an igv.Browser object,and (2) call showBrowser on the instance.
The igv.Browser initializer takes a configuration object which is converted to json and passed to the igv.js
createBrowser function.   The configuration object is described in the
[igv.js documentation](https://github.com/igvteam/igv.js/wiki/Browser-Configuration-2.0).


```python
import igv

b = igv.Browser(
    {"reference": {
        "id": "hg19",
        "fastaURL": "files/data/hg19.snippet.fasta",
        "indexed": False,
        "cytobandURL": "files/data/cytoband.hg19.snippet.txt",
        "tracks": [
            {
                "name": "RefGene",
                "url": "files/data/refgene.hg19.snippet.bed"
            }
        ]
    }}
)
```


To instantiate the client side IGV instance in a cell call show()


```python
b.show()
```

To load a track pass a track configuration object to load_track().  Track configuration
objects are described in the [igv.js documentation](https://github.com/igvteam/igv.js/wiki/Tracks-2.0).
The configuration object will be converted to json and passed to the igv.js browser
instance.

Data for the track can be loaded by URL or passed directly as an array of JSON objects.


```python
b.load_track(
    {
        "name": "Segmented CN",
        "url": "https://data.broadinstitute.org/igvdata/test/igv-web/segmented_data_080520.seg.gz",
        "format": "seg",
        "indexed": False
    })

```


```python
b.load_track(
    {
        "name": "Local VCF",
        "url": "files/data/example.vcf",
        "format": "vcf",
        "type": "variant",
        "indexed": False
    })
```
Note: If using the built-in Jupyter webserver take note of the "Range" header
requirements for indexed file formats desribed here: [Server Requirements](https://github.com/igvteam/igv.js/wiki/Data-Server-Requirements).
In general you will be restricted to serving non-indexed annotation (bed, gff) and wig files from the Jupyter web server.

```python
b.load_track({
    "name": "Copy number",
    "type": "seg",
    "displayMode": "EXPANDED",
    "height": 100,
    "isLog": True,
    "features": [
        {
            "chr": "chr20",
            "start": 1233820,
            "end": 1235000,
            "value": 0.8239,
            "sample": "TCGA-OR-A5J2-01"
        },
        {
            "chr": "chr20",
            "start": 1234500,
            "end": 1235180,
            "value": -0.8391,
            "sample": "TCGA-OR-A5J3-01"
        }
    ]
})
```