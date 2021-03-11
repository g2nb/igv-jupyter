#!/bin/bash

set -o verbose

rm -fr dist
rm -fr build
rm -fr igv.egg-info

pip install -e .

jupyter serverextension enable igv --sys-prefix
jupyter labextension develop . --overwrite
jupyter nbextension install --py igv --symlink
jupyter nbextension enable --py igv
