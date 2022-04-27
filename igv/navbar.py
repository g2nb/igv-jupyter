import os
from IPython.display import HTML, Javascript, display


def show_navbar():
    # Display the base HTML container for the menu
    display(HTML('<div class="igv-navbar"></div>'))

    # Import the menu styles
    menu_path = os.path.join(os.path.dirname(__file__), 'static/menu.css')
    menu_file = open(menu_path, 'r')
    menu_css = menu_file.read()
    display(HTML(f'<style>{menu_css}</style>'))

    # Build the menu with Javascript
    menu_path = os.path.join(os.path.dirname(__file__), 'static/menu.js')
    menu_file = open(menu_path, 'r')
    menu_js = menu_file.read()
    display(Javascript(menu_js))
