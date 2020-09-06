import * as THREE from '../../lib/threejs_119/build/three.module.js';
import Stats from '../../lib/threejs_119/examples/jsm/libs/stats.module.js';
import { StereoEffect } from '../../lib/threejs_119/examples/jsm/effects/StereoEffect.js';

import Observable from '../classes/observable.js';
import FontTexture from '../../lib/rdo/fontTexture.js';

import MenuView from '../view/partial/menuView.js';
import GameView from '../view/partial/gameView.js';
import HighscoreView from '../view/partial/highscoreView.js';
import OptionsView from '../view/partial/optionsView.js';

class View extends Observable {
	constructor(config, partialModels) {
		super();

		this.config = config;
		this.partialModels = partialModels;

		this.partialView = null;
		this.menuView = null;
		this.gameView = null;
		this.optionsView = null;
		this.highscoreView = null;

		this.isPointerDown = false;
		this.pointerDownVector = new THREE.Vector2();

		this.startPointerVector = new THREE.Vector2();
		this.endPointerVector = new THREE.Vector2();
		this.differencePointerVector = new THREE.Vector2();


		this.canvas = document.getElementById('webGlCanvas');

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(59, this.getCameraAspect(), 1, 1000);

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.getGameAreaWidth(), this.getGameAreaHeight());
		this.renderer.sortObjects = true;

		this.effect = new StereoEffect(this.renderer);
		this.effect.setSize(this.getGameAreaWidth(), this.getGameAreaHeight());

		this.stats = new Stats();
		this.stats.dom.style.cssText = 'position:fixed;top:0;right:0;cursor:pointer;opacity:0.9;z-index:10000';

		this.canvas.appendChild(this.stats.dom);
		this.canvas.appendChild(this.renderer.domElement);

		this.raycaster = new THREE.Raycaster();
		this.fontTexture = new FontTexture(this.config.font, this.camera);

		this.renderer.domElement.addEventListener('mousedown', this.onMouseDownHandler.bind(this), false);
		this.renderer.domElement.addEventListener('mousemove', this.onMouseMoveHandler.bind(this), false);
		this.renderer.domElement.addEventListener('mouseup', this.onMouseUpHandler.bind(this), false);
		this.renderer.domElement.addEventListener('touchstart', this.onTouchStartHandler.bind(this), false);
		this.renderer.domElement.addEventListener('touchmove', this.onTouchMoveHandler.bind(this), false);
		this.renderer.domElement.addEventListener('touchend', this.onTouchEndHandler.bind(this), false);

		window.addEventListener('resize', this.onResizeHandler.bind(this), false);

