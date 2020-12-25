import { NgModule } from '@angular/core';

import { SharedModule } from '@shared';
import { UserRoutingModule } from './user-routing.module';

import { UserDeletedComponent } from './user-deleted/user-deleted.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserComponent } from './user.component';

const COMPONENTS = [UserComponent, UserListComponent, UserDeletedComponent];

const COMPONENTS_NOROUNT = [];

@NgModule({
	imports: [SharedModule, UserRoutingModule],
	declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
	entryComponents: COMPONENTS_NOROUNT,
})
export class UserModule {}
