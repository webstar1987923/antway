import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFTransferWidgetSchema } from '@delon/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TransferSearchChange } from 'ng-zorro-antd/transfer';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as _ from 'underscore';

import { BlockUIService } from '../../../services/block-ui.service';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'app-member-binding',
	templateUrl: './member-binding.component.html',
})
export class MemberBindingComponent implements OnInit {
	loading = false;
	data: any = {};
	list: any[] = [];
	@ViewChild('sf', { static: false }) sf: SFComponent;
	schema: SFSchema;

	userObserver: any;
	userSubject = new Subject();

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: NzModalRef,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.schema = {
			properties: {
				users: {
					type: 'number',
					title: '公司员工',
					ui: {
						asyncData: () =>
							new Observable((observer) => {
								this.userObserver = observer;
							}),
						widget: 'transfer',
						showSearch: true,
						searchPlaceholder: '请输入用户名称',
						titles: ['选择', '已选'],
						listStyle: { height: '320px' },
						searchChange: (options: TransferSearchChange) => {
							if (options.direction === 'left') {
								this.getUsers(options.value);
							}
						},
					} as SFTransferWidgetSchema,
					default: [],
				},
			},
		};
		this.getData();

		this.userSubject.pipe(debounceTime(1000)).subscribe((searchText) => {
			this.comSrv
				.getUsers({
					name: searchText,
					pi: 1,
					ps: 10,
				})
				.subscribe(
					(res: any) => {
						const users = [];
						const bindedUsers = this.list.filter((element) =>
							this.sf.value.users.some(
								(item) => element.value === item,
							),
						);
						res.data.list.forEach((element) => {
							users.push({
								title:
									element.name.zh ||
									element.name.en ||
									element.email ||
									element.phone,
								value: element.id,
							});
						});
						console.log('list', this.list);
						console.log('bindedUsers', bindedUsers);
						console.log('users', users);
						console.log('this.sf.value.users', this.sf.value.users);
						this.list = _.uniq(
							bindedUsers.concat(users),
							(x) => x.value,
						);
						if (this.userObserver) {
							this.userObserver.next(this.list);
						}
					},
					(err: HttpErrorResponse) => {},
				);
		});
	}

	getUsers(searchText: string = ''): void {
		this.userSubject.next(searchText);
	}

	getData() {
		this.blkSrv.setBlockStatus(true);
		this.comSrv.getUsers({ company_id: this.data.record.id }).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.list = [];
				res.data.list.forEach((element) => {
					this.schema.properties.users.default.push(element.id);
					this.list.push({
						title:
							element.name.zh ||
							element.name.en ||
							element.email ||
							element.phone,
						value: element.id,
					});
				});
				this.sf.refreshSchema();
				if (this.userObserver) {
					this.userObserver.next(this.list);
				}
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	save(value: any) {
		console.log(value);
		this.loading = true;
		this.comSrv
			.updateCompany({
				id: this.data.record.id,
				users: value.users,
			})
			.subscribe((res: any) => {
				this.msgSrv.success('保存成功');
				this.modal.close(value);
				this.loading = false;
			});
	}

	close() {
		this.modal.destroy();
	}
}
