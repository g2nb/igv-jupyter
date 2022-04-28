const VERSION = '2.0.0';

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
     * @param navbar - menu node to initialize
     */
    static render(navbar) {
        navbar.classList.add('igv-navbar-rendered');
        navbar.classList.add('igv-darkbar');
        navbar.appendChild(Menu.create_menu_dropdown('Genome', [
            Menu.create_menu_item('Local File ...', GenomeMenu.local_genome),
            Menu.create_menu_item('URL ...', GenomeMenu.remote_genome)
            // TODO: List genomes
        ]));
        navbar.appendChild(Menu.create_menu_dropdown('Tracks', [
            Menu.create_menu_item('Local File ...', TrackMenu.local_track),
            Menu.create_menu_item('URL ...', TrackMenu.remote_track)
            // TODO: List tracks
        ]));
        navbar.appendChild(Menu.create_menu_dropdown('Session', [
            Menu.create_menu_item('Local File ...', SessionMenu.local_session),
            Menu.create_menu_item('URL ...', SessionMenu.remote_session),
            Menu.create_menu_item('Save', SessionMenu.save_session)
        ]));
        // navbar.appendChild(Menu.create_menu_item('Share', null)); // Doesn't make sense in JupyterLab
        // navbar.appendChild(Menu.create_menu_item('Bookmark', null)); // Doesn't make sense in JupyterLab
        // navbar.appendChild(Menu.create_menu_item('Save SVG', SVGMenu.create_svg));
        navbar.appendChild(Menu.create_menu_dropdown('Help', [
            Menu.create_menu_item('GitHub Repository', HelpMenu.github),
            Menu.create_menu_item('User Forum', HelpMenu.forum),
            Menu.create_menu_item('About IGV-Jupyter', HelpMenu.about)
        ]));
        navbar.parentNode.style.overflow = 'visible';
        Menu.populate_genomes(navbar);
    }

    static populate_genomes(navbar) {
        try {
            fetch('https://s3.amazonaws.com/igv.org.genomes/genomes.json', {mode: 'cors'})
                .then(response => response.json())
                .then(data => {
                    const menu = navbar.querySelector(".igv-dropdown[data-name='Genome'] > .igv-dropdown-content");
                    menu.appendChild(document.createElement('hr'));
                    for (const genome of data) {
                        menu.appendChild(Menu.create_menu_item(genome.name, (igv_instance) => {
                            igv_instance.loadGenome(genome);
                        }));
                    }
                });
        }
        catch (error) {
            console.log('Cannot load genomes.json, disabling genome list functionality')
        }
    }

    static create_menu_item(name, callback) {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = name;
        link.addEventListener('click', (event) => {
            callback(Menu.igv_from_event(event));
        });
        return link
    }

    static create_menu_dropdown(name, items) {
        const dropdown = document.createElement('div');
        dropdown.setAttribute('data-name', name);
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

    static igv_from_event(event) {
        const igv_node = event.target.closest('.jp-Cell-outputArea').querySelector('.igv-container').parentNode;
        return window.igv.MessageHandler.browserCache.get(igv_node.id)
    }
}

class Dialog {
    static form_data(element) {
        const data = {};
        element.querySelectorAll('input, select, textarea').forEach((e) => {
            const name = e.getAttribute('name');
            data[name] = e.value;
        });
        return data;
    }

    static dialog_footer(element, resolve, reject) {
        // Create the dialog footer
        const footer = document.createElement('footer');
        footer.classList.add('igv-dialog-footer');

        // Create the Cancel button
        const cancel_button = document.createElement('button');
        cancel_button.classList.add('jp-Dialog-button', 'jp-mod-styled', 'jp-mod-reject');
        cancel_button.innerText = 'Cancel';
        cancel_button.addEventListener('click', () => {
            element.remove();
            reject();
        });
        footer.append(cancel_button);

        // Create the OK button
        const ok_button = document.createElement('button');
        ok_button.classList.add('jp-Dialog-button', 'jp-mod-styled', 'jp-mod-accept');
        ok_button.innerText = 'OK';
        ok_button.addEventListener('click', () => {
            const data = Dialog.form_data(element);
            element.remove();
            resolve(data);
        });
        footer.append(ok_button);

        return footer;
    }

