import './menu.css';

class Menu {
    /**
     * Initialize unrendered igv-jupyter menus
     */
    static init() {
        document.querySelectorAll('.igv-navbar').forEach((navbar) => {
            if (!navbar.classList.contains('igv-navbar-rendered')) Menu.render(navbar);
        });
    }

    /**
     * Initialize a specific igv-jupyter menu
     *
     * @param div - menu node to initialize
     */
    static render(navbar) {
        // const template = `
        //      <div class="igv-navbar">
        //           <a href="#home">Home</a>
        //           <a href="#news">News</a>
        //           <div class="igv-dropdown">
        //             <button class="igv-dropdown-button">Dropdown
        //                   <i class="fa fa-caret-down"></i>
        //             </button>
        //             <div class="igv-dropdown-content">
        //                   <a href="#">Link 1</a>
        //                   <a href="#">Link 2</a>
        //                   <a href="#">Link 3</a>
        //             </div>
        //           </div>
        //     </div>`;
        //
        // const menu = new DOMParser().parseFromString(template, "text/html").querySelector('div.navbar');
        // container.appendChild(menu);

        navbar.appendChild(Menu.create_menu_dropdown('Genome', [
            Menu.create_menu_item('Local File ...', () => {}),
            Menu.create_menu_item('URL ...', () => {})
        ]));
        navbar.appendChild(Menu.create_menu_dropdown('Tracks', []));
        navbar.appendChild(Menu.create_menu_dropdown('Session', []));
        navbar.appendChild(Menu.create_menu_item('Share', null));
        navbar.appendChild(Menu.create_menu_item('Bookmark', null));
        navbar.appendChild(Menu.create_menu_item('Save SVG', null));
        navbar.appendChild(Menu.create_menu_dropdown('Help', []));

        navbar.classList.add('igv-menu-rendered');
    }

    static create_menu_item(name, callback) {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = name;
        link.addEventListener('click', () => {
            console.log('CLICKED!');
        });
        return link
    }

    static create_menu_dropdown(name, items) {
        const dropdown = document.createElement('div');
        dropdown.classList.add('igv-dropdown');
        dropdown.appendChild(Menu.menu_button(name));
        dropdown.appendChild(Menu.menu_content(items));
        return dropdown;
    }

    static menu_content(items) {
        const content = document.createElement('div');
        content.classList.add('igv-dropdown-content');
        for (const item of items) content.appendChild(item);
        return content
    }

    static menu_button(name) {
        const button = document.createElement('button');
        button.classList.add('igv-dropdown-button');
        button.textContent = name;
        button.appendChild(Menu.create_caret());
        return button;
    }

    static create_caret() {
        const icon = document.createElement('i');
        icon.classList.add('fa', 'fa-caret-down');
        return icon;
    }
}

export default Menu;