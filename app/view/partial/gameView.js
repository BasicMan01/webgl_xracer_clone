import * as THREE from 'three';

import { FBXLoader } from '../../../lib/threejs_158/examples/jsm/loaders/FBXLoader.js';

import FontTexture from '../../../lib/rdo/fontTexture.js';

import BaseView from './baseView.js';
import Constants from '../../model/constants.js';

class GameView extends BaseView {
	constructor(mainView, model) {
		super(mainView);

		this.model = model;

		this.btnHome = null;

		this.cubes = [];
		this.planes = [];
		this.gameStatus = 0;
		this.points = 0;

		this.cameraGroup = null;
		this.ship = null;
		this.deviceOrientationData = null;
		this.currentScreenOrientation = window.orientation || 0;
		this.keyLeft = false;
		this.keyRight = false;
		this.keyUp = false;

		this.clock = new THREE.Clock();

		this.scene.fog = new THREE.Fog('#DDDDDD', 0.01, 80.0);

		this.soundExplosion = new Audio('resources/sound/414345_explosion.wav');

		this.font = {};
		this.font.family = this.mainView.config.font.family;
		this.font.size = this.mainView.config.font.size;
		this.font.weight = this.mainView.config.font.weight;
		this.font.baseline = this.mainView.config.font.baseline;
		this.font.left = this.mainView.config.font.left;
		this.font.top = this.mainView.config.font.top;
		this.fontTexture = new FontTexture(this.font, this.mainView.camera);

		this.deviceorientationHandler = this.onDeviceOrientationHandler.bind(this);
		this.orientationChangeHandler = this.onOrientationChangeHandler.bind(this);

		window.addEventListener('deviceorientation', this.deviceorientationHandler, false);
		window.addEventListener('orientationchange', this.orientationChangeHandler, false);
		window.addEventListener('keydown', this.onKeyDownHandler.bind(this), false);
		window.addEventListener('keyup', this.onKeyUpHandler.bind(this), false);

		this.createObjects();
	}

	createObjects() {
		this.btnHome = document.createElement("input");
		this.btnHome.type = 'button';
		this.btnHome.className = 'btnHome';
		this.btnHome.id = 'btnHome';
		this.btnHome.value = 'Home';
		this.btnHome.addEventListener('click', function() {
			this.btnHome.style.display = 'none';
			this.mainView.emit('navToMenuAction');
		}.bind(this));

		document.body.appendChild(this.btnHome);

		this.textValuePoints = this.mainView.addTextBasePlane(this.scene);

		this.cameraGroup = new THREE.Group();
		this.scene.add(this.cameraGroup);

		this.createTerrain();
		this.createExplosion();

		let hemisphereLight = new THREE.HemisphereLight('#FFFF88', '#000000', 0.6);
		this.scene.add(hemisphereLight);

		let directionalLightLeft = new THREE.DirectionalLight('#FFFF88', 0.4);
		directionalLightLeft.position.set(-10, 10, 0);
		this.scene.add(directionalLightLeft);

		let directionalLightRight = new THREE.DirectionalLight('#FFFF88', 0.4);
		directionalLightRight.position.set(10, 10, 0);
		this.scene.add(directionalLightRight);

		let fbxLoader = new FBXLoader();

		fbxLoader.load('resources/model/star_wars_interceptor.fbx', function(object) {
			this.ship = object;
			this.ship.children[0].userData.bb = new THREE.Box3();

			this.scene.add(this.ship);
		}.bind(this));
	}

	createExplosion() {
		let geometry = new THREE.PlaneGeometry(0.3, 0.3);
		let material = new THREE.MeshStandardMaterial( { color: '#FF0000', transparent: true } );

		for (let i = 0; i < 50; ++i) {
			let plane = new THREE.Mesh(geometry, material);

			plane.userData.dir = new THREE.Vector3(
				Math.random() - 0.5,
				Math.random() - 0.5,
				Math.random() - 0.5
			);

			this.scene.add(plane);

			this.planes.push(plane);
		}
	}

