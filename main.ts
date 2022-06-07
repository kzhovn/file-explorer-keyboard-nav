import { Plugin, TFile, TFolder } from 'obsidian';

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

		// this.addCommand({
		// 	id: 'file-explorer-go-up',
		// 	name: 'Go to parent folder',
		// 	callback: () => {
		// 		this.goToParentFolder();
		// 	}
		// });

		// this.addCommand({
		// 	id: 'file-explorer-go-down',
		// 	name: 'Go to first child folder',
		// 	callback: () => {
		// 		this.gotToChildFolder();
		// 	}
		// });

		// this.addCommand({
		// 	id: 'file-explorer-next-folder',
		// 	name: 'Go to next folder',
		// 	callback: () => {
		// 		this.nextFolder(Direction.Forward);
		// 	}
		// });

		// this.addCommand({
		// 	id: 'file-explorer-previous-folder',
		// 	name: 'Go to previous folder',
		// 	callback: () => {
		// 		this.nextFolder(Direction.Backwards);
		// 		this.revealFile
		// 	}
		// });
	}

	async openNextFile(direction: Direction) : Promise<void> {
		const currentFolder = this.getCurrentFolder();
		const openFile = app.workspace.getActiveFile();
		let openNextFile = false;

		// if we have no file, we're starting at the root and just grabbing the first/last file
		if (!openFile) {
			this.openFirstFile(currentFolder);
		} else {
			const files = fileExplorerSort(await this.getFiles(currentFolder));

			// set indices of for loop
			let i = (direction === Direction.Forward) ? 0 : files.length - 1;
			const stop = (direction === Direction.Forward) ? files.length : -1;
			const step = (direction === Direction.Forward) ? 1 : -1

			// loop forwards/backward, find the currently open file (unless we don't have an open file), and after finding it open next
			for (; i != stop; i += step) {

				const currentAbsrtFile = app.vault.getAbstractFileByPath(files[i]);

				if (!openNextFile && currentAbsrtFile === openFile) {
					openNextFile = true;
				} else if (openNextFile) {
					if (currentAbsrtFile instanceof TFile) { //should always be but we need the check
						app.workspace.activeLeaf.openFile(currentAbsrtFile);
						return;
					} else {
						throw new TypeError;
					}
				}
			}
		}

	}

	// // open the first file of the folder containing the folder the current file is in, if the current file is not in root
	// goToParentFolder() : void {
	// 	const currentFolder = this.getCurrentFolder();

	// 	if (!currentFolder.isRoot()) {
	// 		this.openFirstFile(currentFolder.parent);
	// 	} else if (!this.app.workspace.getActiveFile()) { //if a file in the root is open, stay where we are; if no file is open, jump to first file in root
	// 		this.openFirstFile(currentFolder);
	// 	}

	// }

	// // open first file of the first child folder of the folder the current file is in, if such exists
	// // if no current file, open the first child folder of the root
	// gotToChildFolder(): void {
	// 	const currentFolder = this.getCurrentFolder();

	// 	for (const child of currentFolder.children) {
	// 		if (child instanceof TFolder) {
	// 			this.openFirstFile(child);
	// 			return;
	// 		}
	// 	}
	// }

	// // go to the next sibling folder
	// nextFolder(direction: Direction): void {
	// 	const currentFolder = this.getCurrentFolder();

	// 	if (!currentFolder.isRoot()) {
	// 		const parentFolder = currentFolder.parent;
	// 		let openNextFolder = false;

	// 		// set indices of for loop
	// 		let i = (direction === Direction.Forward) ? 0 : parentFolder.children.length;
	// 		const stop = (direction === Direction.Forward) ? parentFolder.children.length : -1;
	// 		const step = (direction === Direction.Forward) ? 1 : -1

	// 		// loop forwards/backward, find the currently open folder and after finding it open the next folder
	// 		for (; i != stop; i += step) {
	// 			const currentAbsFile = parentFolder.children[i];

	// 			if (!openNextFolder && currentAbsFile === currentFolder) {
	// 				openNextFolder = true;
	// 			} else if (openNextFolder) {

	// 				// open first *file* in next folder
	// 				if (currentAbsFile instanceof TFolder) {
	// 					this.openFirstFile(currentAbsFile);
	// 					return;
	// 				}
	// 			}
	// 		}


	// 	}
	// }


	/*** Utils ***/

	// open the first file of the given folder, if a file exists in the folder at all
	openFirstFile(folder : TFolder) {
		for (const child of folder.children) {
			if (child instanceof TFile) {
				app.workspace.activeLeaf.openFile(child);
				return true;
			}
		}

		return false;
	}

	// return the paretn folder of the active view, or, if such does not exist, the root folder
	getCurrentFolder() : TFolder {
		const activeView = app.workspace.getActiveFile();

		if (activeView) {
			return activeView.parent;
		} else {
			return app.vault.getRoot();
		}
	}

	async getFiles(currentFolder : TFolder) : Promise<string[]> {
		const filesAndFolders = await app.vault.adapter.list(currentFolder.path);
		return filesAndFolders.files;
	}

	// revealFile() {
	// 	//@ts-ignore
	// 	this.app.commands.executeCommandById('file-explorer:reveal-active-file');
	// }

}

