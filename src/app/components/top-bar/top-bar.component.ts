import { Component, OnInit } from '@angular/core';
import {ProjectsService} from '../../services/projects/projects.service';

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

	constructor(private projectService: ProjectsService) { }

	ngOnInit() {
	}

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
