# File Explorer Keyboard Navigation

Adds commands to open the next/previous file in the file explorer.

## Limitations
This plugin is currently a simple proof-of-concept with only limited testing. It navigates only markdown files within the parent folder of the currently opened note, in alphabetical order by note name. If you have any other sort order enabled, this plugin will still move alphabetically and not according to the visual sort order.

This plugin is currently in beta and cannot be installed through the community plugin store.

### Installing the plugin using BRAT

1. Install the BRAT plugin
    1. Open `Settings` -> `Community Plugins`
    2. Disable safe mode, if enabled
    3. *Browse*, and search for "BRAT"
    4. Install the latest version of **Obsidian 42 - BRAT**
2. Open BRAT settings (`Settings` -> `Obsidian 42 - BRAT`)
    1. Scroll to the `Beta Plugin List` section
    2. `Add Beta Plugin`
    3. Specify this repository: `kzhovn/file-explorer-keyboard-nav`
3. Enable the `File Explorer Keyboard Navigation` plugin (`Settings` -> `Community Plugins`)

### Manually installing the plugin

- Copy over `main.js` and `manifest.json` to your vault `VaultFolder/.obsidian/plugins/file-explorer-keyboard-nav/`.