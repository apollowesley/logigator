import { ipcMain, BrowserWindow, Event, session } from 'electron';
import fetch from 'node-fetch';
import {getApiUrl, getCookieDomain} from './utils';
import {Storage} from './storage';
import {AuthUrlResponse} from './models/AuthUrlResponse';

export class AuthenticationHandler {

	private _mainWindow: BrowserWindow;
	private _authCookie: string;
	private _cookieValidUntilUntil: Date;

	constructor() {
	}

	public initLoginListeners(mainWindow: BrowserWindow) {
		this._mainWindow = mainWindow;
		ipcMain.on('logingoogle', () => this.onGoogleLogin());
		ipcMain.on('logintwitter', () => this.onTwitterLogin());
		ipcMain.on('loginemail', (event, args) => this.onEmailLogin(args));
		ipcMain.on('logout', () => this.onLogout());
	}

	public readSavedLoginState() {
		if (!Storage.has('authCookie') || !Storage.has('cookieValidUntilUntil')) return;

		this._authCookie = Storage.get('authCookie');
		this._cookieValidUntilUntil = new Date(Storage.get('cookieValidUntilUntil'));

		if (this._cookieValidUntilUntil.getTime() <= Date.now()) {
			Storage.remove('authCookie');
			Storage.remove('cookieValidUntilUntil');
			delete this._cookieValidUntilUntil;
			delete this._authCookie;
		} else {
			session.defaultSession.cookies.set({
				url: getCookieDomain(),
				name: 'isLoggedIn',
				value: 'true',
			});
		}
	}

	public async setLoggedIn(cookie: string) {
		await session.defaultSession.cookies.set({
			url: getCookieDomain(),
			name: 'isLoggedIn',
			value: 'true',
		});
		this._authCookie = cookie;
		const expires = cookie.substring(cookie.indexOf('expires=') + 8);
		this._cookieValidUntilUntil = new Date(expires.substring(0, expires.indexOf('; ')));
		Storage.set('authCookie', this._authCookie);
		Storage.set('cookieValidUntilUntil', this._cookieValidUntilUntil.toISOString());
	}

	public get cookies(): string {
		return this._authCookie || '';
	}

	private async onGoogleLogin() {
		let win: BrowserWindow;
		try {
			const url = await this.getSocialLoginUrl('google');
			win = this.openSocialLoginPopupWindow(url);
			win.webContents.on('will-redirect', async (event: Event, redirectUrl: string) => {
				if (!redirectUrl.includes('accounts.google.com')) {
					const query = new URLSearchParams(new URL(redirectUrl).search);
					this.verifyGoogleCredentials(query.get('code'));
					win.close();
				}
			});
		} catch (e) {
			win.close();
			this.sendLoginResponse(false, 'google');
		}
	}

	private async onTwitterLogin() {
		try {
			const url = await this.getSocialLoginUrl('twitter');
			const win = this.openSocialLoginPopupWindow(url);
			win.webContents.on('will-redirect', async (event, redirectUrl: string) => {
				if (!redirectUrl.includes('api.twitter.com')) {
					const query = new URLSearchParams(new URL(redirectUrl).search);
					this.verifyTwitterCredentials(query.get('oauth_token'), query.get('oauth_verifier'));
					win.close();
				}
			});
		} catch (e) {
			this.sendLoginResponse(false, 'twitter');
		}
	}

	private async onEmailLogin(args: {email: string, password: string}) {
	}

	private onLogout() {
		delete this._authCookie;
		delete this._cookieValidUntilUntil;

		session.defaultSession.cookies.remove(getCookieDomain(), 'isLoggedIn');

		if (!Storage.has('authCookie') || !Storage.has('cookieValidUntilUntil')) return;
		Storage.remove('authCookie');
		Storage.remove('cookieValidUntilUntil');
	}

	private async getSocialLoginUrl(type: 'google' | 'twitter'): Promise<string> {
		const resp = await fetch(getApiUrl() + `/auth/${type}-auth-url`);
		const data = await resp.json() as AuthUrlResponse;
		return data.result.url;
	}

	private sendLoginResponse(succeeded: boolean, type: 'google' | 'twitter' | 'email', errorMsg?: any) {
		this._mainWindow.webContents.send('login' + type + 'Response', succeeded ? 'success' : errorMsg);
	}

	private openSocialLoginPopupWindow(url: string): BrowserWindow {
		const win = new BrowserWindow({
			width: 450,
			height: 620,
			parent: this._mainWindow,
			modal: true,
			resizable: false,
			minimizable: false,
			maximizable: false,
			webPreferences: {
				devTools: false,
				nodeIntegration: false
			}
		});
		win.loadURL(url);
		win.setMenu(null);
		win.setMenuBarVisibility(false);
		return win;
	}

	private async verifyGoogleCredentials(code: string) {
		const resp = await fetch(getApiUrl() + '/auth/verify-google-credentials', {
			method: 'post',
			body: JSON.stringify({ code }),
			headers: { 'Content-Type': 'application/json' }
		});
		if (!resp.ok) {
			this.sendLoginResponse(false, 'google');
			return;
		}
		await this.setLoggedIn(resp.headers.raw()['set-cookie'].find(c => c.includes('auth-token')));
		this.sendLoginResponse(true, 'google');
	}

	private async verifyTwitterCredentials(oauth_token: string, oauth_verifier: string) {
		const resp = await fetch(getApiUrl() + '/auth/verify-twitter-credentials', {
			method: 'post',
			body: JSON.stringify({ oauth_token, oauth_verifier }),
			headers: { 'Content-Type': 'application/json' }
		});
		console.log(await resp.json());
		if (!resp.ok) {
			this.sendLoginResponse(false, 'twitter');
			return;
		}
		await this.setLoggedIn(resp.headers.raw()['set-cookie'].find(c => c.includes('auth-token')));
		this.sendLoginResponse(true, 'twitter');
	}

	public get isLoggedIn(): boolean {
		return true;
	}
}
