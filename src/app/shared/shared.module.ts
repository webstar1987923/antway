import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DelonACLModule } from '@delon/acl';
import { DelonFormModule } from '@delon/form';
import { AlainThemeModule } from '@delon/theme';
import { TranslateModule } from '@ngx-translate/core';

import { SHARED_DELON_MODULES } from './shared-delon.module';
import { SHARED_ZORRO_MODULES } from './shared-zorro.module';

// #region third libs
import { AbmModule } from 'angular-baidu-maps';
import { CountdownModule } from 'ngx-countdown';
import { QuillModule } from 'ngx-quill';
import { SimplemdeModule } from 'ngx-simplemde';
import { NgxTinymceModule } from 'ngx-tinymce';

import { EmailModalComponent } from './components/email-modal/email-modal.component';
import { ExpoSelectComponent } from './components/expo-select/expo-select.component';
import { MessageModalComponent } from './components/message-modal/message-modal.component';
import { PayModalComponent } from './components/pay-modal/pay-modal.component';
import { PhoneEditorComponent } from './components/phone-editor/phone-editor.component';
import { ProductViewComponent } from './components/product-view/product-view.component';
import { ApplicantDataComponent } from './components/seller-view/applicant-data/applicant-data.component';
import { SellerViewComponent } from './components/seller-view/seller-view.component';
import { UserGoComponent } from './components/user-go/user-go.component';
import { UserModalComponent } from './components/user-modal/user-modal.component';
import { UserTransactionComponent } from './components/user-transaction/user-transaction.component';
import { ApplicantHistoryComponent } from './components/user-view/applicant-history/applicant-history.component';
import { BuyerApplicantComponent } from './components/user-view/buyer-applicant/buyer-applicant.component';
import { ContactListComponent } from './components/user-view/contact-list/contact-list.component';
import { MemberBindingComponent } from './components/user-view/member-binding/member-binding.component';
import { MemberListComponent } from './components/user-view/member-list/member-list.component';
import { UserViewComponent } from './components/user-view/user-view.component';
import { WriterModalComponent } from './components/user-view/writer-modal/writer-modal.component';
import { VideoModalComponent } from './components/video-modal/video-modal.component';
import { WangEditorComponent } from './components/wang-editor/wang-editor.component';

const THIRDMODULES = [
	AbmModule,
	CountdownModule,
	NgxTinymceModule,
	SimplemdeModule,
	QuillModule,
];
// #endregion

// #region your componets & directives
const COMPONENTS = [
	EmailModalComponent,
	UserModalComponent,
	UserViewComponent,
	ContactListComponent,
	BuyerApplicantComponent,
	WangEditorComponent,
	VideoModalComponent,
	PhoneEditorComponent,
	UserGoComponent,
	WriterModalComponent,
];

const COMPONENTS_NOROUNT = [
	EmailModalComponent,
	UserModalComponent,
	UserViewComponent,
	ContactListComponent,
	BuyerApplicantComponent,
	MessageModalComponent,
	WangEditorComponent,
	VideoModalComponent,
	UserTransactionComponent,
	ApplicantHistoryComponent,
	MemberListComponent,
	MemberBindingComponent,
	PayModalComponent,
	WriterModalComponent,
	ExpoSelectComponent,
	ProductViewComponent,
	ApplicantDataComponent,
	SellerViewComponent,
];
const DIRECTIVES = [];
// #endregion

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		ReactiveFormsModule,
		AlainThemeModule.forChild(),
		DelonACLModule,
		DelonFormModule,
		...SHARED_DELON_MODULES,
		...SHARED_ZORRO_MODULES,
		// third libs
		...THIRDMODULES,
	],
	declarations: [
		// your components
		...COMPONENTS,
		...COMPONENTS_NOROUNT,
		...DIRECTIVES,
	],
	entryComponents: COMPONENTS_NOROUNT,
	exports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule,
		AlainThemeModule,
		DelonACLModule,
		DelonFormModule,
		TranslateModule,
		...SHARED_DELON_MODULES,
		...SHARED_ZORRO_MODULES,
		// third libs
		...THIRDMODULES,
		// your components
		...COMPONENTS,
		...DIRECTIVES,
	],
})
export class SharedModule {}
