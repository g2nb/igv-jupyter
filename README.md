






# igv.js Jupyter Extension

This is an extension for [Jupyter Notebook](http://jupyter.org/) which integrates [igv.js](http://igv.org/doc/doc.html), 
an embeddable interactive genome visualization component written in JavaScript and CSS. 
It is based on the [Integrative Genomics Viewer (IGV)](http://igv.org/), and developed by the same team. 

## Installing

This extension can be installed through pip or conda.

> pip install igv

or 

> conda install -c igv igv

## Enabling

This extension can be enabled in Jupyter Notebook by running the following on the command line:

> jupyter nbextension install --py igv

> jupyter nbextension enable --py igv

## Using the extension

This extension consists of a Python package that wraps igv.js functionality and an nbextension that's used for rendering 
igv.js when it is displayed in a notebook. Once the extension is installed and enabled, it can be used by importing IGV 
and associated classes, then returning them in a cell. Example code:

```python
from igv import IGV, Reference, Track

IGV(locus="chr1:155,160,475-155,184,282", reference=Reference(id="hg19"), tracks=[Track(
    name="Genes", 
    url="//s3.amazonaws.com/igv.broadinstitute.org/annotations/hg19/genes/gencode.v18.collapsed.bed",
    index_url="//s3.amazonaws.com/igv.broadinstitute.org/annotations/hg19/genes/gencode.v18.collapsed.bed.idx", 
    display_mode="EXPANDED")])
```

## Server

If using the built-in Jupyter webserver take note of the "Range" header requirements desribed here: [Server Requirements](https://github.com/igvteam/igv.js/wiki/Data-Server-Requirements).
In general you will be restricted to serving non-indexed annotation (bed, gff) and wig files from the Jupyter web server.

### Troubleshooting

> error: can't copy 'igv/static/igvjs/img': doesn't exist or not a regular file

If you see the above error when trying to install through PIP, you may be experiencing a known issue with Python 2.7.6.
To get around this error we recommend either updating your system's version of Python or simply installing through the 
conda package manager (described above).


## Development

```
python setup.py build
pip install -e .
jupyter nbextension install --py igv
jupyter nbextension enable --py igv

```