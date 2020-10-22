import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, timer} from 'rxjs';
import {User} from '../../models/http/response/user';
import {ApiService} from '../api/api.service';
import {CookieStorageService} from '../cookie-storage/cookie-storage.service';
import {distinctUntilChanged, map} from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class UserService {

	private readonly _userInfo$ = new BehaviorSubject<User>(undefined);

	private _isLoggedIn = false;

	constructor(private api: ApiService, private cookie: CookieStorageService) {
		timer(0, 1500).pipe(
			map(() => this.checkLoginState()),
			distinctUntilChanged(),
		).subscribe(async loggedIn =>  {
			this._isLoggedIn = loggedIn;

			if (!loggedIn) {
				this._userInfo$.next(undefined);
				return;
			}
			try {
				const user = await this.api.get<User>('/user', {errorMessage: 'ERROR.USER.GET_INFO'}).toPromise();
				this._userInfo$.next(user.data);
			} catch {
				this._isLoggedIn = false;
				this._userInfo$.next(undefined);
			}
		});
	}

	public get isLoggedIn(): boolean {
		return this._isLoggedIn;
	}

	public get userInfo$(): Observable<User> {
		return this._userInfo$.asObservable();
	}

	private checkLoginState(): boolean {
		return this.cookie.get('isAuthenticated') === 'true';
	}
}
