import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReloadQuestionComponent } from './reload-question.component';

describe('RelaodQuestionComponent', () => {
	let component: ReloadQuestionComponent;
	let fixture: ComponentFixture<ReloadQuestionComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ ReloadQuestionComponent ]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ReloadQuestionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
