import * as THREE from '../../../lib/threejs_119/build/three.module.js';

import BaseView from './baseView.js';

class MenuView extends BaseView {
	constructor(mainView) {
		super(mainView);

		this.navToGameButton = null;
		this.navToHighscoreButton = null;
		this.navToOptionsButton = null;
		this.versionLabel = null;

		this.cameraGroup = null;

		this.createObjects();
	}

	createObjects() {
		this.navToGameButton = this.mainView.addTextBasePlane(this.scene);
		this.navToHighscoreButton = this.mainView.addTextBasePlane(this.scene);
		this.navToOptionsButton = this.mainView.addTextBasePlane(this.scene);
		this.versionLabel = this.mainView.addTextBasePlane(this.scene);

		this.navToGameButton.userData.actionHandler = 'navToGameAction';
		this.navToHighscoreButton.userData.actionHandler = 'navToHighscoreAction';
		this.navToOptionsButton.userData.actionHandler = 'navToOptionsAction';

		this.intersectMeshs.push(this.navToGameButton);
		this.intersectMeshs.push(this.navToHighscoreButton);
		this.intersectMeshs.push(this.navToOptionsButton);

		this.cameraGroup = new THREE.Group();
		this.scene.add(this.cameraGroup);
	}

	animate() {
	}

	show() {
		this.scene.background = new THREE.Color('#000000');

		this.cameraGroup.add(this.mainView.camera);
		this.cameraGroup.position.set(0, 0, 10);

		this.updateTextures();
	}

	updateTextures() {
		let texts = this.mainView.config.texts;

		this.mainView.fontTexture.setTextureToObject(
			this.navToGameButton, {text: texts.navigationPlay, x: 0, y: 3, opacity: 0.8}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.navToHighscoreButton, {text: texts.navigationHighscore, x: 0, y: 0, opacity: 0.8}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.navToOptionsButton, {text: texts.navigationOptions, x: 0, y: -3, opacity: 0.8}
		);

		this.mainView.fontTexture.setTextureToObject(
			this.versionLabel, {text: this.mainView.config.version, x: 4.8, y: -4.8, scale: 0.5, opacity: 1.0}
		);
	}
}

export default MenuView;