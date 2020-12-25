import { Transaction } from './transaction.model';
export class Viplog {
	id: string;
	fromdate: Date;
	todate: Date;
	status: number;
	transaction: Transaction;

	constructor(value: any = {}) {
		if (value === null) {
			value = {};
		}
		this.id = value.id || null;
		this.fromdate = value.fromdate || null;
		this.todate = value.todate || null;
		this.status = value.status || 0;
		this.transaction = new Transaction(value.transaction);
	}
}
