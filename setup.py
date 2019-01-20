import setuptools
import os

with open("README.md", "r") as fh:
    long_description = fh.read()
    
def get_extension_files():
    """
    Move the files to the nbextensions directory and enable the extension
    """
    return [
        ('share/jupyter/nbextensions/igv', [
            'igv/static/extension.js',
        ]),
        ('share/jupyter/nbextensions/igv/igvjs',
         ['igv/static/igvjs/' + f for f in os.listdir('igv/static/igvjs')]
         ),
        ('etc/jupyter/nbconfig/notebook.d', ['igv.json']),
    ]

setuptools.setup(name='igv',
                 packages=['igv'],
                 version='0.9.2',
                 description='Jupyter extension for embedding the genome visualation igv.js in a notebook',
                 long_description=long_description,
                 long_description_content_type="text/markdown",
                 license='MIT',
                 author='Jim Robinson',
                 url='https://github.com/igvteam/igv.js-jupyter',
                 # download_url='https://github.com/igvteam/igv.js-jupyter/archive/0.2.1.tar.gz',
                 keywords=['igv', 'bioinformatics', 'genomics', 'visualization', 'ipython', 'jupyter'],
                 classifiers=[
                     'Development Status :: 4 - Beta',
                     'Intended Audience :: Science/Research',
                     'Intended Audience :: Developers',
                     'License :: OSI Approved :: MIT License',
                     'Programming Language :: Python',
                     'Framework :: IPython',
                 ],
                 package_data={'igv': ['static/extension.js', 'static/igvjs/*']},
                 data_files=get_extension_files(),
                 )
