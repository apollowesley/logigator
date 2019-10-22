import * as PIXI from 'pixi.js';
import {fromEvent, ReplaySubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ElementRef, EventEmitter, Output, Renderer2} from '@angular/core';
import {ThemingService} from '../../services/theming/theming.service';
import {RenderTicker} from './render-ticker';
import {ZoomPanInputManager} from './zoom-pan-input-manager';
import {View} from './view';
import {EditorView} from './editor-view';
import {ReqInspectElementEvent} from './req-inspect-element-event';
import {getStaticDI} from '../get-di';

export abstract class WorkArea {

	private static _loadedPixiFont = false;

	public static pixiFontLoaded$ = new ReplaySubject<void>(1);

	protected _pixiRenderer: PIXI.Renderer;

	protected _ticker = new RenderTicker();

	protected _zoomPanInputManager: ZoomPanInputManager;

	protected _destroySubject = new Subject<any>();

	protected _activeView: View;

	@Output()
	requestInspectElementInSim = new EventEmitter<ReqInspectElementEvent>();

	protected constructor() {
		this._ticker.setTickerFunction(() => {
			if (!this._activeView) return;
			this.updateZoomPan();
			this._pixiRenderer.render(this._activeView);
		});
	}

	protected initPixi(canvasContainer: ElementRef<HTMLDivElement>, renderer2: Renderer2) {
		this.loadPixiFont();
		this._pixiRenderer = new PIXI.Renderer({
			height: canvasContainer.nativeElement.offsetHeight,
			width: canvasContainer.nativeElement.offsetWidth,
			antialias: false,
			powerPreference: 'high-performance',
			backgroundColor: getStaticDI(ThemingService).getEditorColor('background'),
			resolution: Math.ceil(window.devicePixelRatio || 1),
			autoDensity: true
		});

		renderer2.appendChild(canvasContainer.nativeElement, this._pixiRenderer.view);

		fromEvent(window, 'resize').pipe(
			takeUntil(this._destroySubject)
		).subscribe(() => {
			this._pixiRenderer.resize(canvasContainer.nativeElement.offsetWidth, canvasContainer.nativeElement.offsetHeight);
			if (this._activeView) this._activeView.updateChunks();
			this._ticker.singleFrame();
		});
	}

	protected preventContextMenu(canvasContainer: ElementRef<HTMLDivElement>, renderer2: Renderer2) {
		renderer2.listen(canvasContainer.nativeElement, 'contextmenu', (e: MouseEvent) => {
			e.preventDefault();
		});
	}

	private loadPixiFont() {
		if (WorkArea._loadedPixiFont === true) return;
		WorkArea._loadedPixiFont = true;
		const loader = PIXI.Loader.shared;
		loader.add('Nunito', '/assets/Nunito_Bitmap/font.fnt')
			.load(() => WorkArea.pixiFontLoaded$.next());
	}

	protected initZoomPan(canvasContainer: ElementRef<HTMLDivElement>) {
		this._zoomPanInputManager = new ZoomPanInputManager(canvasContainer.nativeElement);
		this._zoomPanInputManager.interactionStart$.pipe(takeUntil(this._destroySubject)).subscribe(() => this._ticker.start());
		this._zoomPanInputManager.interactionEnd$.pipe(takeUntil(this._destroySubject)).subscribe(() => this._ticker.stop());
	}

	private updateZoomPan() {
		let needsChunkUpdate = false;
		if (this._zoomPanInputManager.isDragging) {
			this._activeView.zoomPan.translateBy(this._zoomPanInputManager.mouseDX, this._zoomPanInputManager.mouseDY);
			this._zoomPanInputManager.clearMouseDelta();
			needsChunkUpdate = true;
		}

		if (this._zoomPanInputManager.isZoomIn &&
			this._activeView.applyZoom('out', this._zoomPanInputManager.mouseX, this._zoomPanInputManager.mouseY)) {
				needsChunkUpdate = true;
				this.updateSelectedZoomScale();
		} else if (this._zoomPanInputManager.isZoomOut &&
			this._activeView.applyZoom('in', this._zoomPanInputManager.mouseX, this._zoomPanInputManager.mouseY)) {
				needsChunkUpdate = true;
				this.updateSelectedZoomScale();
		}

		if (needsChunkUpdate) {
			this._activeView.updateChunks();
		}
	}

	private updateSelectedZoomScale() {
		if (this._activeView.constructor.name === 'EditorView') {
			// @ts-ignore
			this._activeView.updateSelectedElementsScale();
			// @ts-ignore
			this._activeView.updatePastingElementsScale();
		}
	}

	protected destroy() {
		this._zoomPanInputManager.destroy();
		this._destroySubject.next();
		this._destroySubject.unsubscribe();
		if (this._activeView) {
			this._activeView.destroy();
		}
	}
}
