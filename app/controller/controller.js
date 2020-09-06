import Sound from '../../lib/rdo/sound.js';
import Config from '../model/config.js';
import Highscore from '../model/highscore.js';
import Options from '../model/options.js';
import XRacer from '../model/xracer.js';
import View from '../view/view.js';

class Controller {
	constructor(version) {
		this.sound = new Sound();

		this.config = new Config();
		this.config.version = version;
		this.config.load(this.init.bind(this));
	}

	init() {
		this.highscore = new Highscore();
		this.options = new Options(this.config);
		this.xracer = new XRacer();

		this.view = new View(this.config, {
			'options': this.options,
			'highscore': this.highscore,
			'xracer': this.xracer
		});

		// navigation
		this.view.addCallback('navToGameAction', this.navToGameAction.bind(this));
		this.view.addCallback('navToHighscoreAction', this.navToHighscoreAction.bind(this));
		this.view.addCallback('navToMenuAction', this.navToMenuAction.bind(this));
		this.view.addCallback('navToOptionsAction', this.navToOptionsAction.bind(this));
		// highscore
		this.view.addCallback('saveNameToHighscoreAction', this.saveNameToHighscoreAction.bind(this));
		this.view.addCallback('applyNameToHighscoreAction', this.applyNameToHighscoreAction.bind(this));
		this.view.addCallback('resetHighscoreAction', this.resetHighscoreAction.bind(this));
		// options
		this.view.addCallback('setMusicAction', this.setMusicAction.bind(this));
		this.view.addCallback('setSoundAction', this.setSoundAction.bind(this));
		this.view.addCallback('setVRModeAction', this.setVRModeAction.bind(this));
		this.view.addCallback('nextLanguageAction', this.nextLanguageAction.bind(this));
		this.view.addCallback('previousLanguageAction', this.previousLanguageAction.bind(this));
	}


	navToGameAction() {
		//this.blockdestroyer.newGame();
		this.view.showGameView();
	}

	navToHighscoreAction() {
		this.view.showHighscoreView();
	}

	navToMenuAction() {
		this.view.showMenuView();
	}

	navToOptionsAction() {
		this.view.showOptionsView();
	}

	saveNameToHighscoreAction() {
		this.highscore.save();
	}

	applyNameToHighscoreAction(args) {
		this.highscore.applyName(args.content);
	}

	resetHighscoreAction() {
		this.highscore.reset();
	}

	setMusicAction() {
		this.options.music = !this.options.music;

		if (this.options.music) {
			this.sound.play('resources/music/track_01.mp3');
		} else {
			this.sound.stop();
		}
	}

	setSoundAction() {
		this.options.sound = !this.options.sound;
	}

	setVRModeAction() {
		this.options.vrMode = !this.options.vrMode;
	}

	nextLanguageAction() {
		this.options.setNextLanguage();

		this.config.loadLanguageFile(
			this.options.language,
			this.view.updateTextures.bind(this.view)
		);
	}

	previousLanguageAction() {
		this.options.setPreviousLanguage();

		this.config.loadLanguageFile(
			this.options.language,
			this.view.updateTextures.bind(this.view)
		);
	}
}

export default Controller;