#!/bin/bash

set -o verbose

rm -fr /usr/local/share/jupyter/
rm -fr dist
rm -fr build
rm -fr igv.egg-info

python setup.py install
pip install -e .

jupyter nbextension install --py igv
jupyter nbextension enable --py igv
