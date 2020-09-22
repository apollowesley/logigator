import {Body, ContentType, Controller, Post, Req, Res, Session} from 'routing-controllers';
import {SetLanguage} from '../../models/request/frontend/preferences/set-language';
import {SetTheme} from '../../models/request/frontend/preferences/set-theme';
import {TranslationService} from '../../services/translation.service';
import {Referer} from '../../decorator/referer.decorator';
import {Request, Response} from 'express';

@Controller('/preferences')
export class PreferencesController {

	constructor(private translationService: TranslationService) {}

	@Post('/set-lang')
	public setLanguage(@Body() body: SetLanguage, @Session() sess: any, @Req() req: Request, @Res() res: Response, @Referer() ref: string) {
		sess.preferences.lang = body.lang;

		let redirectTarget = ref.replace(`${req.protocol}://${req.hostname}`, '');
		if (redirectTarget === '/') {
			redirectTarget += body.lang;
		} else if (this.translationService.availableLanguages.includes(redirectTarget.substr(1, 2)) && (redirectTarget.length === 3 || redirectTarget.charAt(3) === '/')) {
			redirectTarget = '/' + body.lang + redirectTarget.substring(3);
		}
		res.redirect(redirectTarget);
		return res;
	}

	@Post('/set-theme')
	@ContentType('application/json')
	public setTheme(@Body() body: SetTheme, @Session() session: any) {
		session.preferences.theme = body.theme;
		return {success: true};
	}

}
