import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-phone-editor',
	template: `
		<input
			type="text"
			nz-input
			nzSize="small"
			[(ngModel)]="data[0]"
			(ngModelChange)="change()"
			name="company_phone_0"
			required
			style="width: 40px"
		/>
		<input
			type="text"
			nz-input
			nzSize="small"
			[(ngModel)]="data[1]"
			(ngModelChange)="change()"
			name="company_phone_1"
			required
			style="width: 40px; text-align: center"
		/>
		<input
			type="text"
			disabled
			nz-input
			nzSize="small"
			placeholder="-"
			style="
		width: 20px;
		border-left: 0px;
		pointer-events: none;
		background-color: rgb(255, 255, 255);
	"
		/>
		<input
			type="text"
			nz-input
			nzSize="small"
			[(ngModel)]="data[2]"
			(ngModelChange)="change()"
			name="company_phone_2"
			required
			style="width: 75px; text-align: center; border-left: 0px"
		/>
		<input
			type="text"
			disabled
			nz-input
			nzSize="small"
			placeholder="-"
			style="
		width: 20px;
		border-left: 0px;
		pointer-events: none;
		background-color: rgb(255, 255, 255);
	"
		/>
		<input
			type="text"
			nz-input
			nzSize="small"
			[(ngModel)]="data[3]"
			(ngModelChange)="change()"
			name="company_phone_3"
			required
			style="width: 60px; text-align: center; border-left: 0px"
		/>
	`,
})
export class PhoneEditorComponent {
	public data: string[] = [];

	@Input()
	set content(val: any) {
		const temp = (val || '').replace('+', '').split('-');
		this.data = [];
		for (let idx = 0; idx < 4; idx++) {
			this.data.push(temp[idx] || '');
		}
	}
	@Output() contentChange = new EventEmitter<string>();

	constructor() {}

	change() {
		this.contentChange.emit(this.data.join('-'));
	}
}
