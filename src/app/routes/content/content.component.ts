import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-content',
	templateUrl: './content.component.html',
})
export class ContentComponent implements OnInit, OnDestroy {
	contentTypes: any[] = [
		{
			label: '蚂蚁街是谁',
			value: 'about_us',
		},
		{
			label: '联系我们',
			value: 'contact_us',
		},
		{
			label: '加入我们',
			value: 'join_us',
		},
		{
			label: '服务条款',
			value: 'terms',
		},
		{
			label: '隐私条款',
			value: 'privacy_policy',
		},
		{
			label: '使用帮助',
			value: 'help',
		},
	];
	selectedType = this.contentTypes[0];

	loading = false;
	contents: any = {};

	selectedDescriptionTab = 0;
	descriptionTabs: string[] = [
		'PC端-中文',
		'PC端-英文',
		'移动端-中文',
		'移动端-英文',
	];
	descriptions: string[] = [];
	showEditor = true; // This is hard coding to reload wangeditor

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.blkSrv.setBlockStatus(true);
		this.comSrv.getSiteContents().subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.contents = res.data.list;
				this.refresh();
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	ngOnDestroy() {}

	refresh() {
		this.showEditor = false;
		if (this.contents[this.selectedType.value]) {
			this.descriptions = [
				this.contents[this.selectedType.value].pc_zh || '',
				this.contents[this.selectedType.value].pc_en || '',
				this.contents[this.selectedType.value].mobile_zh || '',
				this.contents[this.selectedType.value].mobile_en || '',
			];
		} else {
			this.descriptions = ['', '', '', ''];
		}
		setTimeout(() => {
			this.showEditor = true;
		});
	}

	save() {
		this.blkSrv.setBlockStatus(true);
		const postData = {
			content_type: this.selectedType.value,
			pc_zh: this.descriptions[0],
			pc_en: this.descriptions[1],
			mobile_zh: this.descriptions[2],
			mobile_en: this.descriptions[3],
		};

		this.comSrv.updateSiteContent(postData).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success(res.data.msg);
				this.contents[res.data.rlt.type] = res.data.rlt;
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	openHandler(contentType: any): void {
		if (contentType.children && contentType.children.length) {
			this.contentTypes.forEach((element) => {
				if (element.value !== contentType.value) {
					element.isOpen = false;
				}
			});
		}
		if (!(contentType.children && contentType.children.length)) {
			this.selectedType = contentType;
			this.refresh();
		}
	}
}
