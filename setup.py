import json
import setuptools
from pathlib import Path
from jupyter_packaging import (
    create_cmdclass,
    install_npm,
    ensure_targets,
    combine_commands,
    skip_if_exists
)

name = "igv"                            # Python package name
labext_name = "@igvteam/igv-jupyter"    # Javascript package name

HERE = Path(__file__).parent.resolve()
nb_path = (HERE / name / 'nbextension' / 'static')
lab_path = (HERE / name / "labextension")
tool_path = (HERE / "nbtools")

# Representative files that should exist after a successful build
jstargets = [
    (nb_path / 'index.js'),
    (HERE / 'lib' / 'plugin.js'),
    str(lab_path / "package.json"),
]

package_data_spec = {
    name: ["*"],
}

data_files_spec = [
    ('share/jupyter/nbextensions/%s' % name, str(nb_path), '**'),
    ("share/jupyter/labextensions/%s" % labext_name, str(lab_path), "**"),
    ("share/jupyter/labextensions/%s" % labext_name, str(HERE), "install.json"),
    ("share/jupyter/nbtools", tool_path, "igv.json"),
]

cmdclass = create_cmdclass("jsdeps",
    package_data_spec=package_data_spec,
    data_files_spec=data_files_spec
)

js_command = combine_commands(
    install_npm(HERE, build_cmd="build", npm=["jlpm"]),
    ensure_targets(jstargets),
)

is_repo = (HERE / ".git").exists()
if is_repo:
    cmdclass["jsdeps"] = js_command
else:
    cmdclass["jsdeps"] = skip_if_exists(jstargets, js_command)

long_description = (HERE / "README.md").read_text()

# Get the package info from package.json
pkg_json = json.loads((HERE / "package.json").read_bytes())

setup_args = dict(
    name='igv-jupyter',
    version=pkg_json["version"],
    url=pkg_json["homepage"],
    author=pkg_json["author"]["name"],
    author_email=pkg_json["author"]["email"],
    description=pkg_json["description"],
    license=pkg_json["license"],
    long_description=long_description,
    long_description_content_type="text/markdown",
    cmdclass=cmdclass,
    packages=setuptools.find_packages(),
    install_requires=[
        "jupyterlab~=3.0",
        "ipywidgets>=7.0.0",
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
)


if __name__ == "__main__":
    setuptools.setup(**setup_args)
