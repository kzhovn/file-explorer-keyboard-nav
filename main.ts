import { Plugin, TFile, TFolder, TAbstractFile, WorkspaceLeaf } from 'obsidian';

const enum Direction {
	Forward,
	Backwards
}

export interface FileExplorerItem {
	file: TFile | TFolder;
	collapsed?: boolean;
	titleEl: Element;
	setCollapsed?: (state: boolean) => void;
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

		this.addCommand({
			id: 'file-explorer-next-folder',
			name: 'Go to next folder',
			callback: () => {
				this.nextFolder(Direction.Forward);
			}
		});

		this.addCommand({
			id: 'file-explorer-previous-folder',
			name: 'Go to previous folder',
			callback: () => {
				this.nextFolder(Direction.Backwards);
			}
		});
	}


	// Open the file after the currently open file; if no such file exists open the first file of the folder
	openNextFile(direction: Direction = Direction.Forward) : Promise<void> {
		const openFile = app.workspace.getActiveFile();

		// if we have no file, we're starting at the root and just grabbing the first file
		if (!openFile) {
			this.openFirstFile(app.vault.getRoot(), direction);
		} else {
			const currentFolder = this.getCurrentFolder();
			const files = fileExplorerSortFiles(currentFolder);
			let openNextFile = false;

			// set indices of for loop
			let i = (direction === Direction.Forward) ? 0 : files.length - 1;
			const stop = (direction === Direction.Forward) ? files.length : -1;
			const step = (direction === Direction.Forward) ? 1 : -1

			// loop forwards/backward, find the currently open file, and after finding it open next
			for (; i != stop; i += step) {

				if (!openNextFile && files[i] === openFile) {
					openNextFile = true;
				} else if (openNextFile) {
					app.workspace.activeLeaf.openFile(files[i]);
					this.scroll(files[i]);
					return;
				}
			}
		}
	}

	nextFolder(direction : Direction = Direction.Forward) {
		const openFolder = this.getCurrentFolder();

		// if we have no file, we're starting at the root and just grabbing the first file
		if (openFolder && !openFolder.isRoot()) {
			const parentFolder = openFolder.parent;
			const siblingFolders = fileExplorerSortFolders(parentFolder);
			let openNextFolder = false;

			// set indices of for loop
			let i = (direction === Direction.Forward) ? 0 : siblingFolders.length - 1;
			const stop = (direction === Direction.Forward) ? siblingFolders.length : -1;
			const step = (direction === Direction.Forward) ? 1 : -1

			// loop forwards/backward, find the currently open folder, and after finding it open first file of next
			for (; i != stop; i += step) {
				if (!openNextFolder && siblingFolders[i] === openFolder) {
					openNextFolder = true;
				} else if (openNextFolder && siblingFolders[i].children) { //only open if next folder has children
					this.openFirstFile(siblingFolders[i]);
					this.expandFolder(siblingFolders[i]);
					return;
				}
			}
		}
	}


	// open the first file of the given folder, if the folder is not empty
	// if direction is set to backwards, will open the last file
	openFirstFile(folder : TFolder, direction: Direction = Direction.Forward) {
		const files = fileExplorerSortFiles(folder);
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

	// return the parent folder of the active view, or, if such does not exist, null
	getCurrentFolder() : TFolder {
		const activeView = app.workspace.getActiveFile();

		if (activeView) {
			return activeView.parent;
		}
	}

	/** Stolen from https://github.com/OfficerHalf/obsidian-collapse-all/blob/61f3460b6416fbc9e1fce0fd0043981a84a79bcd/src/provider/file-explorer.ts#L84=
	 * Get all `fileItems` on explorer view. This property is not documented.*/
	getExplorerItems(leaf: WorkspaceLeaf): FileExplorerItem[] {
		return Object.values((leaf.view as any).fileItems) as FileExplorerItem[];
	}

	// Get the FileExplorerItem of the passed file or folder
	getFileExplorerItem(leaf: WorkspaceLeaf, abstrFile: TFolder | TFile): FileExplorerItem {
		const allItems = this.getExplorerItems(leaf);
		// This is a very naiive but cheap way to do this.
		return allItems.filter(item =>
				item.file.path === abstrFile.path
		)[0];
	}

	//uncollapse the given folder and scroll to it if needed
	expandFolder(folder : TFolder) {
		const leaf = app.workspace.getLeavesOfType('file-explorer').first();
		const folderItem = this.getFileExplorerItem(leaf, folder);
		console.log(folderItem);
		this.scroll(folderItem);

		if (folderItem.collapsed) {
			folderItem.setCollapsed(false);
		}
	}

	// scroll to given item in file explorer
	scroll(item : FileExplorerItem | TFile | TFolder) {
		if ((item instanceof TFile) || (item instanceof TFolder)) { //written as an or instead of not to make TS happy
			const leaf = app.workspace.getLeavesOfType('file-explorer').first();
			item = this.getFileExplorerItem(leaf, item);

		}

		//@ts-ignore ; doesn't know about scrollIntoViewIfNeeded()
		item.titleEl.scrollIntoViewIfNeeded({ behavior: "smooth", block: "nearest" });

	}
}

