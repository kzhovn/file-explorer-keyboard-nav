import { Plugin, TFile, TFolder, TAbstractFile } from 'obsidian';

const enum Direction {
	Forward,
	Backwards
}

export default class FileExplorerKeyboardNav extends Plugin {

	async onload() {
		this.addCommand({
			id: 'file-explorer-next-file',
			name: 'Go to next file',
			callback: () => {
				this.openNextFile(Direction.Forward);
			}
		});

		this.addCommand({
			id: 'file-explorer-previous-file',
			name: 'Go to previous file',
			callback: () => {
				this.openNextFile(Direction.Backwards);
			}
		});
	}

	// Open the file after the currently open file; if no such file exists open the first file of the folder
	async openNextFile(direction: Direction) : Promise<void> {
		const currentFolder = this.getCurrentFolder();
		const openFile = app.workspace.getActiveFile();

		// if we have no file, we're starting at the root and just grabbing the first file
		if (!openFile) {
			this.openFirstFile(currentFolder, direction);
		} else {
			const files = fileExplorerSort(currentFolder);
			let openNextFile = false;

			// set indices of for loop
			let i = (direction === Direction.Forward) ? 0 : files.length - 1;
			const stop = (direction === Direction.Forward) ? files.length : -1;
			const step = (direction === Direction.Forward) ? 1 : -1

			// loop forwards/backward, find the currently open file, and after finding it open next
			for (; i != stop; i += step) {

				const currentAbsrtFile = files[i];

				if (!openNextFile && currentAbsrtFile === openFile) {
					openNextFile = true;
				} else if (openNextFile) {
					app.workspace.activeLeaf.openFile(currentAbsrtFile);
					return;
				}
			}
		}

	}

	/*** Utils ***/

	// open the first file of the given folder, if the folder is not empty
	// if direction is set to backwards, will open the last file
	openFirstFile(folder : TFolder, direction: Direction = Direction.Forward) {
		const files = fileExplorerSort(folder);
		console.log(files);
		if (files.length > 0) {
			if (direction === Direction.Forward) {
				app.workspace.activeLeaf.openFile(files[0]);
			} else {
				app.workspace.activeLeaf.openFile(files[files.length - 1]);
			}
		} else {
			throw new Error("Empty folder");
		}
	}

	// return the parent folder of the active view, or, if such does not exist, the root folder
	getCurrentFolder() : TFolder {
		const activeView = app.workspace.getActiveFile();

		if (activeView) {
			return activeView.parent;
		} else {
			return app.vault.getRoot();
		}
	}
}

// filter out unsupported files and folders, then sort the remaining children of the passed folder
// according to the order they are displayed in the file explorer
function fileExplorerSort(folder: TFolder) : TFile[] {
	let files : TFile[] = [];

	if (folder.children) {
		files = removeUnsupportedFilesAndFolders(folder.children);
	} else {
		return files;
	}

	const collator = new Intl.Collator(navigator.languages[0] || navigator.language,
			{ numeric: true, ignorePunctuation: false, caseFirst: 'upper' });

	// reverse alphabetical is still sorted alphabetically by extension if basenames match
	const reverseCollator = new Intl.Collator(navigator.languages[0] || navigator.language,
			{ numeric: true, ignorePunctuation: false, caseFirst: 'lower' });

	// sort using localeSort(), but in alphabetical sort substrings go *before* the longer string
	files.sort((a: TFile, b: TFile) => {
		//@ts-ignore; reversed is not just a pure files.reverse()
		if (app.vault.config.fileSortOrder === 'alphabeticalReverse') {
			if (a.basename.startsWith(b.basename) && a.basename !== b.basename) {
				return -1;
			} else if (b.basename.startsWith(a.basename) && a.basename !== b.basename) {
				return 1;
			} else if (a.basename === b.basename) {
				return reverseCollator.compare(a.extension, b.extension);
			} else {
				return reverseCollator.compare(b.name, a.name);
			}
		} else { // alphabetical (and everything else for now) order
			if (a.basename.startsWith(b.basename) && a.basename !== b.basename) {
				return 1;
			} else if (b.basename.startsWith(a.basename) && a.basename !== b.basename) {
				return -1;
			} else {
				return collator.compare(a.name, b.name);
			}
		}
	});

	return files;
}

// Removes folders and unsupported file formats from the passed list of TAbstractFiles
// https://help.obsidian.md/Advanced+topics/Accepted+file+formats
function removeUnsupportedFilesAndFolders(filesAndFolders : TAbstractFile[]) : TFile[] {
	const extensionRegex = new RegExp(/^.*\.(md|jpg|png|jpg|jpeg|gif|bmp|svg|mp3|webm|wav|m4a|ogg|3gp|flac|mp4|webm|ogv|pdf)$/i);

	const checked_files : TFile[] = [];
	for (const file of filesAndFolders) {
		if (file instanceof TFile && extensionRegex.test(file.name)) {
			checked_files.push(file);
		}
	}

	return checked_files;
}