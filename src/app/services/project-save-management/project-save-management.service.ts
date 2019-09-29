import { Injectable } from '@angular/core';
import {Project} from '../../models/project';
import {HttpResponseData} from '../../models/http-responses/http-response-data';
import {OpenProjectResponse} from '../../models/http-responses/open-project-response';
import {catchError, map} from 'rxjs/operators';
import {ProjectModel} from '../../models/project-model';
import * as PIXI from 'pixi.js';
import {HttpClient} from '@angular/common/http';
import {ElementType} from '../../models/element-type';
import {Element} from '../../models/element';
import {ComponentInfoResponse} from '../../models/http-responses/component-info-response';
import {ProjectState} from '../../models/project-state';
import {ElementProviderService} from '../element-provider/element-provider.service';
import {UserService} from '../user/user.service';
import {Observable} from 'rxjs';
import {ErrorHandlingService} from '../error-handling/error-handling.service';
import {PopupService} from '../popup/popup.service';
import {SaveAsComponent} from '../../components/popup/popup-contents/save-as/save-as.component';

@Injectable({
	providedIn: 'root'
})
export class ProjectSaveManagementService {

	private _projectSource: 'server' | 'share' | 'file';

	constructor(
		private http: HttpClient,
		private elemProvService: ElementProviderService,
		private user: UserService,
		private errorHandling: ErrorHandlingService,
		private popup: PopupService
	) { }

	public async getProjectToOpenOnLoad(): Promise<Project> {
		let project;
		if (location.pathname.startsWith('/board')) {
			project = this.openProjectFromServer();
			this.elemProvService.setUserDefinedTypes(await this.getAllAvailableCustomElements());
		} else if (location.pathname.startsWith('/share')) {
			// open share
		} else {
			project = Promise.resolve(this.createEmptyProject());
			this.elemProvService.setUserDefinedTypes(await this.getAllAvailableCustomElements());
		}
		return project;
	}

	public get isShare(): boolean {
		return location.pathname.startsWith('/share/');
	}

	public async getAllAvailableCustomElements(): Promise<Map<number, ElementType>> {
		let elemMap = new Map<number, ElementType>();
		if (this.user.isLoggedIn) {
			elemMap = await this.getComponentsFromServer().toPromise();
		}
		return elemMap;
	}

	private getComponentsFromServer(): Observable<Map<number, ElementType>> {
		return this.http.get<HttpResponseData<ComponentInfoResponse[]>>('/api/project/get-all-components-info').pipe(
			map(data => {
				const newElemTypes = new Map<number, ElementType>();
				data.result.forEach(elem => {
					const elemType: ElementType = {
						description: elem.description,
						name: elem.name,
						rotation: 0,
						minInputs: 2,
						maxInputs: 2,
						symbol: elem.symbol,
						numInputs: 2,
						numOutputs: 1,
						category: 'user'
					};
					newElemTypes.set(Number(elem.pk_id), elemType);
				});
				return newElemTypes;
			}),
			this.errorHandling.catchErrorOperator('Cannot get Components from Server', new Map<number, ElementType>()),
		);
	}

	public async addComponent(name: string, symbol: string) {
		if (!name)
			name = 'New Component';

		const elementProvider = ElementProviderService.staticInstance;
		let duplicate = 0;

		while (Array.from(elementProvider.userDefinedElements.values())
			.map(x => x.name)
			.includes((duplicate === 0) ? name : `${name}-${duplicate}`)) {
			duplicate++;
		}
		name = (duplicate === 0) ? name : `${name}-${duplicate}`;

		let id;
		if (this.user.isLoggedIn) {
			id = await this.newComponentOnServer(name, symbol);
			if (!id) return;
		}

		elementProvider.addUserDefinedElement({
			description: '',
			name,
			rotation: 0,
			minInputs: 0,
			maxInputs: 0,
			symbol,
			numInputs: 0,
			numOutputs: 0,
			category: 'user'
		}, id);
	}