	createTerrain() {
		let geometry = new THREE.BoxGeometry(Constants.BLOCK_SIZE, 1, Constants.BLOCK_SIZE);
		let material = new THREE.MeshStandardMaterial( { color: '#FFFFFF' } );

		for (let z = 0; z <= Constants.GAME_TERRAIN_SIZE_Z; ++z) {
			this.cubes[z] = [];

			for (let x = 0; x <= Constants.GAME_TERRAIN_SIZE_X; ++x) {
				let cube = new THREE.Mesh(geometry, material);

				this.scene.add(cube);
				this.cubes[z].push(cube);
			}
		}
	}

	startGame() {
		// reset all values
		this.gameStatus = Constants.GAME_STATUS_READY;
		this.points = 0;

		this.cameraGroup.position.set(0, 7, 0);

		this.ship.rotation.z = 0;
		this.ship.position.set(this.cameraGroup.position.x, 5, this.cameraGroup.position.z - 10);
		this.ship.visible = true;

		for (let z = 0; z <= Constants.GAME_TERRAIN_SIZE_Z; ++z) {
			for (let x = 0; x <= Constants.GAME_TERRAIN_SIZE_X; ++x) {
				this.cubes[z][x].position.set(x * Constants.BLOCK_SIZE - 60, 0, z * -Constants.BLOCK_SIZE);
				this.cubes[z][x].userData.bb = new THREE.Box3();
				this.cubes[z][x].userData.obstacle = false;
				this.setStartHeight(this.cubes[z][x]);
			}
		}
	}

	setStartHeight(cube) {
		let y = Math.floor(Math.random() * 3) + 1;

		cube.scale.y = y;
		cube.position.y = y / 2;
	}

	animate() {
		let i = 0;
		let betaSin = 0;
		let clockDelta = this.clock.getDelta();

		switch (this.gameStatus) {
			case Constants.GAME_STATUS_READY:
				this.gameStatus = Constants.GAME_STATUS_RUN;
				break;

			case Constants.GAME_STATUS_RUN:
				if (this.deviceOrientationData !== null && this.deviceOrientationData.beta) {
					betaSin = -Math.sin(THREE.MathUtils.degToRad(this.deviceOrientationData.beta));
				} else if (this.keyLeft) {
					betaSin = 0.2;
				} else if (this.keyRight) {
					betaSin = -0.2;
				}

				this.cameraGroup.position.x -= betaSin * clockDelta * 60;
				this.cameraGroup.position.z -= clockDelta * 40;

				this.points = Math.floor(-this.cameraGroup.position.z);

				this.ship.rotation.z = betaSin;
				this.ship.position.set(this.cameraGroup.position.x, 5, this.cameraGroup.position.z - 10);

				if (this.isCollision()) {
					this.gameStatus = Constants.GAME_STATUS_STOP;

					this.ship.visible = false;

					this.planes[0].material.opacity = 1.0;

					for (i = 0; i < this.planes.length; ++i) {
						this.planes[i].position.copy(this.ship.position);
					}

					if (this.mainView.partialModels.options.sound) {
						this.soundExplosion.play();
					}
				}

				if (this.cameraGroup.position.z < this.cubes[0][0].position.z) {
					let newZPosition = this.cubes[this.cubes.length-1][0].position.z - Constants.BLOCK_SIZE;

					for (i = 0; i < this.cubes[0].length; ++i) {
						this.cubes[0][i].position.z = newZPosition;
						this.setStartHeight(this.cubes[0][i]);
					}

					this.cubes.push(this.cubes[0]);
					this.cubes.shift();



					let obstacleCount = Math.ceil(this.points / 1000);

					for (i = 0; i < obstacleCount; ++i) {
						// random obstacle
						let n = Math.floor(Math.random() * Constants.GAME_TERRAIN_SIZE_X) + 1;

						this.cubes[this.cubes.length-1][n].scale.y = 20;
						this.cubes[this.cubes.length-1][n].position.y = 10;
						this.cubes[this.cubes.length-1][n].userData.obstacle = true;

						this.computeBoundingBox(this.cubes[this.cubes.length-1][n]);
					}


				}

				if (this.cameraGroup.position.x < this.cubes[0][20].position.x) {
					let newXPosition = this.cubes[0][0].position.x - Constants.BLOCK_SIZE;

					for (let i = 0; i < this.cubes.length; ++i) {
						this.cubes[i][Constants.GAME_TERRAIN_SIZE_X].position.x = newXPosition;
						this.cubes[i].unshift(this.cubes[i][Constants.GAME_TERRAIN_SIZE_X]);
						this.cubes[i].pop();

						this.computeBoundingBox(this.cubes[i][0]);
					}
				}

				if (this.cameraGroup.position.x > this.cubes[0][20].position.x) {
					let newXPosition = this.cubes[0][Constants.GAME_TERRAIN_SIZE_X].position.x + Constants.BLOCK_SIZE;

					for (let i = 0; i < this.cubes.length; ++i) {
						this.cubes[i][0].position.x = newXPosition;
						this.cubes[i].push(this.cubes[i][0]);
						this.cubes[i].shift();

						this.computeBoundingBox(this.cubes[i][this.cubes[i].length-1]);
					}
				}

				this.updateTextures();
				break;

			case Constants.GAME_STATUS_STOP:
				this.planes[0].material.opacity -= clockDelta * 0.5;

				for (i = 0; i < this.planes.length; ++i) {
					this.planes[i].position.addScaledVector(this.planes[i].userData.dir, clockDelta * 10);
				}

				if (this.planes[0].material.opacity < 0) {
					let currentDate = new Date();
					let currentDateString = '';

					currentDateString =
						('0' + currentDate.getDate()).slice(-2) + '.' +
						('0' + (currentDate.getMonth() + 1)).slice(-2) + '.' +
						currentDate.getFullYear() + ' ' +
						currentDate.toLocaleTimeString();

					this.mainView.partialModels.highscore.initNewEntry(this.points, currentDateString);
					this.mainView.partialModels.highscore.save();

					this.startGame();
				}
				break;
		}
	}

