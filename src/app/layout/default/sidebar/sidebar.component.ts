import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnInit,
} from '@angular/core';
import { SettingsService } from '@delon/theme';

@Component({
	selector: 'layout-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit {
	searchToggleStatus: boolean;
	@Input() isCollapsed: boolean;

	constructor(public settings: SettingsService) {}

	ngOnInit() {
		this.isCollapsed = this.settings.layout.collapsed;
	}

	toggleCollapsedSidebar() {
		this.settings.setLayout('collapsed', !this.settings.layout.collapsed);
	}

	searchToggleChange() {
		this.searchToggleStatus = !this.searchToggleStatus;
	}
}