	public save(projects: Project[]) {
		if (!this._projectSource) {
			this.saveAs();
			return;
		}

		switch (this._projectSource) {
			case 'server':
				this.saveProjectsToServer(projects);
				break;
			case 'file':
				this.exportToFile(projects);
				break;
		}
	}

	public saveAs() {
		this.popup.showPopup(SaveAsComponent, 'Save Project', false);
	}

	public exportToFile(projects: Project[]) {
		// need function to get all needed projects to export
	}

	public openFromFile(): Project {
		this._projectSource = 'file';
		return this.createEmptyProject();
	}

	private saveProjectsToServer(projects: Project[]): Promise<any> {
		const allPromises = [];
		projects.forEach(proj => {
			if (proj.dirty) allPromises.push(this.saveSingleProject(proj));
			proj.dirty = false;
		});
		return Promise.all(allPromises);
	}

	private saveSingleProject(project: Project): Promise<HttpResponseData<{success: boolean}>> {
		return this.http.post<HttpResponseData<{success: boolean}>>(`/api/project/save/${project.id}`, {
			data: project.currState.model
		}).toPromise();
	}

	public openComponent(id: number): Promise<Project> {
		return this.http.get<HttpResponseData<OpenProjectResponse>>(`/api/project/open/${id}`).pipe(
			map(response => {
				if (Number(response.result.project.is_component) === 0) {
					throw Error('isProj');
				}
				const project = this.getProjectModelFromJson(response.result.project.data);
				return new Project(new ProjectState(project), {
					id: Number(id),
					name: response.result.project.name,
					type: 'comp'
				});
			}),
			this.errorHandling.catchErrorOperatorDynamicMessage((err: any) => {
				if (err.message === 'isProj') return 'Unable to open Project as Component';
				return err.error.error.description;
			}, undefined)
		).toPromise();
	}

	private newComponentOnServer(name: string, symbol: string, description: string = ''): Promise<number> {
		return this.http.post<HttpResponseData<{id: number}>>('/api/project/create', {
			name,
			isComponent: true,
			symbol,
			description
		}).pipe(
			map(response => response.result.id),
			this.errorHandling.catchErrorOperatorDynamicMessage(
				(err: any) => `Unable to create component: ${err.error.error.description}`,
				undefined
			)
		).toPromise();
	}

	private createEmptyProject(): Project {
		return new Project(new ProjectState(), {
			type: 'project',
			name: 'New Project',
			id: 0
		});
	}

	private openProjectFromServer(): Promise<Project> {
		const path = location.pathname;
		const id = Number(path.substr(path.lastIndexOf('/') + 1));
		if (Number.isNaN(id)) {
			return Promise.reject('Invalid Url');
		}
		this._projectSource = 'server';
		return this.http.get<HttpResponseData<OpenProjectResponse>>(`/api/project/open/${id}`).pipe(
			map(response => {
				if (Number(response.result.project.is_component) === 1) {
					throw Error('isComp');
				}
				const project = this.getProjectModelFromJson(response.result.project.data);
				return new Project(new ProjectState(project), {
					id: Number(id),
					name: response.result.project.name,
					type: 'project'
				});
			}),
			catchError(err => {
				delete this._projectSource;
				throw err;
			}),
			this.errorHandling.catchErrorOperatorDynamicMessage((err: any) => {
				if (err.message === 'isComp') return 'Unable to open Component as Project';
				return err.error.error.description;
			}, this.createEmptyProject())
		).toPromise();
	}

	private getProjectModelFromJson(data: any): ProjectModel {
		if (!data.hasOwnProperty('board')) {
			return {
				board: {
					elements: []
				}
			};
		}

		data.board.elements = data.board.elements.map(e => {
			const elem: Element = {
				id: e.id,
				typeId: e.typeId,
				numOutputs: e.numOutputs,
				numInputs: e.numInputs,
				pos: new PIXI.Point(e.pos.x, e.pos.y),
				endPos: new PIXI.Point(e.endPos.x, e.endPos.y),
				rotation: e.rotation
			};
			return elem;
		});
		return data;
	}
}
