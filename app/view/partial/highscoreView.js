import * as THREE from 'three';

import helper from '../../../lib/rdo/helper.js';

import BaseView from './baseView.js';

class HighscoreView extends BaseView {
	constructor(mainView, model) {
		super(mainView);

		this.model = model;

		this.highscoreItems = [];
		this.resetButton = null;
		this.saveButton = null;
		this.navToMenuButton = null;

		this.createObjects();
	}

	createObjects() {
		this.cameraGroup = new THREE.Group();
		this.scene.add(this.cameraGroup);

		this.resetButton = this.mainView.addTextBasePlane(this.scene);
		this.navToMenuButton = this.mainView.addTextBasePlane(this.scene);
		this.navToGameButton = this.mainView.addTextBasePlane(this.scene);

		for (let i = 0; i < this.model.maxItems; ++i) {
			this.highscoreItems.push(this.mainView.addTextBasePlane(this.scene));
		}

		this.resetButton.userData.actionHandler = 'resetHighscoreAction';
		this.navToMenuButton.userData.actionHandler = 'navToMenuAction';
		this.navToGameButton.userData.actionHandler = 'navToGameAction';

		this.intersectMeshs.push(this.resetButton);
		this.intersectMeshs.push(this.navToMenuButton);
		this.intersectMeshs.push(this.navToGameButton);
	}

	animate() {
	}

	show() {
		this.cameraGroup.add(this.mainView.camera);
		this.cameraGroup.position.set(0, 0, 10);

		this.updateTextures();
	}

	updateTextures() {
		let texts = this.mainView.config.texts;

		for (let i = 0; i < this.model.maxItems; ++i) {
			let output = '';

			output += helper.pad0(i + 1, 2);
			output += '.    ';
			output += helper.pad0(this.model.items[i].points, 5);
			output += '    ';
			output += this.model.items[i].name;

			this.mainView.fontTexture.setTextureToObject(
				this.highscoreItems[i],
				{text: output, x: -4.0, y: 4.8 - (i * 0.9), scale: 0.8, align: 'left'}
			);
		}

		this.mainView.fontTexture.setTextureToObject(
			this.navToMenuButton, {text: '\u25C4 ' + texts.navigationMenu, x: -5.3, y: -4.8, opacity: 0.8, align: 'left'}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.resetButton, {text: texts.highscoreReset, x: 0, y: -4.8, opacity: 0.8}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.navToGameButton, {text: texts.navigationPlay + ' \u25BA', x: 5.3, y: -4.8, opacity: 0.8, align: 'right'}
		);
	}
}

export default HighscoreView;