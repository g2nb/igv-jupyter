# igv Jupyter Extension

[![Binder](https://beta.mybinder.org/badge.svg)](https://mybinder.org/v2/gh/igvteam/igv-jupyter/master?filepath=examples/BamFiles.ipynb)
=======


igv-jupyter is an extension for [Jupyter Notebook](http://jupyter.org/) which
wraps [igv.js](https://github.com/igvteam/igv.js). With this
extension you can render igv.js in a cell and call its API from
the notebook. The extension exposes a python API that mimics the igv.js 
Browser creation and control APIs. Dictionaries are used for browser and track 
configuration objects. Track data can be loaded from local or remote 
URLs, or supplied directly as lists of objects.

## Installation

Requirements:
* python >= 3.6.4
* jupyterlab >= 3.0


```bash
pip install igv-jupyter

# To install to configuration in your home directory
jupyter serverextension enable --py igv
jupyter labextension enable --py igv
jupyter nbextension install --py igv
jupyter nbextension enable --py igv


# If using a virtual environment
jupyter serverextension enable --py igv --sys-prefix
jupyter labextension enable --py igv --sys-prefix
jupyter nbextension install --py igv --sys-prefix
jupyter nbextension enable --py igv --sys-prefix

```

## Usage

### Examples

Example notebooks are available in the github repository. To download without cloning the repository use 
this [link](https://github.com/igvteam/igv.js-jupyter/archive/master.zip). Notebooks are available in the
"examples" directory.



### Initialization

To insert an IGV instance into a cell:

(1) create an igv.Browser object,and (2) call showBrowser on the instance.

Example:

```python
import igv

b = igv.Browser({"genome": "hg19"})
```

The igv.Browser initializer takes a configuration object which is converted to JSON and passed to the igv.js
createBrowser function. The configuration object is described in the
[igv.js documentation](https://github.com/igvteam/igv.js/wiki/Browser-Configuration-2.0).


To instantiate the client side IGV instance in a cell call show()


```python
b.show()
```

### Tracks

To load a track pass a track configuration object to load_track(). Track configuration
objects are described in the [igv.js documentation](https://github.com/igvteam/igv.js/wiki/Tracks-2.0).
The configuration object will be converted to JSON and passed to the igv.js browser
instance.

Data for the track can be loaded by URL or passed directly as an array of JSON objects.


#### Remote URL

```python
b.load_track(
    {
        "name": "Segmented CN",
        "url": "https://data.broadinstitute.org/igvdata/test/igv-web/segmented_data_080520.seg.gz",
        "format": "seg",
        "indexed": False
    })

```

#### Local File

```python
b.load_track(
    {
        "name": "Local VCF",
        "url": "data/example.vcf",
        "format": "vcf",
        "type": "variant",
        "indexed": False
    })
```

#### Embedded Features

Features can also be passed directly to tracks.

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

### Navigation

Zoom in by a factor of 2

```python
b.zoom_in()
```

Zoom out by a factor of 2

```python
b.zoom_out()
```

Jump to a specific locus

```python
b.search('chr1:3000-4000')

```

Jump to a specific gene. This uses the IGV search web service, which currently supports a limited number of genomes:  hg38, hg19, and mm10.
To configure a custom search service see the [igv.js documentation](https://github.com/igvteam/igv.js/wiki/Browser-Configuration-2.0#search-object-details)

```python
b.search('myc')

```

### SVG output

Saving the current IGV view as an SVG image requires two calls.

```python
b.get_svg()

b.display_svg()

```


### Events

**_Note: This is an experimental feature._**

```python

def locuschange(data):
    b.locus = data

    b.on("locuschange", locuschange)

    b.zoom_in()

    return b.locus

```

#### Development

To build and install from source:

```bash
python setup.py build
pip install -e .
jupyter labextension develop . --overwrite
jupyter nbextension install --py igv --symlink
jupyter nbextension enable --py igv
```

After source changes, the extension can be rebuilt using:

```bash
jupyter labextension build .
```

Creating a conda environment
```bash
conda create -n test python=3.7.1
conda activate test
conda install pip
conda install jupyter

```