	computeBoundingBox(obj) {
		obj.geometry.computeBoundingBox();
		obj.userData.bb.copy(obj.geometry.boundingBox);
		obj.updateMatrixWorld(true);
		obj.userData.bb.applyMatrix4(obj.matrixWorld);
	}

	aabbOverlapping(bb1, bb2) {
		return (
			(bb1.min.x <= bb2.max.x && bb1.max.x >= bb2.min.x) &&
			(bb1.min.y <= bb2.max.y && bb1.max.y >= bb2.min.y) &&
			(bb1.min.z <= bb2.max.z && bb1.max.z >= bb2.min.z)
		);
	}

	isCollision() {
		let targetRows = [2, 3, 4];
		let targetCols = [19, 20, 21];

		this.computeBoundingBox(this.ship.children[0]);

		for (let z = 0; z < targetRows.length; ++z) {
			for (let x = 0; x < targetCols.length; ++x) {
				if (this.cubes[targetRows[z]][targetCols[x]].userData.obstacle) {
					if (this.aabbOverlapping(this.ship.children[0].userData.bb, this.cubes[targetRows[z]][targetCols[x]].userData.bb)) {
						return true;
					}
				}
			}
		}

		return false;
	}

	show() {
		this.btnHome.style.display = 'block';
		this.scene.background = new THREE.Color('#DDDDDD');

		this.cameraGroup.add(this.mainView.camera);
		// Camera position is set in startGame()

		this.startGame();
		this.updateTextures();
	}

	updateTextures() {
		this.fontTexture.setTextureToObject(
			this.textValuePoints,
			{
				text: this.points,
				x: this.ship.position.x,
				y: 2,
				z: this.ship.position.z,
				scale: 0.5,
				align: 'center',
				useAspectRatio: false
			}
		);

	}

	onDeviceOrientationHandler(event) {
		if (!event.alpha) {
			return;
		}

		this.deviceOrientationData = event;
	}

	onOrientationChangeHandler(event) {
		this.currentScreenOrientation = window.orientation;
	}

	onKeyDownHandler(event) {
		switch (event.keyCode) {
			case 32:
				this.gameStatus = Constants.GAME_STATUS_RUN;
				break;

			case 37:
				this.keyLeft = true;
				break;

			case 38:
				this.keyUp = true;
				break;

			case 39:
				this.keyRight = true;
				break;
		}
	}

	onKeyUpHandler(event) {
		switch (event.keyCode) {
			case 37:
				this.keyLeft = false;
				break;

			case 38:
				this.keyUp = false;
				break;

			case 39:
				this.keyRight = false;
				break;
		}
	}
}

export default GameView;