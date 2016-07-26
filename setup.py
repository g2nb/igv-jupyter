from distutils.core import setup

setup(name='igv',
      packages=['igv'],
      version='0.1.0',
      description='Jupyter extension for embedding IGV.js in a notebook',
      license='BSD',
      author='Jim Robinson, Thorin Tabor',
      author_email='igv-team@broadinstitute.org',
      url='https://github.com/igvteam/igv.js-jupyter',
      download_url='https://github.com/igvteam/igv.js-jupyter/archive/0.1.0.tar.gz',
      keywords=['igv', 'visualization', 'ipython', 'jupyter'],
      classifiers=[
          'Development Status :: 4 - Beta',
          'Intended Audience :: Science/Research',
          'Intended Audience :: Developers',
          'License :: OSI Approved :: MIT License',
          'Programming Language :: Python',
          'Framework :: IPython',
      ],
      install_requires=[
          'jupyter',
          'notebook>=4.2.0',
      ],
      package_data={'igv': ['static/igv-jupyter.js', 'static/igvjs/*']},
      )
