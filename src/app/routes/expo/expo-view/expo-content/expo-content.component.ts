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
import { ExpoService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-expo-content',
	templateUrl: './expo-content.component.html',
})
export class ExpoContentComponent implements OnInit, OnDestroy {
	contentTypes: any[] = [];
	openMap: { [name: string]: boolean } = {
		sub1: false,
		sub2: false,
	};
	selectedType;

	loading = false;
	expo: any = {};
	expoSubscription: Subscription;

	selectedDescriptionTab = 0;
	descriptionTabs: string[] = [
		'PC端-中文',
		'PC端-英文',
		'移动端-中文',
		'移动端-英文',
	];
	descriptions: string[] = [];
	showEditor = false; // This is hard coding to reload wangeditor

	constructor(
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private expoSrv: ExpoService,
		private msgSrv: NzMessageService,
	) {}

	ngOnInit() {
		this.expoSubscription = this.expoSrv
			.getExpoUpdates()
			.subscribe((expo) => {
				this.expo = expo;
				if (this.contentTypes.length) {
					this.refresh();
				}
			});
		this.contentTypes = this.comSrv.getCommonData().expoContentCategories;
		this.selectedType = this.contentTypes.length
			? this.contentTypes[0]
			: null;
	}

	ngOnDestroy() {
		this.expoSubscription.unsubscribe();
	}

	processExpoContentCategory(value) {
		value.forEach((element) => {
			element.value = element.id;
			element.label = element.name.zh;
			element.children = this.processExpoContentCategory(
				element.children,
			);
		});
		return value;
	}

	refresh() {
		this.showEditor = false;
		if (
			this.expo &&
			this.expo.contents &&
			this.expo.contents[this.selectedType.value]
		) {
			this.descriptions = [
				this.expo.contents[this.selectedType.value].pc_zh || '',
				this.expo.contents[this.selectedType.value].pc_en || '',
				this.expo.contents[this.selectedType.value].mobile_zh || '',
				this.expo.contents[this.selectedType.value].mobile_en || '',
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
			id: this.expo.id,
			content_type: this.selectedType.value,
			pc_zh: this.descriptions[0],
			pc_en: this.descriptions[1],
			mobile_zh: this.descriptions[2],
			mobile_en: this.descriptions[3],
		};

		this.comSrv.updateExpo(postData).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				this.msgSrv.success(res.data.msg);
				this.expoSrv.setExpo(res.data.rlt);
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
