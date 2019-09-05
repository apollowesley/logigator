import {Element} from './element';
import * as PIXI from 'pixi.js';

export type ActionType = 'addComp' |
	'addWire' |
	'addText' |
	'remComp' |
	'remWire' |
	'remText' |
	'movComp' |
	'movWire' |
	'movText' |
	'conWire' |	// TODO connect Wire
	'setComp';

export interface Action {
	name: ActionType;	// TODO element settings
	element?: Element;
	id?: number;
	pos?: PIXI.Point;
	startPos?: PIXI.Point;
}
