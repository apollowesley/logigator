import { TestBed } from '@angular/core/testing';

import { PopupService } from './popup.service';

describe('PopupService', () => {
	beforeEach(() => TestBed.configureTestingModule({}));

	it('should be created', () => {
		const service: PopupService = TestBed.inject(PopupService);
		expect(service).toBeTruthy();
	});
});
