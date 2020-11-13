import {Component, ElementRef, NgZone, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {EditorView} from '../../models/rendering/editor-view';
import {ProjectsService} from '../../services/projects/projects.service';
import {Project} from '../../models/project';
import {WorkArea} from '../../models/rendering/work-area';
import {takeUntil} from 'rxjs/operators';
import {WorkModeService} from '../../services/work-mode/work-mode.service';
import {SimulationView} from '../../models/rendering/simulation-view';
import {View} from '../../models/rendering/view';
import {WorkMode} from '../../models/work-modes';
import {EditorInteractionService} from '../../services/editor-interaction/editor-interaction.service';
import {EditorAction} from '../../models/editor-action';
import {ElementProviderService} from '../../services/element-provider/element-provider.service';
import {fromEvent} from 'rxjs';

@Component({
	selector: 'app-work-area',
	templateUrl: './work-area.component.html',
	styleUrls: ['./work-area.component.scss']
})
export class WorkAreaComponent extends WorkArea implements OnInit, OnDestroy {

	private _allViews: Map<number, EditorView>;
	private currentlyDragging: Project;
	private children: {
		element: HTMLElement,
		pos: number
	}[];
	private dragStart: number;
	private dragElement: HTMLDivElement;

	@ViewChild('pixiCanvasContainer', {static: true})
	private _pixiCanvasContainer: ElementRef<HTMLDivElement>;

	@ViewChild('tabs', {static: true})
	private _tabsElement: ElementRef<HTMLDivElement>;

	constructor(
		private renderer2: Renderer2,
		private ngZone: NgZone,
		private projectsService: ProjectsService,
		private workMode: WorkModeService,
		private editorInteraction: EditorInteractionService,
		private elementProvider: ElementProviderService
	) {
		super();
	}

	ngOnInit() {
		this._allViews = new Map<number, EditorView>();

		this.ngZone.runOutsideAngular(() => {
			this.addTickerFunction();
			this.preventContextMenu(this._pixiCanvasContainer, this.renderer2);
			this.initZoomPan(this._pixiCanvasContainer);
			this.initPixi(this._pixiCanvasContainer, this.renderer2);

			this.projectsService.onProjectOpened$.pipe(
				takeUntil(this._destroySubject)
			).subscribe(projectId => this.onProjectOpen(projectId));

			this.projectsService.onProjectClosed$.pipe(
				takeUntil(this._destroySubject)
			).subscribe(id => this.onProjectClose(id));

			this.projectsService.onProjectSwitch$.pipe(
				takeUntil(this._destroySubject)
			).subscribe(id => this.onProjectSwitch(id));

			this.editorInteraction.subscribeEditorAction(EditorAction.ZOOM_IN, EditorAction.ZOOM_OUT, EditorAction.ZOOM_100).pipe(
				takeUntil(this._destroySubject)
			).subscribe(action => this.activeView.onZoom(action));

			fromEvent(window, 'mouseup').pipe(
				takeUntil(this._destroySubject)
			).subscribe(() => this.mouseUp());

			fromEvent(window, 'mousemove').pipe(
				takeUntil(this._destroySubject)
			).subscribe((e: MouseEvent) => this.mouseMove(e));

			this.workMode.isSimulationMode$.subscribe(isSim => this.onSimulationModeChanged(isSim));
		});
	}

	getIdentifier(): string {
		return '0';
	}

	mouseDown(project: Project, event: MouseEvent, tab: HTMLDivElement) {
		this.currentlyDragging = project;
		this.dragStart = event.clientX;
		this.dragElement = tab;
		this.dragElement.style.transitionDuration = '0s';
		this.children = [];
		for (const child of this._tabsElement.nativeElement.children as unknown as HTMLElement[]) {
			if (child === this.dragElement)
				continue;
			this.children.push({
				element: child,
				pos: child.offsetLeft
			});
		}
		this.switchToProject(project.id);
	}

	mouseMove(e: MouseEvent) {
		if (this.currentlyDragging) {
			const offset = e.clientX - this.dragStart;
			this.dragElement.style.left = offset + 'px';

			if (this.dragElement.offsetLeft < 0) {
				this.dragElement.style.left = (offset - this.dragElement.offsetLeft) + 'px';
			} else if (this.dragElement.offsetLeft + this.dragElement.offsetWidth > this._tabsElement.nativeElement.offsetWidth) {
				this.dragElement.style.left =
					(offset - (this.dragElement.offsetLeft + this.dragElement.offsetWidth - this._tabsElement.nativeElement.offsetWidth)) + 'px';
			}

			for (const child of this.children) {
				if (child.pos + child.element.offsetWidth / 2 <= this.dragElement.offsetLeft - offset
					&& child.pos + child.element.offsetWidth / 2 > this.dragElement.offsetLeft) {
					child.element.style.left = this.dragElement.offsetWidth + 8 + 'px';
				} else if (child.pos - child.element.offsetWidth / 2 >= this.dragElement.offsetLeft - offset
					&& child.pos - child.element.offsetWidth / 2 < this.dragElement.offsetLeft) {
					child.element.style.left = -this.dragElement.offsetWidth - 8 + 'px';
				} else {
					child.element.style.left = '0px';
				}
			}
		}
	}

	mouseUp() {
		if (this.currentlyDragging) {
			this.dragElement.style.transitionDuration = '';

			this.currentlyDragging = undefined;
			for (const child of Array.prototype.slice.call(this._tabsElement.nativeElement.children)
				.sort((x: HTMLElement, y: HTMLElement) => x.offsetLeft - y.offsetLeft) as HTMLElement[]) {
				this._tabsElement.nativeElement.removeChild(child);
				child.style.left = '0px';
				this._tabsElement.nativeElement.appendChild(child);
			}
			this.currentlyDragging = undefined;
		}
	}

	public get allProjects(): Project[] {
		return this.projectsService.allProjects;
	}

	public get isSimulationMode(): boolean {
		return this.workMode.currentWorkMode === WorkMode.SIMULATION;
	}

	public get activeView(): View {
		return this._activeView;
	}

	private onSimulationModeChanged(simulation: boolean) {
		if (simulation) {
			this.projectsService.allProjects.forEach(proj => {
				if (proj.type === 'project') {
					this._activeView = new SimulationView(
						proj,
						this._pixiCanvasContainer.nativeElement,
						() => this.ticker.singleFrame('0'),
						this.requestInspectElementInSim,
						'0',
						[],
						[],
						this._activeView.zoomPan.zoomPanData
					);
					this.ticker.singleFrame('0');
				}
			});
		} else {
			if (!this._activeView) return;
			const editorView = this._allViews.get(this._activeView.project.id);
			editorView.zoomPan.setZoomPanData(this._activeView.zoomPan.zoomPanData);
			editorView.updateChunks();
			this._activeView.destroy();
			delete this._activeView;
			// @ts-ignore
			this._pixiRenderer._lastObjectRendered = null;
			this.switchToProject(this.allProjects[0].id);
		}
		if (this._pixiRenderer) {
			this._pixiRenderer.resize(this._pixiCanvasContainer.nativeElement.offsetWidth, this._pixiCanvasContainer.nativeElement.offsetHeight);
		}
	}

	private onProjectOpen(projectId: number) {
		const newView = new EditorView(
			this.projectsService.getProjectById(projectId),
			this._pixiCanvasContainer.nativeElement,
			() => this.ticker.singleFrame('0')
		);
		this.ngZone.run(() => {
			this._allViews.set(projectId, newView);
			this._activeView = newView;
			this.projectsService.switchToProject(projectId);
		});
		this.ticker.singleFrame('0');
	}

	public switchToProject(toSwitchToId: number) {
		if (this.workMode.currentWorkMode === WorkMode.SIMULATION) return;
		this.projectsService.switchToProject(toSwitchToId);
	}

	private onProjectSwitch(id: number) {
		this._activeView = this._allViews.get(id);
		if ((this.activeView.project.type === 'project' && this.elementProvider.isPlugElement(this.workMode.currentComponentToBuild)) ||
			this.activeView.project.id === this.workMode.currentComponentToBuild
		) {
			this.workMode.setWorkMode(WorkMode.SELECT);
		}
		this.ticker.singleFrame('0');
	}

	public tabCloseClicked(id: number, event: MouseEvent) {
		event.stopPropagation();
		if (this._allViews.size <= 1) return;
		this.projectsService.closeProject(id);
	}

	public onProjectClose(id: number) {
		const toClose = this._allViews.get(id);
		this._allViews.delete(id);
		if (toClose === this._activeView) {
			this.switchToProject(this.allProjects[0].id);
		}
		toClose.destroy();
		// @ts-ignore
		this._pixiRenderer._lastObjectRendered = null;
	}

	ngOnDestroy(): void {
		super.destroy();
	}

}
