import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {
	NzFormatEmitEvent,
	NzTreeComponent,
	NzTreeNode,
} from 'ng-zorro-antd/tree';
import * as _ from 'underscore';
import { GeneralModalComponent } from './general-modal/general-modal.component';

@Component({
	selector: 'app-category-general',
	templateUrl: './general.component.html',
	styleUrls: ['./general.component.less'],
})
export class GeneralComponent implements OnInit {
	@ViewChild('treeNodes', { static: true }) treeNodes: NzTreeComponent;
	tag: string;
	level = 1;
	list: any[] = [];
	loading = false;

	constructor(
		private cdr: ChangeDetectorRef,
		private comSrv: CommonService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
		private route: ActivatedRoute,
	) {}

	ngOnInit() {
		if (this.route.snapshot.data.tag) {
			this.tag = this.route.snapshot.data.tag;
			if (this.tag === 'preference') {
				this.level = 2;
			}
			if (this.tag === 'expo_menu') {
				this.level = 2;
			}
			if (this.tag === 'expo_content') {
				this.level = 2;
			}
			if (this.tag === 'survey_seller') {
				this.level = 2;
			}
			if (this.tag === 'survey_buyer') {
				this.level = 2;
			}
		}
		this.getData();
	}

	getData() {
		this.loading = true;
		this.comSrv.getCategory({ tag: this.tag }).subscribe((res: any) => {
			this.loading = false;
			console.log('Category list: ', res.data.list);
			this.list = [];
			this.cdr.detectChanges();
			this.list = res.data.list;
			this.list.forEach((element) => {
				element.key = element.id;
				element.title = element.name
					? (element.name.zh || '') + ' | ' + (element.name.en || '')
					: '';
				element.expanded = false;
				element.isLeaf = this.level === 1;
				element.children = this.fetchChildren(element.children);
			});
			this.list = [
				{
					key: 0,
					title: '',
					expanded: true,
					children: this.list,
				},
			];
			this.cdr.detectChanges();
		});
	}

	fetchChildren(value) {
		value.forEach((item) => {
			item.key = item.id;
			item.title = item.name
				? (item.name.zh || '') + ' | ' + (item.name.en || '')
				: '';
			item.expanded = false;
			item.isLeaf = !item.children.length;
			item.children = this.fetchChildren(item.children);
		});
		return value;
	}

	remove(node) {
		this.modalSrv.confirm({
			nzTitle: '<strong>是否确定删除<strong>',
			nzContent: '删除后就无法挽回咯~',
			nzOkType: 'danger',
			nzOnOk: () => {
				this.loading = true;
				this.cdr.detectChanges();
				this.comSrv.deleteCategory(node.key).subscribe(() => {
					this.loading = false;
					this.getData();
				});
			},
		});
	}

	openCategoryModal(action: string = 'create', record: any = {}) {
		console.log(record);
		let value = {};
		if (action === 'edit') {
			value = {
				...record.origin,
				id: record.key,
				pid: record.getParentNode().key,
				name_zh: record.origin.name.zh,
				name_en: record.origin.name.en,
				// is_postable: record.origin.is_postable,
				// url: record.origin.url,
				// is_blank: record.origin.is_blank,
				// category_id: record.origin.category_id,
			};
		} else if (record.key) {
			value = {
				pid: record.key,
			};
		}
		this.modal
			.create(
				GeneralModalComponent,
				{ data: { record: value, tag: this.tag } },
				{ size: 'md' },
			)
			.subscribe((res) => {
				this.getData();
				this.cdr.detectChanges();
			});
	}

	nzOnDragEnd(data: NzTreeNode | NzFormatEmitEvent): void {
		let node;
		if (data instanceof NzTreeNode) {
			node = data;
		} else {
			node = data.node;
		}
		const siblingNodeOrder = _.pluck(node.getParentNode().children, 'key');
		console.log('siblingNodeOrder:', siblingNodeOrder);
		const value = {
			id: node.key,
			pid: node.getParentNode().key,
			orders: siblingNodeOrder,
		};
		this.loading = true;
		this.comSrv.updateCategory(value).subscribe((res: any) => {
			this.getData();
			this.msgSrv.success(res.data.msg);
		});
	}
}
