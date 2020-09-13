const CACHE_VERSION = 'v.0.2';
const CACHE_NAME = 'xracer_clone/' + CACHE_VERSION

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(
			CACHE_NAME
		).then(cache => {
			return cache.addAll([
				'/webgl_xracer_clone/',
				'/webgl_xracer_clone/index.html',
				'/webgl_xracer_clone/app/main.js',
				'/webgl_xracer_clone/app/classes/observable.js',
				'/webgl_xracer_clone/app/classes/textureManager.js',
				'/webgl_xracer_clone/app/controller/controller.js',
				'/webgl_xracer_clone/app/model/config.js',
				'/webgl_xracer_clone/app/model/constants.js',
				'/webgl_xracer_clone/app/model/highscore.js',
				'/webgl_xracer_clone/app/model/options.js',
				'/webgl_xracer_clone/app/model/xracer.js',
				'/webgl_xracer_clone/app/view/view.js',
				'/webgl_xracer_clone/app/view/partial/baseView.js',
				'/webgl_xracer_clone/app/view/partial/gameView.js',
				'/webgl_xracer_clone/app/view/partial/highscoreView.js',
				'/webgl_xracer_clone/app/view/partial/menuView.js',
				'/webgl_xracer_clone/app/view/partial/optionsView.js',
				'/webgl_xracer_clone/lib/rdo/fontTexture.js',
				'/webgl_xracer_clone/lib/rdo/helper.js',
				'/webgl_xracer_clone/lib/rdo/sound.js',
				'/webgl_xracer_clone/lib/threejs_119/build/three.module.js',
				'/webgl_xracer_clone/lib/threejs_119/examples/jsm/curves/NURBSCurve.js',
				'/webgl_xracer_clone/lib/threejs_119/examples/jsm/curves/NURBSUtils.js',
				'/webgl_xracer_clone/lib/threejs_119/examples/jsm/effects/StereoEffect.js',
				'/webgl_xracer_clone/lib/threejs_119/examples/jsm/libs/inflate.module.min.js',
				'/webgl_xracer_clone/lib/threejs_119/examples/jsm/loaders/FBXLoader.js',
				'/webgl_xracer_clone/resources/config/config.json',
				'/webgl_xracer_clone/resources/css/global.css',
				'/webgl_xracer_clone/resources/icon/icon_32.png',
				'/webgl_xracer_clone/resources/icon/icon_192.png',
				'/webgl_xracer_clone/resources/icon/icon_512.png',
				'/webgl_xracer_clone/resources/json/manifest.json',
				'/webgl_xracer_clone/resources/language/de.json',
				'/webgl_xracer_clone/resources/language/en.json',
				'/webgl_xracer_clone/resources/model/star_wars_interceptor.fbx',
				'/webgl_xracer_clone/resources/music/track_01.mp3',
				'/webgl_xracer_clone/resources/sound/414345_explosion.wav',
				'/webgl_xracer_clone/resources/texture/font/bg.png'
			]);
		})
	);
});

self.addEventListener('activate', (event) => {
	let expectedCaches = [CACHE_NAME];

	event.waitUntil(
		caches.keys().then((keys) => Promise.all(
			keys.map((key) => {
				// remove old caches
				if (!expectedCaches.includes(key)) {
					return caches.delete(key);
				}
			})
		))
	);
});

self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(
			event.request
		).then(response => {
			if (response) {
				return response;
			}

			return fetch(event.request);
		})
	);
});

self.addEventListener('message', (event) => {
	switch (event.data.action) {
		case 'getCacheName': {
			event.source.postMessage(CACHE_VERSION);
		} break;

		case 'skipWaiting': {
			self.skipWaiting();
		} break;
	}
});