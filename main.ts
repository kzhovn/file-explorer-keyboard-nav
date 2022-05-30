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

		this.addCommand({
			id: 'file-explorer-go-up',
			name: 'Go to parent folder',
			callback: () => {
				this.goToParentFolder();
			}
		});

		this.addCommand({
			id: 'file-explorer-go-down',
			name: 'Go to first child folder',
			callback: () => {
				this.gotToChildFolder();
			}
		});
	}

	openNextFile(direction: Direction) : void {
		const activeView = this.app.workspace.getActiveFile(); //return TFile
		let lookingForFileToOpen = false;

		if (activeView) {
			const parentFolder = activeView.parent;

			// set indices of for loop
			let i = (direction === Direction.Forward) ? 0 : parentFolder.children.length;
			const stop = (direction === Direction.Forward) ? parentFolder.children.length : -1;
			const step = (direction === Direction.Forward) ? 1 : -1

			for (; i != stop; i += step) {
				const currentFile = parentFolder.children[i];

				if (!lookingForFileToOpen && currentFile === activeView) {
					lookingForFileToOpen = true;
				} else if (lookingForFileToOpen) {
					const nextAbstractFile = parentFolder.children[i];

					// open first *file*; if folder continue loop
					if (nextAbstractFile instanceof TFile) {
						app.workspace.activeLeaf.openFile(nextAbstractFile);
						return;
					}
				}
			}
		}
	}

	// open the first file of the folder containing the folder the current file is in, if the current file is not in root
	goToParentFolder() : void {
		const activeView = this.app.workspace.getActiveFile();

		if (activeView) {
			const parentFolder = activeView.parent;

			if (!parentFolder.isRoot()) {
				this.openFirstFile(parentFolder.parent);
			}
		}
	}

	// open first file of the first child folder of the folder the current file is in, if such exists
	gotToChildFolder(): void {
		const activeView = this.app.workspace.getActiveFile();

		if (activeView) {
			const parentFolder = activeView.parent;

			for (const child of parentFolder.children) {
				if (child instanceof TFolder) {
					this.openFirstFile(child);
					return;
				}
			}
		}

	}

	// open the first file of the given folder, if a file exists in the folder at all; else return false
	openFirstFile(folder : TFolder) : boolean {
		for (const child of folder.children) {
			console.log(folder)
			if (child instanceof TFile) {
				app.workspace.activeLeaf.openFile(child);
				return true;
			}
		}

		return false;
	}
}
