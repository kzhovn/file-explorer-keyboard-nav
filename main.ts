import { Plugin, TFile } from 'obsidian';


export default class FileExplorerKeyboardNav extends Plugin {

	async onload() {

		this.addCommand({
			id: 'file-explorer-next-file',
			name: 'Go to next file',
			callback: () => {
				this.openNextFile();
			}
		});

		this.addCommand({
			id: 'file-explorer-previous-file',
			name: 'Go to previous file',
			callback: () => {
				this.openPreviousFile();
			}
		});
	}

	openNextFile() : void {
		const activeView = this.app.workspace.getActiveFile(); //return TFile
		if (activeView) {
			const parentFolder = activeView.parent;

			for (let i = 0; i < parentFolder.children.length - 1; i++) {
				const currentFile = parentFolder.children[i];
				console.log(currentFile);
				if (currentFile instanceof TFile && currentFile === activeView) {
					const nextFile = parentFolder.children[i + 1];
					if (nextFile instanceof TFile) {
						app.workspace.activeLeaf.openFile(nextFile);
						return;
					}
				}
			}
		}
	}

	openPreviousFile(): void {
		const activeView = this.app.workspace.getActiveFile(); //return TFile
		if (activeView) {
			const parentFolder = activeView.parent;

			for (let i = parentFolder.children.length - 1; i > 0; i--) {
				const currentFile = parentFolder.children[i];
				console.log(currentFile);
				if (currentFile instanceof TFile && currentFile === activeView) {
					const previousFile = parentFolder.children[i - 1];
					if (previousFile instanceof TFile) {
						app.workspace.activeLeaf.openFile(previousFile);
						return;
					}
				}
			}
		}
	}




	onunload() {

	}
}
