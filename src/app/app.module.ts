import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SettingsInfoBoxComponent } from './components/settings-info-box/settings-info-box.component';
import { ConstructionBoxComponent } from './components/contruction-box/construction-box.component';
import { AllWorkAreasComponent } from './components/work-area/all-work-areas/all-work-areas.component';
import { WorkAreaComponent } from './components/work-area/work-area/work-area.component';
import {FormsModule} from '@angular/forms';

@NgModule({
	declarations: [
		AppComponent,
		ToolbarComponent,
		SettingsInfoBoxComponent,
		ConstructionBoxComponent,
		AllWorkAreasComponent,
		WorkAreaComponent
	],
	imports: [
		BrowserModule,
		FormsModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
