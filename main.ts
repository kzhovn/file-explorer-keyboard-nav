import { Plugin, TFile } from 'obsidian';

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
}
