# How to Deploy to PyPi Test

1. Make sure setup.py and igv.__version__ are updated.
2. Navigate to the correct directory:
> cd igv.js-jupyter
3. Run the following to register the deploy with the test PyPi:
> python setup.py register -r pypitest
4. Upload the files by running:
> python setup.py sdist upload -r pypitest
5. If the upload fails go to [https://testpypi.python.org/pypi](https://testpypi.python.org/pypi) and manually upload dist/igv-*.tar.gz.
6. Test the deploy by uninstalling and reinstalling the package: 
> sudo pip uninstall igv;
> sudo pip install -i https://testpypi.python.org/pypi igv

# How to Deploy to Production PyPi

1. First deploy to test and ensure everything is working correctly (see above).
2. Navigate to the correct directory:
> cd igv.js-jupyter
3. Run the following to register the deploy with PyPi:
> python setup.py register
4. Upload the files by running:
> python setup.py sdist upload
5. If the upload fails go to [https://pypi.python.org/pypi](https://pypi.python.org/pypi) and manually upload dist/igv-*.tar.gz.
6. Test the deploy by uninstalling and reinstalling the package: 
> sudo pip uninstall igv;
> sudo pip install igv

# How to Deploy to Conda

1. Deploy to Production PyPi
2. Navigate to Anaconda directory
> cd anaconda
3. Run the following, removing the existing directory if necessary:
> conda skeleton pypi igv --version <VERSION>
4. Build the package:
> conda build igv
5. Upload the newly built package:
> anaconda upload /path/to/anaconda/conda-bld/osx-64/igv-<VERSION>-py35_0.tar.bz2 -u igv
6. Converting this package to builds for other operating systems can be done as shown below. You will need to upload each 
built version using a separate upload command.
> conda convert --platform all /path/to/anaconda/conda-bld/osx-64/igv-<VERSION>-py35_0.tar.bz2 -o outputdir/
7. Log into the [Anaconda website](https://anaconda.org/) to make sure everything is good.