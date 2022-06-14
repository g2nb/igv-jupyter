import setuptools


with open("README.md", "r") as fh:
    long_description = fh.read()


setup_args = dict(
    name='igv-jupyter',
    version='2.0.1',
    packages=['igv'],
    url="https://github.com/g2nb/igv-jupyter",
    author="Thorin Tabor",
    author_email="tmtabor@cloud.ucsd.edu",
    description="Jupyter extension for embedding the igv.js genome visualization in a notebook",
    license="MIT",
    long_description=long_description,
    long_description_content_type="text/markdown",
    install_requires=[
        "jupyterlab~=3.0",
        "ipywidgets>=7.0.0",
        "igv-notebook",
    ],
    zip_safe=False,
    include_package_data=True,
    python_requires=">=3.6",
    platforms="Linux, Mac OS X, Windows",
    keywords=['igv', 'bioinformatics', 'genomics', 'visualization', 'Jupyter', 'JupyterLab', 'JupyterLab3'],
    classifiers=[
        'Intended Audience :: Developers',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: MIT License',
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Framework :: Jupyter",
    ],
    data_files=[("share/jupyter/nbtools", ["nbtools/igv.json"])],
    package_data={'igv': ['static/menu.js', 'static/menu.css']},
)


if __name__ == "__main__":
    setuptools.setup(**setup_args)
