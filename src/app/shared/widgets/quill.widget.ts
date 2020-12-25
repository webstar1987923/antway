import { Component, OnInit } from '@angular/core';
import { ControlWidget } from '@delon/form';

@Component({
	selector: 'app-sf-quill',
	template: `
		<sf-item-wrap
			[id]="id"
			[schema]="schema"
			[ui]="ui"
			[showError]="showError"
			[error]="error"
			[showTitle]="schema.title"
		>
			<quill-editor
				[ngModel]="value"
				(ngModelChange)="change($event)"
			></quill-editor>
		</sf-item-wrap>
	`,
	styles: [
		`
			:host ueditor {
				line-height: normal;
			}
		`,
	],
})

// <ueditor [ngModel]="value" [config]="config" [loadingTip]="loading" [delay]="delay" (ngModelChange)="change($event)"> </ueditor>
export class QuillWidgetComponent extends ControlWidget implements OnInit {
	static readonly KEY = 'quill';

	config: {};
	loading: string;
	delay: number;

	ngOnInit(): void {
		this.loading = this.ui.loading || '加载中……';
		this.config = this.ui.config || {};
		this.delay = this.ui.delay || 300;
	}

	change(value: string) {
		if (this.ui.change) {
			this.ui.change(value);
		}
		this.setValue(value);
	}
}