// filter out unsupported files and folders, then sort the remaining children of the passed folder
// according to the order they are displayed in the file explorer
function fileExplorerSortFiles(folder : TFolder) : TFile[] {
	const files = removeUnsupportedFilesAndFolders(folder);
	const collator = new Intl.Collator(navigator.languages[0] || navigator.language,
		{ numeric: true, ignorePunctuation: false, caseFirst: 'upper' });
	// reverse alphabetical is still sorted alphabetically by extension if basenames match
	const reverseCollator = new Intl.Collator(navigator.languages[0] || navigator.language,
		{ numeric: true, ignorePunctuation: false, caseFirst: 'lower' });

	//@ts-ignore
	const sortOrder: string = app.vault.config.fileSortOrder;

	// sort using localeSort(), but in alphabetical sort substrings go *before* the longer string
	files.sort((a: TFile , b: TFile ) => {

		if (sortOrder === 'alphabetical') {
			if (a.basename.startsWith(b.basename) && a.basename !== b.basename) {
				return 1;
			} else if (b.basename.startsWith(a.basename) && a.basename !== b.basename) {
				return -1;
			} else {
				return collator.compare(a.name, b.name);
			}
		} else if (sortOrder === 'alphabeticalReverse') {
			if (a.basename.startsWith(b.basename) && a.basename !== b.basename) {
				return -1;
			} else if (b.basename.startsWith(a.basename) && a.basename !== b.basename) {
				return 1;
			} else if (a.basename === b.basename) {
				return reverseCollator.compare(a.extension, b.extension);
			} else {
				return reverseCollator.compare(b.name, a.name);
			}
		} else if (sortOrder === 'byModifiedTime') {
			return b.stat.mtime - a.stat.mtime;
		} else if (sortOrder === 'byModifiedTimeReverse') {
			return a.stat.mtime - b.stat.mtime;
		} else if (sortOrder === 'byCreatedTime') {
			return b.stat.ctime - a.stat.ctime;
		} else if (sortOrder === 'byCreatedTimeReverse') {
			return a.stat.ctime - b.stat.ctime;
		} else {
			throw new Error("Unsupported sort order.")
		}

	});

	return files;
}

// sort folders in file explorer order
// note that regardless of the user-defined sort order these are always alphabetical
function fileExplorerSortFolders(folder : TFolder) : TFolder[] {
	const childFolders = removeFiles(folder);
	const collator = new Intl.Collator(navigator.languages[0] || navigator.language,
		{ numeric: true, ignorePunctuation: false, caseFirst: 'upper' });

	childFolders.sort((a: TFolder, b: TFolder) => {

		if (a.name.startsWith(b.name) && a.name !== b.name) {
			return 1;
		} else if (b.name.startsWith(a.name) && a.name !== b.name) {
			return -1;
		} else {
			return collator.compare(a.name, b.name);
		}
	});

	return childFolders;

}

// Removes folders and unsupported file formats from the passed folder, returns a list of files
// https://help.obsidian.md/Advanced+topics/Accepted+file+formats
function removeUnsupportedFilesAndFolders(folder : TFolder) : TFile[] {
	const extensionRegex = new RegExp(/^.*\.(md|jpg|png|jpg|jpeg|gif|bmp|svg|mp3|webm|wav|m4a|ogg|3gp|flac|mp4|webm|ogv|pdf|opus)$/i);
	const filesAndFolders = folder.children;

	const checked_files : TFile[] = [];
	for (const abstrFile of filesAndFolders) {
		if (abstrFile instanceof TFile && extensionRegex.test(abstrFile.name)) {
			checked_files.push(abstrFile);
		}
	}

	return checked_files;
}

// Removes all files from the passed folder, returns a list of folders
function removeFiles(folder : TFolder) : TFolder[] {
	const folders = [];

	for (const abstrFile of folder.children) {
		if (abstrFile instanceof TFolder) {
			folders.push(abstrFile);
		}
	}

	return folders;
}

