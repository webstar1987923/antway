import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzFormatEmitEvent, NzTreeNode } from 'ng-zorro-antd/tree';
import * as _ from 'underscore';
import { TeamBindingComponent } from './team-binding/team-binding.component';
import { TeamModalComponent } from './team-modal/team-modal.component';

@Component({
	selector: 'app-team-layout',
	templateUrl: './team.component.html',
})
export class TeamComponent implements OnInit {
	queryParams: any = {
		pi: 1,
		ps: 10,
		roleId: '',
		sorter: '',
		status: null,
		statusList: [],
	};
	teams: any[] = [];
	selectedTeam: any = {};
	loading = false;
	admins: any[] = [];

	total = 0;
	list: any[] = [];
	status = [];
	@ViewChild('st', { static: true }) st: STComponent;
	columns: STColumn[] = [
		{ title: '', index: 'id', type: 'checkbox' },
		{ title: '账号', index: 'user_name' },
		{ title: '姓名', index: 'name' },
		{
			title: '角色',
			index: 'role',
			format: (item, _col) =>
				_.pluck(item.roles, 'name').join(', ') || '-',
		},
		{ title: '状态', index: 'status', render: 'status' },
	];
	selectedRows: STData[] = [];
	totalCallNo = 0;

	constructor(
		private cdr: ChangeDetectorRef,
		private comSrv: CommonService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.status = this.comSrv.adminStatus;
		this.refreshData();
	}

	refreshData() {
		const promise1 = new Promise((resolve) => {
			this.getTeams(resolve);
		});
		const promise2 = new Promise((resolve) => {
			this.getAdmins(resolve);
		});

		Promise.all([promise1, promise2]).then((values) => {
			this.processTeams();
		});
	}

	getTeams(resolve?) {
		this.comSrv.getTeams().subscribe((res: any) => {
			this.teams = res.data.list;
			if (resolve) {
				resolve();
			} else {
				this.processTeams();
			}
			this.cdr.detectChanges();
		});
	}

	fetchChildren(value) {
		value.forEach((element) => {
			element.key = element.id;
			element.title = element.name + ` (${element.admins.length}人)`;
			element.expanded = true;
			element.isLeaf = !element.children.length;
			element.children = this.fetchChildren(element.children);
			this.checkSelected(element);
		});
		return value;
	}

	processTeams() {
		this.teams = [
			{
				key: 0,
				title: `所有员工 (${this.admins.length}人)`,
				name: '所有员工',
				expanded: true,
				children: this.fetchChildren(this.teams),
				admins: this.admins,
			},
		];
		this.checkSelected(this.teams[0]);
	}

	checkSelected(value) {
		if (this.selectedTeam.id === value.id) {
			this.selectedTeam = value;
		}
	}

	selectTeam(data: NzTreeNode | NzFormatEmitEvent): void {
		let node;
		if (data instanceof NzTreeNode) {
			node = data;
		} else {
			node = data.node;
		}
		this.selectedTeam = node.origin;
		this.cdr.detectChanges();
	}

	openTeamModal(record: any = {}) {
		console.log(this.teams);
		this.modal
			.create(
				TeamModalComponent,
				{ data: { record, teams: this.teams } },
				{ size: 'md' },
			)
			.subscribe((res) => {
				this.getTeams();
				this.cdr.detectChanges();
			});
	}

	deleteTeam(id) {
		this.modalSrv.confirm({
			nzTitle: '<strong>是否确定删除<strong>',
			nzContent: '删除后就无法挽回咯~',
			nzOkType: 'danger',
			nzOnOk: () => {
				this.loading = true;
				this.comSrv.deleteTeam(id).subscribe(
					() => {
						this.loading = false;
						this.selectedTeam = {};
						this.getTeams();
					},
					(err: HttpErrorResponse) => {
						this.loading = false;
					},
				);
			},
		});
	}

	getAdmins(resolve) {
		this.loading = true;
		this.comSrv.getAdmins().subscribe((res: any) => {
			this.loading = false;
			this.admins = res.data.list;
			resolve();
			console.log('All admins:', this.admins);
		});
	}

	stChange(e: STChange) {
		switch (e.type) {
			case 'checkbox':
				this.selectedRows = e.checkbox;
				this.totalCallNo = this.selectedRows.reduce(
					(total, cv) => total + cv.callNo,
					0,
				);
				this.cdr.detectChanges();
				break;
			case 'filter':
				break;
			case 'pi':
				this.queryParams.pi = e.pi;
				break;
			case 'ps':
				this.queryParams.ps = e.ps;
				break;
		}
	}

	openTeamBinding() {
		this.modal
			.create(
				TeamBindingComponent,
				{
					data: {
						record: this.selectedTeam,
						allEmployee: this.admins,
						list: this.selectedTeam.admins,
					},
				},
				{ size: 900 },
			)
			.subscribe((res) => {
				this.getTeams();
			});
	}
}
