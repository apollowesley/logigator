import {Component, OnInit} from '@angular/core';
import {WorkMode} from '../../models/work-modes';
import {WorkModeService} from '../../services/work-mode/work-mode.service';
import {ProjectsService} from '../../services/projects/projects.service';
import {ProjectInteractionService} from '../../services/project-interaction/project-interaction.service';
import {PopupService} from '../../services/popup/popup.service';
import {NewComponentComponent} from '../popup/popup-contents/new-component/new-component.component';
import {OpenProjectComponent} from '../popup/popup-contents/open/open-project.component';

@Component({
	selector: 'app-toolbar',
	templateUrl: './toolbar.component.html',
	styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

	constructor(
		private workModeService: WorkModeService,
		private projectService: ProjectsService,
		private projectInteraction: ProjectInteractionService,
		private popupService: PopupService
	) { }

	ngOnInit() {
	}

	public setWorkMode(mode: WorkMode) {
		this.workModeService.setWorkMode(mode);
	}

	public get currentWorkMode(): WorkMode {
		return this.workModeService.currentWorkMode;
	}

	public newComponent(): void {
		this.popupService.showPopup(NewComponentComponent, 'New Component', false);
	}

	public undo(): void {
		this.projectInteraction.redoForCurrent()
	}

	public redo(): void {
		this.projectInteraction.undoForCurrent();
	}

	public zoomIn() {
		this.projectInteraction.zoomIn();
	}

	public zoomOut() {
		this.projectInteraction.zoomOut();
	}

	public delete() {
		this.projectInteraction.deleteSelection();
	}

	public copy() {
		this.projectInteraction.copySelection();
	}

	public cut() {
		this.projectInteraction.cutSelection();
	}

	public paste() {
		this.projectInteraction.paste();
	}

	public save() {
		this.projectService.saveAll();
	}

	public open() {
		this.popupService.showPopup(OpenProjectComponent, 'Open Project', true);
	}
}