		this.load();
	}

	load() {
		this.init();
	}

	init() {
		this.menuView = new MenuView(this);
		this.gameView = new GameView(this, this.partialModels.xracer);
		this.optionsView = new OptionsView(this, this.partialModels.options);
		this.highscoreView = new HighscoreView(this, this.partialModels.highscore);

		this.showMenuView();

		this.render();
	}

	render() {
		this.stats.begin();

		this.partialView.animate();

		if (this.partialView instanceof GameView && this.partialModels.options.vrMode) {
			this.effect.render(this.scene, this.camera);
		} else {
			this.renderer.render(this.scene, this.camera);
		}

		this.stats.end();

		requestAnimationFrame(this.render.bind(this));
	}

	updateTextures() {
		this.partialView.updateTextures();
	}

	addTextBasePlane(parent) {
		let plane = new THREE.Mesh(
			new THREE.PlaneGeometry(1, 1),
			new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true, opacity: 1 })
		);

		parent.add(plane);

		return plane;
	}

	matchClick(startVec, endVec) {
		let difference = new THREE.Vector2().subVectors(endVec, startVec);

		if (Math.abs(difference.x) > 0.003 || Math.abs(difference.y) > 0.003) {
			return false;
		}

		return true;
	}

	setPartialView(obj) {
		this.partialView = obj;

		this.scene = this.partialView.scene;

		this.partialView.show();

		this.renderer.setSize(this.getGameAreaWidth(), this.getGameAreaHeight());
		this.effect.setSize(this.getGameAreaWidth(), this.getGameAreaHeight());
	}

	showGameView() {
		this.setPartialView(this.gameView);
	}

	showHighscoreView() {
		this.setPartialView(this.highscoreView);
	}

	showMenuView() {
		this.setPartialView(this.menuView);
	}

	showOptionsView() {
		this.setPartialView(this.optionsView);
	}



	getGameAreaHeight() { return this.canvas.offsetHeight; }
	getGameAreaWidth() { return this.canvas.offsetWidth; }

	getCameraAspect() { return this.getGameAreaWidth() / this.getGameAreaHeight(); }

	getMouseVector2(eventPosX, eventPosY) {
		let rect = this.canvas.getBoundingClientRect();
		let mouseVector2 = new THREE.Vector2();

		mouseVector2.x = ((eventPosX - rect.left) / this.getGameAreaWidth()) * 2 - 1;
		mouseVector2.y = -((eventPosY - rect.top) / this.getGameAreaHeight()) * 2 + 1;

		return mouseVector2;
	}

	handlePointerDown(eventPosX, eventPosY) {
		this.startPointerVector = this.getMouseVector2(eventPosX, eventPosY);

		this.pointerDownVector.copy(this.startPointerVector);
	}

	handlePointerMove(eventPosX, eventPosY) {
		if (this.partialView === null) {
			return;
		}

		if (this.isPointerDown === false) {
			let pointerVector = this.getMouseVector2(eventPosX, eventPosY);

			this.partialView.intersectObjects(pointerVector, this.camera);
		} else {
			if (this.partialView.container) {
				this.endPointerVector = this.getMouseVector2(eventPosX, eventPosY);
				this.differencePointerVector.subVectors(this.endPointerVector, this.startPointerVector);

				this.partialView.rotateGameBoard(this.differencePointerVector);

				this.startPointerVector.copy(this.endPointerVector);
			}
		}
	}

	handlePointerUp(eventPosX, eventPosY) {
		if (this.partialView === null) {
			return;
		}

		let currentPointerPos = this.getMouseVector2(eventPosX, eventPosY);

		if (this.matchClick(currentPointerPos, this.pointerDownVector)) {
			this.partialView.useIntersectedObject();
		}

		this.updateTextures();
	}

	onMouseDownHandler(event) {
		this.isPointerDown = true;

		this.handlePointerDown(event.clientX, event.clientY);
	}

	onMouseMoveHandler(event) {
		event.preventDefault();

		this.handlePointerMove(event.clientX, event.clientY);
	}

	onMouseUpHandler(event) {
		this.handlePointerUp(event.clientX, event.clientY);

		this.isPointerDown = false;
	}

	onTouchStartHandler(event) {
		this.isPointerDown = true;

		switch (event.touches.length) {
			case 1: {
				this.handlePointerDown(event.touches[0].pageX, event.touches[0].pageY);
			} break;

			case 2: {
				let dx = event.touches[0].pageX - event.touches[1].pageX;
				let dy = event.touches[0].pageY - event.touches[1].pageY;

				this.startZoomDistance = Math.sqrt(dx * dx + dy * dy);
			} break;
		}
	}

	onTouchMoveHandler(event) {
		event.preventDefault();

		switch (event.touches.length) {
			case 1: {
				this.handlePointerMove(event.touches[0].pageX, event.touches[0].pageY);
			} break;

			case 2: {
				let dx = event.touches[0].pageX - event.touches[1].pageX;
				let dy = event.touches[0].pageY - event.touches[1].pageY;

				this.endZoomDistance = Math.sqrt(dx * dx + dy * dy);
				this.differenceZoomDinstance = this.endZoomDistance - this.startZoomDistance;

				this.handleZoom(this.differenceZoomDinstance / 100);

				this.startZoomDistance = this.endZoomDistance;
			} break;
		}
	}

	onTouchEndHandler(event) {
		this.handlePointerUp(event.changedTouches[0].pageX, event.changedTouches[0].pageY);

		this.isPointerDown = false;
	}

	onResizeHandler(event) {
		this.camera.aspect = this.getCameraAspect();
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.getGameAreaWidth(), this.getGameAreaHeight());
		this.effect.setSize(this.getGameAreaWidth(), this.getGameAreaHeight());

		this.updateTextures();
	}
}

export default View;