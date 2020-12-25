import { Component, Input } from '@angular/core';
import { ModalHelper } from '@delon/theme';
import { UserViewComponent } from '../user-view/user-view.component';

@Component({
	selector: 'app-user-go',
	template: `
		<a (click)="openUserView()">
			{{ data.name?.zh || data.name?.en || '-' }}</a
		>
	`,
})
export class UserGoComponent {
	@Input() data;

	constructor(private modal: ModalHelper) {}

	openUserView() {
		this.modal
			.create(
				UserViewComponent,
				{ data: { record: this.data } },
				{ size: 1240, includeTabs: true },
			)
			.subscribe((res) => {});
	}
}
