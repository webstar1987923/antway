import { Multilang } from './multilang.model';
import { Viplog } from './viplog.model';

export class User {
	id: string;
	name: Multilang;
	gender: number;
	position: Multilang;
	phone_prefix: string;
	phone: string;
	email: string;
	wechat: string;
	qq: string;
	status_verified: number;
	status_writer: number;
	viplog: Viplog;
	last_login_time: Date;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date;

	constructor(value: any = {}) {
		if (value === null) {
			value = {};
		}
		this.id = value.id || null;
		this.name = new Multilang(value.name);
		this.gender = value.gender >= 0 ? value.gender : null;
		this.position = new Multilang(value.position);
		this.phone_prefix = value.phone_prefix || null;
		this.phone = value.phone || null;
		this.email = value.email || null;
		this.wechat = value.wechat || null;
		this.qq = value.qq || null;
		this.status_verified = value.status_verified || 0;
		this.status_writer = value.status_writer || 0;
		this.viplog = new Viplog(value.viplog);
		this.last_login_time = value.last_login_time || null;
		this.created_at = value.created_at || null;
		this.updated_at = value.updated_at || null;
		this.deleted_at = value.deleted_at || null;
	}
}
