# File Explorer Keyboard Navigation

Adds commands to navigage the file explorer using the keyboard. There are no default hotkey bindings; go to `Settings` -> `Hotkeys` to set your own. I use `Ctrl` + `↓`/`↑` for next/previous file, and `Ctrl` + `Shift` + `↓`/`↑` for next/previous folder.

This plugin is currently a proof-of-concept with only limited testing. It may navigate files out of visual order, especially when dealing with non-standard characters or non-latin text. Please file an issue if you notice any errors.

Note that the latest insider release (0.15.0) supports keyboard naviagation natively, though I'm unsure how exactly it compares to the features of this plugin.

## Limitations

The plugin may not correctly recognize files immediately on creation, and Obsidian ocassionally orders files strangely immediately after a rename. If it is skipping new files, refresh or restart Obsidian.

Some files with trailing punctuation may be out of order.

## Installation

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