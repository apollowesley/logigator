import {ExpressMiddlewareInterface, Middleware} from 'routing-controllers';
import {Request, Response} from 'express';
import {TranslationService} from '../services/translation.service';

@Middleware({type: 'before'})
export class GlobalViewDataMiddleware implements ExpressMiddlewareInterface {

	constructor(private translationService: TranslationService) {}

	use(request: Request, response: Response, next: (err?: any) => any): any {
		response.locals.i18n = this.translationService.getTranslations(request.session.preferences.lang);
		response.locals.currentPagePath = request.path;
		next();
	}

}