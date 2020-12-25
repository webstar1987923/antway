import { Component } from '@angular/core';

@Component({
	selector: 'app-seller-view',
	template: `
		<div class="modal-header">
			<div class="modal-title">参展详情</div>
		</div>
		<app-applicant-data [data]="data"></app-applicant-data>
	`,
})
export class SellerViewComponent {
	data: any = {};

	constructor() {}
}
