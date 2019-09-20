import {Component, ElementRef, Inject, NgZone, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {ThemingService} from './services/theming/theming.service';
import {SelectionService} from './services/selection/selection.service';
import {WorkModeService} from './services/work-mode/work-mode.service';
import {ShortcutsService} from './services/shortcuts/shortcuts.service';
import {fromEvent, Subject} from 'rxjs';
import {DOCUMENT} from '@angular/common';
import {takeUntil} from 'rxjs/operators';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

	@ViewChild('appRoot', {static: true})
	private appRoot: ElementRef<HTMLDivElement>;

	private _destroySubject = new Subject<void>();

	constructor(
		private renderer2: Renderer2,
		private ngZone: NgZone,
		private theming: ThemingService,
		private workMode: WorkModeService,
		private selection: SelectionService,
		private shortcuts: ShortcutsService,
		@Inject(DOCUMENT) private document: HTMLDocument
	) {}

	ngOnInit(): void {
		this.renderer2.addClass(this.appRoot.nativeElement, this.theming.themeClass);
		this.listenToShortcuts();

		this.theming.onRequestFullscreen$.pipe(
			takeUntil(this._destroySubject)
		).subscribe(_ => this.onRequestFullscreen());
	}

	private listenToShortcuts() {
		fromEvent(this.document, 'keydown').pipe(
			takeUntil(this._destroySubject)
		).subscribe((e: KeyboardEvent) => {
			this.shortcuts.keyDownListener(e);
		});
	}

	public get isSimulationMode(): boolean {
		return this.workMode.currentWorkMode === 'simulation';
	}

	public get showSettingsInfoBox(): boolean {
		return this.workMode.currentWorkMode === 'buildComponent' || this.selection.isSingleSelect();
	}

	public get selectionMode(): 'type' | 'placed' {
		if (this.workMode.currentWorkMode === 'buildComponent') {
			return 'type';
		}
		return 'placed';
	}

	public get selectedCompTypeId(): number {
		return this.workMode.currentComponentToBuild;
	}

	public get selectedCompId(): number {
		if (!this.selection.selectedIds()) {
			return null;
		}
		return this.selection.selectedIds()[0];
	}

	private onRequestFullscreen() {
		const elem = this.appRoot.nativeElement as any;
		if (elem.requestFullscreen) {
			elem.requestFullscreen();
		} else if (elem.mozRequestFullScreen) { /* Firefox */
			elem.mozRequestFullScreen();
		} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
			elem.webkitRequestFullscreen();
		} else if (elem.msRequestFullscreen) { /* IE/Edge */
			elem.msRequestFullscreen();
		}
	}

	ngOnDestroy(): void {
		this._destroySubject.next();
		this._destroySubject.unsubscribe();
	}
}
