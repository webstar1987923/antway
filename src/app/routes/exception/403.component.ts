import { Component } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
	selector: 'exception-403',
	template: `
		<exception
			type="403"
			[desc]="'抱歉，你无权访问该页面<br>请联系后台负责人添加权限。'"
			style="min-height: 500px; height: 80%;"
		></exception>
	`,
})
export class Exception403Component {
	constructor(modalSrv: NzModalService) {
		modalSrv.closeAll();
	}
}
