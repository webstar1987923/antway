import { TransactionType } from '../constants/transaction-type.constant';

export class Transaction {
	id: string;
	user_id: string;
	amount: number;
	contact: string;
	channel: string;
	account: string;
	type: TransactionType;
	description: string;
	status: string;
	processed_at: Date;
	payment_id: string;
	payment_status: string;
	payment_result: string;
	payment_amount: number;
	payment_currency: string;
	payment_rate: number;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date;

	constructor(value: any = {}) {
		if (value === null) {
			value = {};
		}
		this.id = value.id || null;
		this.user_id = value.user_id || null;
		this.amount = value.amount || null;
		this.contact = value.contact || null;
		this.channel = value.channel || null;
		this.account = value.account || null;
		this.type = value.type || null;
		this.description = value.description || null;
		this.status = value.status || 0;
		this.processed_at = value.processed_at || null;
		this.payment_id = value.payment_id || null;
		this.payment_status = value.payment_status || null;
		this.payment_result = value.payment_result || null;
		this.payment_amount = value.payment_amount || null;
		this.payment_currency = value.payment_currency || null;
		this.payment_rate = value.payment_rate || null;
		this.created_at = value.created_at || null;
		this.updated_at = value.updated_at || null;
		this.deleted_at = value.deleted_at || null;
	}
}
