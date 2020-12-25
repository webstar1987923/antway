import { Multilang } from './multilang.model';
import { User } from './user.model';
import { Viplog } from './viplog.model';

export class Company {
	id: string;
	name: Multilang;
	address: Multilang;
	phone: string;
	country_code: string;
	region_id: string;
	city_id: string;
	fax: string;
	second_domain: string;
	website: string;
	postal: string;
	mgmodel_id: number;
	stationery_members: number;
	manager: User;
	count_expos: number;
	status: number;
	stationerylog: Viplog;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date;

	constructor(value: any = {}) {
		if (value === null) {
			value = {};
		}
		this.id = value.id || null;
		this.name = new Multilang(value.name);
		this.address = new Multilang(value.address);
		this.country_code = value.country_code || null;
		this.region_id = value.region_id || null;
		this.city_id = value.city_id || null;
		this.phone = value.phone || null;
		this.fax = value.fax || null;
		this.second_domain = value.second_domain || null;
		this.website = value.website || null;
		this.postal = value.postal || null;
		this.mgmodel_id = value.mgmodel_id || null;
		this.stationery_members = value.stationery_members || null;
		this.manager = new User(value.manager);
		this.status = value.status || null;
		this.count_expos = value.count_expos || 0;
		this.stationerylog = new Viplog(value.stationerylog);
		this.created_at = value.created_at || null;
		this.updated_at = value.updated_at || null;
		this.deleted_at = value.deleted_at || null;
	}
}