// https://fuzzytolerance.info/blog/2019/07/19/The-better-way-to-do-natural-sort-in-JavaScript/
function fileExplorerSort(files : string[]) : string[] {
	files = removeUnsupportedFiles(files);
	const collator = new Intl.Collator(navigator.languages[0] || navigator.language, { numeric: true, ignorePunctuation: false, caseFirst: 'upper' });
	const reverseCollator = new Intl.Collator(navigator.languages[0] || navigator.language, { numeric: true, ignorePunctuation: false, caseFirst: 'lower' });

	files.sort((a: string, b: string) => {
		const aWithoutExtension = removeFileExtension(a);
		const bWithoutExtension = removeFileExtension(b);

		//@ts-ignore; need to do this here because alphaReverse *does* keep the same uppercase first behavior
		if (app.vault.config.fileSortOrder === 'alphabeticalReverse') {
			//reversed, substrings go after their longer string
			if (aWithoutExtension.startsWith(bWithoutExtension) && aWithoutExtension !== bWithoutExtension) {
				return -1;
			} else if (bWithoutExtension.startsWith(aWithoutExtension) && aWithoutExtension !== bWithoutExtension) {
				return 1;
			} else if (aWithoutExtension === bWithoutExtension) {
				return reverseCollator.compare(a, b); //reversed order maintains order alphabetically by extension if basename is the same
			} else {
				return reverseCollator.compare(b, a);
			}
		} else {
			if (aWithoutExtension.startsWith(bWithoutExtension) && aWithoutExtension !== bWithoutExtension) {
				return 1;
			} else if (bWithoutExtension.startsWith(aWithoutExtension) && aWithoutExtension !== bWithoutExtension) {
				return -1;
			} else {
				return collator.compare(a, b);
			}
		}


	});

	return files;
}

function removeFileExtension(str : string) : string {
	const fileRegex = new RegExp(/(^.+)\.[0-9a-z]+$/);
	if (fileRegex.test(str)) {
		return str.match(fileRegex)[1];
	} else {
		return str;
	}
}

// https://help.obsidian.md/Advanced+topics/Accepted+file+formats
function removeUnsupportedFiles(files : string[]) : string[] {
	const extensionRegex = new RegExp(/^.*\.(md|jpg|png|jpg|jpeg|gif|bmp|svg|mp3|webm|wav|m4a|ogg|3gp|flac|mp4|webm|ogv|pdf)$/i);

	const checked_files : string[] = [];
	for (const file of files) {
		if (extensionRegex.test(file)) {
			checked_files.push(file);
		}
	}

	return checked_files;
}