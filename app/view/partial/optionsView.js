import BaseView from './baseView.js';

class OptionsView extends BaseView {
	constructor(mainView, model) {
		super(mainView);

		this.model = model;

		this.textLanguage = null;
		this.textLanguageValue = null;
		this.textLanguageNextButton = null;
		this.textLanguagePreviousButton = null;
		this.textMusic = null;
		this.textMusicValue = null;
		this.textMusicButton = null;
		this.textSound = null;
		this.textSoundValue = null;
		this.textSoundButton = null;
		this.textVRMode = null;
		this.textVRModeValue = null;
		this.textVRModeButton = null;
		this.navToMenuButton = null;

		this.createObjects();
	}

	createObjects() {
		this.textMusic = this.mainView.addTextBasePlane(this.scene);
		this.textMusicValue = this.mainView.addTextBasePlane(this.scene);
		this.textMusicButton = this.mainView.addTextBasePlane(this.scene);
		this.textSound = this.mainView.addTextBasePlane(this.scene);
		this.textSoundValue = this.mainView.addTextBasePlane(this.scene);
		this.textSoundButton = this.mainView.addTextBasePlane(this.scene);
		this.textVRMode = this.mainView.addTextBasePlane(this.scene);
		this.textVRModeValue = this.mainView.addTextBasePlane(this.scene);
		this.textVRModeButton = this.mainView.addTextBasePlane(this.scene);
		this.textLanguage = this.mainView.addTextBasePlane(this.scene);
		this.textLanguageValue = this.mainView.addTextBasePlane(this.scene);
		this.textLanguageNextButton = this.mainView.addTextBasePlane(this.scene);
		this.textLanguagePreviousButton = this.mainView.addTextBasePlane(this.scene);
		this.navToMenuButton = this.mainView.addTextBasePlane(this.scene);

		this.textMusicButton.userData.actionHandler = 'setMusicAction';
		this.textSoundButton.userData.actionHandler = 'setSoundAction';
		this.textVRModeButton.userData.actionHandler = 'setVRModeAction';
		this.textLanguageNextButton.userData.actionHandler = 'nextLanguageAction';
		this.textLanguagePreviousButton.userData.actionHandler = 'previousLanguageAction';
		this.navToMenuButton.userData.actionHandler = 'navToMenuAction';

		this.intersectMeshs.push(this.textMusicButton);
		this.intersectMeshs.push(this.textSoundButton);
		this.intersectMeshs.push(this.textVRModeButton);
		this.intersectMeshs.push(this.textLanguageNextButton);
		this.intersectMeshs.push(this.textLanguagePreviousButton);
		this.intersectMeshs.push(this.navToMenuButton);
	}

	animate() {
	}

	show() {
		this.selectedObject = null;

		this.updateTextures();
	}

	updateTextures() {
		let texts = this.mainView.config.texts;

		this.mainView.fontTexture.setTextureToObject(
			this.textMusic, {text: texts.optionsMusic, x: -3, y: 4, align: 'left'}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.textMusicValue,
			{
				text: this.model.music ? texts.optionsOn : texts.optionsOff,
				x: 2,
				y: 4,
				align: 'right'
			}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.textMusicButton, {text: '\u25BA', x: 2.5, y: 4, opacity: 0.8, align: 'left'}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.textSound, {text: texts.optionsSound, x: -3, y: 2, align: 'left'}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.textSoundValue,
			{
				text: this.model.sound ? texts.optionsOn : texts.optionsOff,
				x: 2,
				y: 2,
				align: 'right'
			}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.textSoundButton, {text: '\u25BA', x: 2.5, y: 2, opacity: 0.8, align: 'left'}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.textVRMode, {text: texts.optionsVRMode, x: -3, y: 0, align: 'left'}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.textVRModeValue,
			{
				text: this.model.vrMode ? texts.optionsOn : texts.optionsOff,
				x: 2,
				y: 0,
				align: 'right'
			}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.textVRModeButton, {text: '\u25BA', x: 2.5, y: 0, opacity: 0.8, align: 'left'}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.textLanguage, {text: texts.optionsLanguage, x: -3, y: -2, align: 'left'}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.textLanguagePreviousButton, {text: '\u25C4', x: 0.5, y: -2, opacity: 0.8, align: 'left'}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.textLanguageValue, {text: this.model.language.toUpperCase(), x: 2, y: -2, align: 'right'}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.textLanguageNextButton, {text: '\u25BA', x: 2.5, y: -2, opacity: 0.8, align: 'left'}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.navToMenuButton, {text: '\u25C4 ' + texts.navigationMenu, x: -5.3, y: -4.8, opacity: 0.8, align: 'left'}
		);
	}
}

export default OptionsView;