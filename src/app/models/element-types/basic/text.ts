import {ElementType} from '../element-type';
import {ProjectsService} from '../../../services/projects/projects.service';
import {TextComponent} from '../../../components/popup/popup-contents/text/text.component';
import {getStaticDI} from '../../get-di';
import {PopupService} from '../../../services/popup/popup.service';
import {ElementTypeId} from '../element-type-ids';

export const text: ElementType = {
	id: ElementTypeId.TEXT,

	name: 'ELEMENT_TYPE.BASIC.TEXT.NAME',

	category: 'basic',

	symbol: '',

	showSettings: true,
	showSettingsForType: true,
	showInConstructionBox: false,

	description: 'ELEMENT_TYPE.BASIC.TEXT.DESCRIPTION',

	isRotatable: false,
	rotation: 0,

	numOutputs: 0,

	numInputs: 0,
	minInputs: 0,
	maxInputs: 0,

	width: 0,

	edit: async (typeId: number, id: number, projectsSer: ProjectsService) => {
		const oText = projectsSer.currProject.currState.getElementById(id).data as TextData;
		const nText = await getStaticDI(PopupService).showPopup(TextComponent, 'POPUP.TEXT.TITLE', false, oText);
		if (nText === oText) return;
		projectsSer.currProject.setData(id, nText);
	},
	canEditType: false
};

export type TextData = string;
