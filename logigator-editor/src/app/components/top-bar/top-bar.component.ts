import {Component, OnInit, Optional} from '@angular/core';
import {ProjectsService} from '../../services/projects/projects.service';
import {UserService} from '../../services/user/user.service';
import {Observable} from 'rxjs';
import {UserInfo} from '../../models/http-responses/user-info';
import { ElectronService } from 'ngx-electron';
// #!electron
// #!electron
import {InteractionAction} from '../../models/interaction-action';
import {checkActionUsable} from '../../models/action-usable-in-modes';


@Component({
	selector: 'app-top-bar',
	templateUrl: './top-bar.component.html',
	styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {

	public editDropdownOpen = false;
	public fileDropdownOpen = false;
	public viewDropdownOpen = false;
	public helpDropdownOpen = false;
	public settingsDropdownOpen = false;

	constructor(
		@Optional() private electronService: ElectronService,
		private projectService: ProjectsService,
		private userService: UserService
	) { }

	ngOnInit() {}

	public checkActionUsable(action: InteractionAction) {
		return checkActionUsable(action);
	}

	public get userInfo$(): Observable<UserInfo> {
		return this.userService.userInfo$;
	}

	public login() {
		// TODO: Login
	}

	public register() {
		// TODO: Register
	}

	// #!if ELECTRON === 'true'
	public minimize() {
		this.electronService.ipcRenderer.invoke('windowMinimize');
	}

	public maximizeWin() {
		this.electronService.ipcRenderer.invoke('windowMaximize');
	}

	public async close() {
		const canClose = await this.projectService.askToSave();
		if (canClose) {
			this.electronService.ipcRenderer.invoke('windowClose');
		}
	}
	// #!endif

	public get mainProjectName(): string {
		if (!this.projectService.mainProject) return '';
		return this.projectService.mainProject.name;
	}

	public dropdownHover(comp: keyof TopBarComponent) {
		if (this.editDropdownOpen || this.fileDropdownOpen || this.viewDropdownOpen || this.helpDropdownOpen) {
			this.closeDropdowns();
			// @ts-ignore
			this[comp] = true;
		}
	}

	public closeDropdowns() {
		this.editDropdownOpen = false;
		this.fileDropdownOpen = false;
		this.viewDropdownOpen = false;
		this.helpDropdownOpen = false;
		this.settingsDropdownOpen = false;
	}

	public get dropdownOpen(): boolean {
		return this.editDropdownOpen || this.fileDropdownOpen || this.viewDropdownOpen || this.helpDropdownOpen || this.settingsDropdownOpen;
	}

}
