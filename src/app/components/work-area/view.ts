import * as PIXI from 'pixi.js';
import {ZoomPanInputManager} from './zoom-pan-input-manager';
import {ZoomPan} from './zoom-pan';
import {Grid} from './grid';
import {ElementSprite} from '../../models/element-sprite';
import {ProjectsService} from '../../services/projects/projects.service';
import {ElementProviderService} from '../../services/component-provider/element-provider.service';
import {WorkModeService} from '../../services/work-mode/work-mode.service';
import {Element} from '../../models/element';
import {ViewInteractionManager} from './view-interaction-manager';
import {Project} from '../../models/project';
import {environment} from '../../../environments/environment';

export class View extends PIXI.Container {

	private readonly _projectId: number;

	private _zoomPan: ZoomPan;

	private _zoomPanInputManager: ZoomPanInputManager;

	private _viewInteractionManager: ViewInteractionManager;

	private readonly _htmlContainer: HTMLElement;

	private readonly _projectsService: ProjectsService;

	private readonly _elementProviderService: ElementProviderService;

	public readonly workModeService: WorkModeService;

	private _chunks: PIXI.Container[][] = [];

	private _allElements: Map<number, ElementSprite> = new Map();

	private _chunksToRender: {x: number, y: number}[];

	constructor(
		projectId: number,
		htmlContainer: HTMLElement,
		projectsService: ProjectsService,
		compProviderService: ElementProviderService,
		workModeService: WorkModeService
	) {
		super();
		this._projectId = projectId;
		this._htmlContainer = htmlContainer;
		this._projectsService = projectsService;
		this._elementProviderService = compProviderService;
		this.workModeService = workModeService;
		this.interactive = true;

		this._zoomPan = new ZoomPan(this);
		this._zoomPanInputManager = new ZoomPanInputManager(this._htmlContainer);
		this._viewInteractionManager = new ViewInteractionManager(this);

		this.updateChunks();

	}

	public static createEmptyView(
		projectId: number,
		htmlContainer: HTMLElement,
		projectsService: ProjectsService,
		compProviderService: ElementProviderService,
		workModeService: WorkModeService
	): View {
		return new View(projectId, htmlContainer, projectsService, compProviderService, workModeService);
	}

	private updateChunks() {
		let currentlyOnScreen = this._zoomPan.isOnScreen(this._htmlContainer.offsetHeight, this._htmlContainer.offsetWidth);
		currentlyOnScreen = {
			start: Grid.getGridPosForPixelPos(currentlyOnScreen.start),
			end: Grid.getGridPosForPixelPos(currentlyOnScreen.end)
		};
		this._chunksToRender = Project.chunksToRender(currentlyOnScreen.start, currentlyOnScreen.end);
		this._chunksToRender.forEach(chunk => {
			if (this.createChunk(chunk.x, chunk.y)) {
				this._chunks[chunk.x][chunk.y].position = Grid.getPixelPosForGridPos(new PIXI.Point(chunk.x * environment.chunkSize, chunk.y * environment.chunkSize));
				this.addChild(this._chunks[chunk.x][chunk.y]);
				this._chunks[chunk.x][chunk.y].addChild(Grid.generateGridGraphics(this._zoomPan.currentScale));
			}
		});
		// TODO: show / hide chunks
	}

	private createChunk(x: number, y: number): boolean {
		if (this._chunks[x] && this._chunks[x][y])
			return false;
		for (let i = 0; i <= x; i++)
			if (!this._chunks[i])
				this._chunks[i] = [];
		for (let i = 0; i <= y; i++)
			if (!this._chunks[x][y] && this._chunks[x][y] !== undefined)
				this._chunks[x].push(undefined);
		this._chunks[x][y] = new PIXI.Container();
		return true;
	}

	public updateZoomPan() {
		let needsChunkUpdate = false;
		let needsGridGraphicsUpdate = false;
		if (this._zoomPanInputManager.isDragging) {
			needsChunkUpdate = this._zoomPan.translateBy(this._zoomPanInputManager.mouseDX, this._zoomPanInputManager.mouseDY) || needsChunkUpdate;
			this._zoomPanInputManager.clearMouseDelta();
		}

		if (this._zoomPanInputManager.isZoomIn) {
			needsGridGraphicsUpdate = this._zoomPan.zoomBy(0.75, this._zoomPanInputManager.mouseX, this._zoomPanInputManager.mouseY);
			needsChunkUpdate = needsGridGraphicsUpdate || needsGridGraphicsUpdate;
		} else if (this._zoomPanInputManager.isZoomOut) {
			needsGridGraphicsUpdate = this._zoomPan.zoomBy(1.25, this._zoomPanInputManager.mouseX, this._zoomPanInputManager.mouseY);
			needsChunkUpdate = needsGridGraphicsUpdate || needsGridGraphicsUpdate;
		}

		if (needsChunkUpdate) {
			this.updateChunks();
			if (needsGridGraphicsUpdate) {
				this.updateGridGraphics();
			}
		}
	}

	private updateGridGraphics() {
		this._chunksToRender.forEach(chunk => {
			this._chunks[chunk.x][chunk.y].children.find(child => child.name === 'grid').destroy();
			const grid = Grid.generateGridGraphics(this._zoomPan.currentScale);
			this._chunks[chunk.x][chunk.y].addChild(grid);
		});
	}

	public placeComponent(point: PIXI.Point, elementTypeId: number) {
		const elemType = this._elementProviderService.getComponentById(elementTypeId);
		if (!elemType.texture) {
			this._elementProviderService.generateTextureForElement(elementTypeId);
		}
		const sprite = new PIXI.Sprite(elemType.texture);
		// TODO: notify projectsService, ask for chunk + calculate pos on chunk

		sprite.position = Grid.getPixelPosForGridPos(point);
		this.addChild(sprite);

		const elem = this.addComponentTest(this.workModeService.currentComponentToBuild, point);
		const elemSprite = {component: elem, sprite};
		this._allElements.set(elem.id, elemSprite);

		this._viewInteractionManager.addEventListenersToNewElement(elemSprite);
	}

	public get projectId(): number {
		return this._projectId;
	}

	// just for testing, until project-service works
	private id = 0;
	private addComponentTest(type: number, pos: PIXI.Point): Element {
		return {
			id: ++this.id,
			typeId: type,
			pos,
			outputs: [],
			inputs: []
		};
	}

	public destroy() {
		this._zoomPanInputManager.destroy();
		super.destroy({
			children: true
		});
	}

}