    static create(content) {
        const element = document.createElement('dialog');
        element.classList.add('igv-dialog');
        element.innerHTML = content;
        const button_promse = new Promise((resolve, reject) => {
            element.append(Dialog.dialog_footer(element, resolve, reject));
        });
        document.body.append(element);
        element.style.display = 'block';
        return button_promse;
    }

    static name_from_url(url) {
        const name = url.substring(url.lastIndexOf('/')+1);
        if (!name.trim().length) return url;
        else return name;
    }

    static upload() {
        let input = document.querySelector('.igv-upload-input');
        if (!input) { // Lazily create the upload input, if necessary
            input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.classList.add('igv-upload-input');
            input.style.display = 'none';
            document.body.appendChild(input);
        }
        return input;
    }

    static read_local_file(accept=null, data_uri=false) {
        return new Promise((resolve, reject) => {
            const upload_input = Dialog.upload();
            if (accept) upload_input.setAttribute('accept', accept);
            else upload_input.removeAttribute('accept');
            upload_input.addEventListener('change', () => {
                if (upload_input.files.length === 0) return; // Protect against empty input
                const reader = new FileReader();
                reader.onload = event => {
                    resolve({
                        'name': upload_input.files[0].name,
                        'contents': event.target.result
                    });
                };
                if (data_uri) reader.readAsDataURL(upload_input.files[0]);
                else reader.readAsText(upload_input.files[0]);
            }, { 'once': true });
            upload_input.click();
        });
    }
}

class GenomeMenu {
    static local_genome(igv_instance) {
        Dialog.read_local_file(null, true)
            .then((data) => {
                igv_instance.loadGenome({
                    id: data.name,
                    fastaURL: data.contents,
                    indexed: false
                }).catch(error => {
                    alert("Genome did not load - invalid data and/or index file(s). " + error);
                })
            });
    }

    static remote_genome(igv_instance) {
        Dialog.create(`
            <label>Genome URL</label>
            <input type="text" name="genome_url" />
            <label>Index URL</label>
            <input type="text" name="index_url" />
        `).then((data) => {
            igv_instance.loadGenome({
                id: Dialog.name_from_url(data.genome_url),
                fastaURL: data.genome_url,
                indexURL: data.index_url
            });
        });
    }
}

class TrackMenu {
    static local_track(igv_instance) {
        Dialog.read_local_file(null, true)
            .then((data) => {
                igv_instance.loadTrack({
                    name: data.name,
                    url: data.contents,
                    format: TrackMenu.guess_format(data.name)
                });
            });
    }

    static remote_track(igv_instance) {
        Dialog.create(`
            <label>Track URL</label>
            <input type="text" name="track_url" />
            <label>Index URL</label>
            <input type="text" name="index_url" />
        `).then((data) => {
            igv_instance.loadTrack({
                name: Dialog.name_from_url(data.track_url),
                url: data.track_url,
                indexURL: data.index_url
            });
        });
    }

    static guess_format(filename) {
        const type = filename.substring(filename.lastIndexOf('.')+1);
        if (!type.trim().length) return filename;
        else return type;
    }
}

class SessionMenu {
    static local_session(igv_instance) {
        Dialog.read_local_file('.json')
            .then(data => igv_instance.loadSession(JSON.parse(data.contents)));
    }

    static remote_session(igv_instance) {
        Dialog.create(`
            <label>Session URL</label>
            <input type="text" name="session_url" />
        `).then((data) => {
            igv_instance.loadSession({
                url: data.session_url
            });
        });
    }

    static save_session(igv_instance) {
        Dialog.create(`
            <label>Filename</label>
            <input type="text" name="filename" value="igv-jupyter-session.json" >
        `).then((data) => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(igv_instance.toJSON()));
            if (!data.filename.endsWith('.json')) data.filename += '.json';
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", data.filename);
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    }
}

class SVGMenu {
    static create_svg(igv_instance) {
        igv_instance.saveSVGtoFile('igv.svg');
    }
}

class HelpMenu {
    static github() {
        window.open('https://github.com/g2nb/igv-jupyter');
    }

    static forum() {
        window.open('https://groups.google.com/g/igv-help');
    }

    static about() {
        alert(`igv-jupyter Version ${VERSION}\nigv.js Version ${window.igv.version()}`);
    }
}

// Create the menu
Menu.init();