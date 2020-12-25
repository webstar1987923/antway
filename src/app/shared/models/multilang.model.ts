export class Multilang {
	zh: string;
	en: string;

	constructor(value: any = {}) {
		if (value === null) {
			value = {};
		}
		this.zh = value.zh || '';
		this.en = value.en || '';
	}
}
