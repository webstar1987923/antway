import { HttpErrorResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { STChange, STColumn, STComponent, STData } from '@delon/abc/st';
import { ModalHelper } from '@delon/theme';
import { BlockUIService } from '@shared';
import { CommonService } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';

import { VideoModalComponent } from '@shared';

@Component({
	selector: 'app-video',
	templateUrl: './video.component.html',
	styleUrls: ['./video.component.less'],
})
export class VideoComponent implements OnInit, OnDestroy {
	queryParams: any = {
		pi: 1,
		ps: 12,
		filter: '',
	};
	total = 0;
	list: any[] = [];

	constructor(
		private cdr: ChangeDetectorRef,
		private blkSrv: BlockUIService,
		private comSrv: CommonService,
		private modal: ModalHelper,
		private modalSrv: NzModalService,
		private msgSrv: NzMessageService,
		private route: ActivatedRoute,
	) {}

	ngOnInit() {
		this.getData();
	}

	ngOnDestroy() {}

	getData() {
		this.blkSrv.setBlockStatus(true);
		Object.entries(this.queryParams).forEach(([key, value]) => {
			this.queryParams[key] = value || '';
		});
		this.comSrv.getVideos({ ...this.queryParams }).subscribe(
			(res: any) => {
				this.blkSrv.setBlockStatus(false);
				console.log('video list', res);
				this.total = res.data.total;
				this.list = res.data.list;
				this.cdr.detectChanges();
			},
			(err: HttpErrorResponse) => {
				this.blkSrv.setBlockStatus(false);
			},
		);
	}

	pageIndexChange(pi) {
		this.queryParams.pi = pi;
		this.getData();
	}

	pageSizeChange(ps) {
		this.queryParams.ps = ps;
		this.getData();
	}

	remove(id?) {
		if (id) {
			this.modalSrv.confirm({
				nzTitle: '<strong>是否确定删除<strong>',
				nzOkType: 'danger',
				nzOnOk: () => {
					this.blkSrv.setBlockStatus(true);
					this.comSrv.deleteVideo(id).subscribe(
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
		} else {
			this.msgSrv.info('选择');
		}
	}

	changeRecommend(id: number, is_recommend: number = 1) {
		this.modalSrv.confirm({
			nzTitle: `<strong>是否确定${
				is_recommend ? '' : '取消'
			}推荐<strong>`,
			nzOkType: is_recommend ? 'primary' : 'danger',
			nzOnOk: () => {
				const postData = {
					id,
					is_recommend,
				};
				this.blkSrv.setBlockStatus(true);
				this.comSrv.updateVideo(postData).subscribe(
					(res: any) => {
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

	openModal(record: any = {}) {
		this.modal
			.create(VideoModalComponent, { data: { record } }, { size: 'md' })
			.subscribe((res) => {
				this.getData();
			});
	}

	reset() {
		// wait form reset updated finished
		setTimeout(() => this.getData());
	}
}
