import { NgModule } from '@angular/core';
import { DelonFormModule, WidgetRegistry } from '@delon/form';
import { SharedModule } from '../shared.module';

import { MarkdownWidget } from '../widgets/markdown.widget';
import { QuillWidgetComponent } from '../widgets/quill.widget';
// import { TinymceWidget } from './widgets/tinymce/tinymce.widget';
// import { UeditorWidget } from './widgets/ueditor.widget';

export const SCHEMA_THIRDS_COMPONENTS = [
	MarkdownWidget,
	QuillWidgetComponent,
	// TinymceWidget,
	// UeditorWidget
];

@NgModule({
	declarations: SCHEMA_THIRDS_COMPONENTS,
	entryComponents: SCHEMA_THIRDS_COMPONENTS,
	imports: [SharedModule, DelonFormModule.forRoot()],
	exports: [...SCHEMA_THIRDS_COMPONENTS],
})
export class JsonSchemaModule {
	constructor(widgetRegistry: WidgetRegistry) {
		widgetRegistry.register(MarkdownWidget.KEY, MarkdownWidget);
		widgetRegistry.register(QuillWidgetComponent.KEY, QuillWidgetComponent);
		// widgetRegistry.register(TinymceWidget.KEY, TinymceWidget);
		// widgetRegistry.register(UeditorWidget.KEY, UeditorWidget);
	}
}
