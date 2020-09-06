class Highscore {
	constructor() {
		this.maxItems = 10;
		this.maxNameLength = 20;
		this.storageKey = 'highscoreXRacer';

		this.items = [];

		this.initItems();
		this.loadFromStorage();
	}

	initItems() {
		this.items = [];

		for (let i = 0; i < this.maxItems; ++i) {
			this.items.push({
				points: 0,
				name: '???'
			});
		}
	}

	initNewEntry(points, name) {
		this.currentInsertIndex = this.maxItems;

		this.items.push({
			points: points,
			name: name
		});

		for (let i = this.maxItems - 1; i >= 0; --i) {
			if (this.items[i].points < this.items[i + 1].points) {
				let temp = this.items[i];
				this.items[i] = this.items[i + 1];
				this.items[i + 1] = temp;

				this.currentInsertIndex = i;
			}
		}

		this.items.pop();
	}

	reset() {
		this.initItems();
		this.saveToStorage();
	}

	save() {
		this.saveToStorage();
	}

	loadFromStorage() {
		let itemsFromStorage = window.localStorage.getItem(this.storageKey);

		if (itemsFromStorage !== null) {
			try {
				this.items = JSON.parse(itemsFromStorage);
			} catch(e) {
				console.error('JSON parse error');
			}
		}
	}

	saveToStorage() {
		window.localStorage.setItem(this.storageKey, JSON.stringify(this.items));
	}
}

export default Highscore;