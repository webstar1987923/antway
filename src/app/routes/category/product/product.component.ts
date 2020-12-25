import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {
	NzFormatEmitEvent,
	NzTreeComponent,
	NzTreeNode,
} from 'ng-zorro-antd/tree';
import { tap } from 'rxjs/operators';
import * as _ from 'underscore';
import { ProductModalComponent } from './product-modal/product-modal.component';

@Component({
	selector: 'app-category-product',
	templateUrl: './product.component.html',
	styleUrls: ['./product.component.less'],
})
export class ProductComponent implements OnInit {
	@ViewChild('treeNodes', { static: true }) treeNodes: NzTreeComponent;
	list: any[] = [];

	constructor(
		private blkSrv: BlockUIService,
		private cdr: ChangeDetectorRef,
		private comSrv: CommonService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.getData();
	}

	getData() {
		this.blkSrv.setBlockStatus(true);
		this.comSrv.getCategory({ tag: 'product' }).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				console.log('product category list: ', res.data.list);
				this.list = [];
				this.cdr.detectChanges();
				this.list = res.data.list;
				this.list.forEach((element) => {
					element.key = element.id;
					element.title = element.name
						? (element.name.zh || '') +
						  ' | ' +
						  (element.name.en || '')
						: '';
					element.expanded = false;
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
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
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
				this.blkSrv.setBlockStatus(true);
				this.cdr.detectChanges();
				this.comSrv.deleteCategory(node.key).subscribe(
					() => {
						this.blkSrv.setBlockStatus(false);
						this.getData();
					},
					(err: HttpErrorResponse) => {
						this.blkSrv.setBlockStatus(false);
					},
				);
			},
		});
	}

	openCategoryModal(action: string = 'create', record: any = {}) {
		let value = {};
		if (action === 'edit') {
			value = {
				id: record.key,
				pid: record.getParentNode().key,
				name_zh: record.origin.name.zh,
				name_en: record.origin.name.en,
				companies: _.pluck(record.origin.companies, 'id'),
				assets: record.origin.assets,
			};
		} else if (record.key) {
			value = {
				pid: record.key,
			};
		}
		this.modal
			.create(
				ProductModalComponent,
				{ data: { record: value } },
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
			name: node.title,
			orders: siblingNodeOrder,
		};
		this.blkSrv.setBlockStatus(true);
		this.comSrv.updateCategory(value).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.getData();
				this.msgSrv.success(res.data.msg);
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}
}
