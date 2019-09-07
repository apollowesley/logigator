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
	private _gridGraphics: PIXI.Graphics[][] = [];

	private _allElements: Map<number, ElementSprite> = new Map();

	private _chunksToRender: {x: number, y: number}[] = [];

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
		const currentlyOnScreen = this._zoomPan.isOnScreen(this._htmlContainer.offsetHeight, this._htmlContainer.offsetWidth);
		const chunksToRender = Project.chunksToRender(
			Grid.getGridPosForPixelPos(currentlyOnScreen.start),
			Grid.getGridPosForPixelPos(currentlyOnScreen.end)
		);
		chunksToRender.forEach(chunk => {
			if (this.createChunk(chunk.x, chunk.y)) {
				this._chunks[chunk.x][chunk.y].position = Grid.getPixelPosForGridPos(
					new PIXI.Point(chunk.x * environment.chunkSize, chunk.y * environment.chunkSize)
				);
				this.addChild(this._chunks[chunk.x][chunk.y]);
				this._chunks[chunk.x][chunk.y].addChild(this._gridGraphics[chunk.x][chunk.y]);
			} else {
				this._gridGraphics[chunk.x][chunk.y].destroy();
				this._gridGraphics[chunk.x][chunk.y] = Grid.generateGridGraphics(this._zoomPan.currentScale);
				this._chunks[chunk.x][chunk.y].addChild(this._gridGraphics[chunk.x][chunk.y]);
				this._chunks[chunk.x][chunk.y].visible = true;
			}
		});
		for (const oldChunk of this._chunksToRender) {
			if (!chunksToRender.find(toRender => toRender.x === oldChunk.x && toRender.y === oldChunk.y)) {
				this._chunks[oldChunk.x][oldChunk.y].visible = false;
			}
		}
		this._chunksToRender = chunksToRender;
	}

	private createChunk(x: number, y: number): boolean {
		if (this._chunks[x] && this._chunks[x][y])
			return false;
		for (let i = 0; i <= x; i++)
			if (!this._chunks[i]) {
				this._chunks[i] = [];
				this._gridGraphics[i] = [];
			}
		for (let i = 0; i <= y; i++)
			if (!this._chunks[x][y] && this._chunks[x][y] !== undefined) {
				this._gridGraphics[x].push(undefined);
				this._chunks[x].push(undefined);
			}
		this._gridGraphics[x][y] = Grid.generateGridGraphics(this._zoomPan.currentScale);
		this._chunks[x][y] = new PIXI.Container();
		const text = new PIXI.Text(x  + ' ' + y);
		text.x = 20 * 10;
		text.y = 20 * 10;
		this._chunks[x][y].addChild(text);
		return true;
	}

	public updateZoomPan() {
		let needsChunkUpdate = false;
		if (this._zoomPanInputManager.isDragging) {
			this._zoomPan.translateBy(this._zoomPanInputManager.mouseDX, this._zoomPanInputManager.mouseDY);
			this._zoomPanInputManager.clearMouseDelta();
			needsChunkUpdate = true;
		}

		if (this._zoomPanInputManager.isZoomIn) {
			needsChunkUpdate = this._zoomPan.zoomBy(0.75, this._zoomPanInputManager.mouseX, this._zoomPanInputManager.mouseY) || needsChunkUpdate;
		} else if (this._zoomPanInputManager.isZoomOut) {
			needsChunkUpdate = this._zoomPan.zoomBy(1.25, this._zoomPanInputManager.mouseX, this._zoomPanInputManager.mouseY) || needsChunkUpdate;
		}

		if (needsChunkUpdate) {
			this.updateChunks();
		}
	}

	public placeComponent(position: PIXI.Point, elementTypeId: number) {
		const elemType = this._elementProviderService.getComponentById(elementTypeId);
		if (!elemType.texture) {
			this._elementProviderService.generateTextureForElement(elementTypeId);
		}
		const sprite = new PIXI.Sprite(elemType.texture);
		sprite.position = Grid.getLocalChunkPixelPosForGridPos(position);

		this._chunks[Project.gridPosToChunk(position.x)][Project.gridPosToChunk(position.y)].addChild(sprite);

		const element = this._projectsService.allProjects.get(this.projectId).addElement(elementTypeId, position);

		const elemSprite = {element, sprite};
		this._allElements.set(element.id, elemSprite);

		this._viewInteractionManager.addEventListenersToNewElement(elemSprite);
	}

	public get projectId(): number {
		return this._projectId;
	}

	public destroy() {
		this._zoomPanInputManager.destroy();
		super.destroy({
			children: true
		});
	}

}
