# IGV.js Jupyter Extension

This is an extension for [Jupyter Notebook](http://jupyter.org/) which integrates [IGV.js](http://igv.org/doc/doc.html), 
an embeddable interactive genome visualization component written in JavaScript and CSS. 
It is based on the [Integrative Genomics Viewer (IGV)](http://igv.org/), and developed by the same team. 

## Installing

This extension can be installed through pip or conda.

> pip install -i https://testpypi.python.org/pypi igv-jupyter

or 

> conda install -c genepattern igv-jupyter

## Enabling

This extension can be enabled in Jupyter Notebook by running the following on the command line:

> jupyter nbextension install --py igv

> jupyter nbextension enable --py igv

## Using the extension

This extension consists of a Python package that wraps IGV.js functionality and an nbextension that's used for rendering 
IGV.js when it is displayed in a notebook.