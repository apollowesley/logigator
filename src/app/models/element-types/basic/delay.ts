import {ElementType} from '../element-type';
import {environment} from '../../../../environments/environment';

export const delay: ElementType = {
	name: 'ELEMENT_TYPE.BASIC.DELAY.NAME',
	numInputs: 1,
	numOutputs: 1,
	minInputs: 1,
	maxInputs: 1,
	width: environment.componentWidth,
	symbol: '1',
	description: 'ELEMENT_TYPE.BASIC.DELAY.DESCRIPTION',
	rotation: 0,
	category: 'basic',
	options: [1],
	optionsConfig: [
		{
			name: 'ELEMENT_TYPE.BASIC.DELAY.DELAY_OPT',
			min: 1,
			max: Number.MAX_VALUE
		}
	]
};
