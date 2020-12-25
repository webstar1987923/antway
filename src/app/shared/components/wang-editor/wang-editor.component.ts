import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	Output,
	Renderer2,
} from '@angular/core';
import * as wangEditor from 'wangeditor';

@Component({
	selector: 'app-wang-editor',
	template: ` <div id="editorElem" style="text-align: left;"></div> `,
})
export class WangEditorComponent implements AfterViewInit {
	private editor: any;
	value = '';

	@Input()
	set content(val: any) {
		this.value = val;
		// if (this.editor) {
		// 	this.editor.txt.html(this.value);
		// }
	}
	@Output() contentChange = new EventEmitter<string>();

	constructor(private el: ElementRef, private renderer: Renderer2) {}

	ngAfterViewInit() {
		const editordom = this.el.nativeElement.querySelector('#editorElem');
		this.editor = new wangEditor(editordom);
		this.editor.customConfig.onchange = (html) => {
			this.contentChange.emit(html);
		};

		this.editor.customConfig.uploadImgServer = './api/common/fileupload';
		this.editor.customConfig.uploadFileName = 'file';
		this.editor.customConfig.menus = [
			'head',
			'bold',
			'fontSize',
			'fontName',
			'italic',
			'underline',
			'strikeThrough',
			'foreColor',
			'backColor',
			'link',
			'list',
			'justify',
			'quote',
			'emoticon',
			'image',
			'table',
			'code',
			'undo',
			'redo',
		];
		this.editor.customConfig.uploadImgHooks = {
			customInsert: (insertImg, result, editor) => {
				insertImg(result);
			},
		};
		this.editor.create();
		this.editor.txt.html(this.value);
	}
}
