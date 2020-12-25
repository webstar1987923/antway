import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { BehaviorSubject } from 'rxjs';

import { getJsDateFromExcel } from 'excel-date-to-js';
import * as moment from 'moment';
@Injectable({
	providedIn: 'root',
})
export class CommonService {
	private commonDataSubject: BehaviorSubject<any> = new BehaviorSubject({
		mgmodels: [],
		countries: [],
		chinaRegions: [],
		units: [],
		newsCategories: [],
		newsTags: [],
		adsCategories: [],
		expoContentCategories: [],
		pastExpoContentCategories: [],
		productCategories: [],
		vips: [],
		admins: [],
		areaTypes: [],
		expoes: [],
	});

	public industry_news_id = 11;
	public adminStatus = [
		{
			index: 0,
			text: '启用',
			label: '启用',
			value: false,
			color: 'green',
			checked: false,
		},
		{
			index: 1,
			text: '禁用',
			label: '禁用',
			value: false,
			color: 'grey',
			checked: false,
		},
	];

	public userStatus = [
		{
			index: 0,
			text: '未认证',
			label: '未认证',
			value: false,
			color: 'grey',
			checked: false,
		},
		{
			index: 1,
			text: '已认证',
			label: '已认证',
			value: false,
			color: 'green',
			checked: false,
		},
		{
			index: 2,
			text: '审核中',
			label: '审核中',
			value: false,
			color: 'red',
			checked: false,
		},
		{
			index: 3,
			text: 'VIP会员',
			label: 'VIP会员',
			value: false,
			color: 'blue',
			checked: false,
		},
		{
			index: 4,
			text: '文具通会员',
			label: '文具通会员',
			value: false,
			color: 'purple',
			checked: false,
		},
	];
	public userVerifyStatus = [
		{
			index: 0,
			text: '未认证',
			label: '未认证',
			value: 0,
			color: 'grey',
			checked: false,
		},
		{
			index: 1,
			text: '审核中',
			label: '审核中',
			value: 1,
			color: 'red',
			checked: false,
		},
		{
			index: 1,
			text: '已认证',
			label: '已认证',
			value: 2,
			color: 'green',
			checked: false,
		},
	];

	public writerStatus = [
		{
			label: '未认证',
			text: '未认证',
			value: 0,
			color: 'grey',
			checked: false,
		},
		{
			label: '审核中',
			text: '审核中',
			value: 1,
			color: 'red',
			checked: false,
		},
		{
			label: '已认证',
			text: '已认证',
			value: 2,
			color: 'green',
			checked: false,
		},
	];
	public companyVerifyStatus = [
		{
			index: 0,
			text: '未通过',
			label: '未通过',
			value: 0,
			color: 'red',
			checked: false,
		},
		{
			index: 1,
			text: '审核中',
			label: '审核中',
			value: 1,
			color: 'grey',
			checked: false,
		},
		{
			index: 2,
			text: '已认证',
			label: '已认证',
			value: 2,
			color: 'green',
			checked: false,
		},
	];

	public companyActiveStatus = [
		{
			label: '正常',
			value: 0,
			color: 'green',
			checked: false,
		},
		{
			label: '警告',
			value: 1,
			color: 'yellow',
			checked: false,
		},
		{
			label: '禁止',
			value: 2,
			color: 'red',
			checked: false,
		},
	];

	public vipStatus = [
		{
			text: '未提交',
			label: '未提交',
			value: 0,
			color: 'grey',
			checked: false,
		},
		{
			text: '审核中',
			label: '审核中',
			value: 1,
			color: 'yellow',
			checked: false,
		},
		{
			text: '通过',
			label: '通过',
			value: 2,
			color: 'green',
			checked: false,
		},
		{
			text: '不通过',
			label: '不通过',
			value: 3,
			color: 'red',
			checked: false,
		},
		{
			text: '已过期',
			label: '已过期',
			value: 4,
			color: 'purple',
			checked: false,
		},
	];

	public intention: any[] = [
		{ value: 1, label: '无意向' },
		{ value: 2, label: '一般' },
		{ value: 3, label: '强烈' },
		{ value: 4, label: '意向参展' },
	];

	public productStatus = [
		{ label: '待审核', value: 0, color: 'grey', checked: false },
		{ label: '已通过', value: 1, color: 'green', checked: false },
		{ label: '未通过', value: 2, color: 'red', checked: false },
	];

	public productSellingStatus = [
		{ label: '上架', value: 0, color: 'grey', checked: false },
		{ label: '下架', value: 1, color: 'red', checked: false },
	];

	public pindanStatus = [
		{ label: '拼单中', value: 0, color: 'grey', checked: false },
		{ label: '成功', value: 1, color: 'green', checked: false },
		{ label: '未成功', value: 2, color: 'red', checked: false },
	];

	public gender = {
		zh: [
			{ value: 0, label: '先生' },
			{ value: 1, label: '夫人' },
			{ value: 2, label: '女士' },
			{ value: 3, label: '小姐' },
		],
		en: [
			{ value: 0, label: 'Mr.' },
			{ value: 1, label: 'Mrs.' },
			{ value: 2, label: 'Ms.' },
			{ value: 3, label: 'Miss' },
		],
	};

	public gender_zh_dict = {
		先生: 0,
		夫人: 1,
		女士: 2,
		小姐: 3,
	};

	public expoStatus = [
		{
			value: 0,
			text: '参展中',
			label: '参展中',
			color: 'grey',
			checked: false,
		},
		{
			value: 1,
			text: '举办中',
			label: '举办中',
			color: 'blue',
			checked: false,
		},
		{
			value: 2,
			text: '已完成',
			label: '已完成',
			color: 'green',
			checked: false,
		},
		{
			value: 3,
			text: '没准备',
			label: '没准备',
			color: 'green',
			checked: false,
		},
	];

	public expoSellerStatus = [
		{
			value: 0,
			text: '输入基本数据',
			label: '输入基本数据',
			color: 'grey',
			checked: false,
		},
		{
			value: 1,
			text: '输入问答',
			label: '输入问答',
			color: 'orange',
			checked: false,
		},
		{
			value: 2,
			text: '待审核',
			label: '待审核',
			color: 'purple',
			checked: false,
		},
		{
			value: 3,
			text: '通过',
			label: '通过',
			color: 'green',
			checked: false,
		},
		{
			value: 4,
			text: '未通过',
			label: '未通过',
			color: 'red',
			checked: false,
		},
	];

	public expoSellerChecked = [
		{
			value: 0,
			text: '待审核',
			label: '待审核',
			color: 'grey',
			checked: false,
		},
		{
			value: 1,
			text: '通过',
			label: '通过',
			color: 'green',
			checked: false,
		},
		{
			value: 2,
			text: '未通过',
			label: '未通过',
			color: 'red',
			checked: false,
		},
	];

	public hallStatus = [
		{ value: 0, label: '空闲', color: 'grey', checked: false },
		{ value: 1, label: '保护中', color: 'yellow', checked: false },
		{ value: 2, label: '已支付', color: 'green', checked: false },
	];

	public expoBuyerStatus = [
		{
			value: 0,
			text: '输入基本数据',
			label: '输入基本数据',
			color: 'grey',
			checked: false,
		},
		{
			value: 1,
			text: '输入问答',
			label: '输入问答',
			color: 'orange',
			checked: false,
		},
		{
			value: 2,
			text: '待审核',
			label: '待审核',
			color: 'purple',
			checked: false,
		},
		{
			value: 3,
			text: '通过',
			label: '通过',
			color: 'green',
			checked: false,
		},
		{
			value: 4,
			text: '未通过',
			label: '未通过',
			color: 'red',
			checked: false,
		},
	];

	public expoBuyerChecked = [
		{
			value: 0,
			text: '待审核',
			label: '待审核',
			color: 'grey',
			checked: false,
		},
		{
			value: 1,
			text: '通过',
			label: '通过',
			color: 'green',
			checked: false,
		},
		{
			value: 2,
			text: '未通过',
			label: '未通过',
			color: 'red',
			checked: false,
		},
	];

	public expoBuyerResultStatus = [
		{
			value: 0,
			text: '未参观',
			label: '未参观',
			color: 'red',
			checked: false,
		},
		{
			value: 1,
			text: '已参观',
			label: '已参观',
			color: 'green',
			checked: false,
		},
	];

	public expoBuyerBusStatus = [
		{
			value: 0,
			text: '审核中',
			label: '审核中',
			color: 'yellow',
			checked: false,
		},
		{
			value: 1,
			text: '已完成',
			label: '已完成',
			color: 'green',
			checked: false,
		},
		{
			value: 2,
			text: '未通过',
			label: '未通过',
			color: 'red',
			checked: false,
		},
	];

	public expoBadgeStatus = [
		{
			value: 0,
			text: '未处理',
			label: '未处理',
			color: 'red',
			checked: false,
		},
		{
			value: 1,
			text: '已完成',
			label: '已完成',
			color: 'green',
			checked: false,
		},
	];

	public expoDeviceStatus = [
		{
			value: 0,
			text: '未处理',
			label: '未处理',
			color: 'red',
			checked: false,
		},
		{
			value: 1,
			text: '已完成',
			label: '已完成',
			color: 'green',
			checked: false,
		},
	];

	public expoWaterStatus = [
		{
			value: 0,
			text: '未处理',
			label: '未处理',
			color: 'red',
			checked: false,
		},
		{
			value: 1,
			text: '已完成',
			label: '已完成',
			color: 'green',
			checked: false,
		},
	];

	public expoLintelStatus = [
		{
			value: 0,
			text: '未处理',
			label: '未处理',
			color: 'red',
			checked: false,
		},
		{
			value: 1,
			text: '已完成',
			label: '已完成',
			color: 'green',
			checked: false,
		},
	];

	public expoAdsStatus = [
		{
			value: 0,
			text: '未处理',
			label: '未处理',
			color: 'red',
			checked: false,
		},
		{
			value: 1,
			text: '已完成',
			label: '已完成',
			color: 'green',
			checked: false,
		},
	];

	public expoProceedStatus = [
		{
			value: 0,
			text: '未处理',
			label: '未处理',
			color: 'red',
			checked: false,
		},
		{
			value: 1,
			text: '已完成',
			label: '已完成',
			color: 'green',
			checked: false,
		},
	];

	public activityType = [
		{
			value: 0,
			label: '线上',
			db: 'online',
			color: 'green',
			checked: false,
		},
		{
			value: 1,
			label: '离线',
			db: 'offline',
			color: 'red',
			checked: false,
		},
	];

	public activityStatus = [
		{ value: 0, label: '未开始', color: 'grey', checked: false },
		{ value: 1, label: '进行中', color: 'red', checked: false },
		{ value: 2, label: '已结束', color: 'green', checked: false },
	];

	public activitySignupUserType = [
		{ value: 0, label: '全部', color: 'grey', checked: false },
		{ value: 1, label: '认证会员', color: 'red', checked: false },
		{ value: 2, label: 'VIP会员', color: 'green', checked: false },
		{ value: 3, label: '文具通会员', color: 'purple', checked: false },
	];

	public articleStatus = [
		{ value: 0, label: '草稿', color: 'grey', checked: false },
		{ value: 1, label: '审核中', color: 'grey', checked: false },
		{ value: 2, label: '通过', color: 'green', checked: false },
		{ value: 3, label: '未通过', color: 'red', checked: false },
	];

	public discoverStatus = [
		{ value: 0, label: '草稿', color: 'grey', checked: false },
		{ value: 1, label: '审核中', color: 'grey', checked: false },
		{ value: 2, label: '通过', color: 'green', checked: false },
		{ value: 3, label: '未通过', color: 'red', checked: false },
	];

	public specialNews: any[] = [
		{
			label: '展会新闻',
			value: 'expo_news',
		},
		{
			label: '行业动态',
			value: 'industry_news',
		},
	];

	public adsSpaceApplicantStatus = [
		{
			value: 0,
			text: '未支付',
			label: '未支付',
			color: 'grey',
			checked: false,
		},
		{
			value: 1,
			text: '处理中',
			label: '处理中',
			color: 'yellow',
			checked: false,
		},
		{
			value: 2,
			text: '待处理',
			label: '待处理',
			color: 'red',
			checked: false,
		},
		{
			value: 3,
			text: '已完成',
			label: '已完成',
			color: 'green',
			checked: false,
		},
	];

	public siteAdsType = [
		{
			value: 0,
			text: 'PC端',
			label: 'PC端',
			color: 'grey',
			checked: false,
		},
		{
			value: 1,
			text: '移动端',
			label: '移动端',
			color: 'yellow',
			checked: false,
		},
	];

	public channelType = {
		1: '支付宝',
		2: 'paypal',
	};

	public currencyType = {
		CNY: '￥',
		USD: '$',
	};

	public transactionStatus = [
		{
			value: 0,
			label: '审核中',
			text: '审核中',
			color: 'grey',
			checked: false,
		},
		{
			value: 1,
			label: '通过',
			text: '通过',
			color: 'green',
			checked: false,
		},
		{
			value: 2,
			label: '未通过',
			text: '未通过',
			color: 'red',
			checked: false,
		},
	];

	public promotionStatus = [
		{ label: '申请中', value: 0, color: 'grey', checked: false },
		{ label: '注册', value: 1, color: 'purple', checked: false },
		{ label: '成功', value: 2, color: 'green', checked: false },
	];

	constructor(private _httpClient: _HttpClient) {}

	excel2Date(value) {
		if (!value) {
			return null;
		}
		if (isNaN(value)) {
			if (moment(value).isValid()) {
				return moment(value).format('YYYY/MM/DD');
			} else {
				return value;
			}
		} else if (value > 0) {
			return moment(getJsDateFromExcel(value)).format('YYYY/MM/DD');
		}
		return null;
	}

	// Common data service
	setCommonData(data) {
		this.commonDataSubject.next(data);
	}

	setCommonDataVariable(data) {
		const commonData = this.commonDataSubject.getValue();
		for (const field of Object.keys(data)) {
			commonData[field] = data[field];
		}
		this.commonDataSubject.next(commonData);
	}

	getCommonData() {
		return this.commonDataSubject.getValue();
	}

	getCommonDataUpdates() {
		return this.commonDataSubject.asObservable();
	}

	// Common apis
	getCommonList() {
		return this._httpClient.get(`api/common/list`);
	}

	// Auth apis
	adminLogin(body) {
		return this._httpClient.post(`api/auth/adminLogin`, body);
	}

	getCaptcha() {
		return this._httpClient.get(`api/auth/getCaptcha`);
	}

	// Admin apis
	createAdmin(body) {
		return this._httpClient.post('api/admin/store', body);
	}

	getAdmins(queryParams?) {
		return this._httpClient.get('api/admin', queryParams);
	}

	updateAdmin(body) {
		return this._httpClient.post('api/admin/update', body);
	}

	changeAdminStatus(body) {
		return this._httpClient.post('api/admin/status', body);
	}

	deleteAdmin(ids) {
		return this._httpClient.post(`api/admin/delete`, { ids });
	}

	// User apis
	createUser(body) {
		return this._httpClient.post('api/user/store', body);
	}

	importUsers(body) {
		return this._httpClient.post('api/user/import', body);
	}

	getUsers(queryParams?) {
		return this._httpClient.get('api/user', queryParams);
	}

	getUser(id) {
		return this._httpClient.get(`api/user/${id}`);
	}

	updateUser(body) {
		return this._httpClient.post('api/user/update', body);
	}

	changeUserPassword(body) {
		return this._httpClient.post('api/user/password', body);
	}

	changeUserPhone(body) {
		return this._httpClient.post('api/user/phone', body);
	}

	changeUserEmail(body) {
		return this._httpClient.post('api/user/email', body);
	}

	changeUserVerifyStatus(body) {
		return this._httpClient.post('api/user/verify_status', body);
	}

	changeUserVip(body) {
		return this._httpClient.post('api/user/vip', body);
	}

	changeUserWriterStatus(body) {
		return this._httpClient.post('api/user/writer_status', body);
	}

	changeUserStationery(body) {
		return this._httpClient.post('api/user/stationery', body);
	}

	changeUserStationeryMembers(body) {
		return this._httpClient.post('api/user/stationery_members', body);
	}

	deleteUser(ids) {
		return this._httpClient.post(`api/user/delete`, { ids });
	}

	restoreUser(ids) {
		return this._httpClient.post(`api/user/restore`, { ids });
	}

	// Writer apis
	createWriter(body) {
		return this._httpClient.post('api/writer/store', body);
	}

	getWriters(queryParams?) {
		return this._httpClient.get('api/writer', queryParams);
	}

	getWriter(id) {
		return this._httpClient.get(`api/writer/${id}`);
	}

	updateWriter(body) {
		return this._httpClient.post('api/writer/update', body);
	}

	recommendWriters(ids) {
		return this._httpClient.post(`api/writer/recommend`, { ids });
	}

	deleteWriter(ids) {
		return this._httpClient.post(`api/writer/delete`, { ids });
	}

	// World map apis
	getCountries(queryParams?) {
		return this._httpClient.get(`api/countries`, queryParams || {});
	}

	getRegions(queryParams?) {
		return this._httpClient.get(`api/regions`, queryParams || {});
	}

	// Category apis
	createCategory(body) {
		return this._httpClient.post('api/category/store', body);
	}

	getCategory(queryParams: any = {}) {
		return this._httpClient.get('api/category', queryParams);
	}

	updateCategory(body) {
		return this._httpClient.post('api/category/update', body);
	}

	deleteCategory(ids) {
		return this._httpClient.post(`api/category/delete`, { ids });
	}

	// Permission module apis
	createPermissionModule(body) {
		return this._httpClient.post('api/permission_module/store', body);
	}

	getPermissionModule() {
		return this._httpClient.get('api/permission_module');
	}

	updatePermissionModule(body) {
		return this._httpClient.post('api/permission_module/update', body);
	}

	deletePermissionModule(ids) {
		return this._httpClient.post(`api/permission_module/delete`, { ids });
	}

	// Permission apis
	createPermission(body) {
		return this._httpClient.post('api/permission_admin/store', body);
	}
	getAdminPermissions(queryParams: any = {}) {
		return this._httpClient.get('api/permission_admin', queryParams);
	}

	updatePermission(body) {
		return this._httpClient.post('api/permission_admin/update', body);
	}

	deletePermission(ids) {
		return this._httpClient.post(`api/permission_admin/delete`, { ids });
	}

	changePermissionStatus(body) {
		return this._httpClient.post(`api/permission_admin/status`, body);
	}

	// Permission group apis
	createPermissionGroup(body) {
		return this._httpClient.post('api/permission_group/store', body);
	}

	updatePermissionGroup(body) {
		return this._httpClient.post('api/permission_group/update', body);
	}

	deletePermissionGroup(ids) {
		return this._httpClient.post(`api/permission_group/delete`, { ids });
	}

	// Role apis
	createRole(body) {
		return this._httpClient.post('api/role/store', body);
	}

	getRoles() {
		return this._httpClient.get('api/role');
	}

	updateRole(body) {
		return this._httpClient.post('api/role/update', body);
	}

	deleteRole(ids) {
		return this._httpClient.post(`api/role/delete`, { ids });
	}

	// Role apis
	createTeam(body) {
		return this._httpClient.post('api/team/store', body);
	}

	getTeams() {
		return this._httpClient.get('api/team');
	}

	updateTeam(body) {
		return this._httpClient.post('api/team/update', body);
	}

	deleteTeam(ids) {
		return this._httpClient.post(`api/team/delete`, { ids });
	}

	// Company apis
	getCompanies(queryParams: any = {}) {
		return this._httpClient.get('api/company', queryParams);
	}

	updateCompany(body) {
		return this._httpClient.post('api/company/update', body);
	}

	changeCompanyVerifyStatus(body) {
		return this._httpClient.post('api/company/verify_status', body);
	}

	recommendCompanies(ids) {
		return this._httpClient.post(`api/company/recommend`, { ids });
	}

	// Mgmodel apis
	getMgmodels() {
		return this._httpClient.get('api/mgmodel');
	}

	// Email controller
	sendEmail(body) {
		return this._httpClient.post('api/email/store', body);
	}

	// Product apis
	createProduct(body) {
		return this._httpClient.post('api/product/store', body);
	}

	getProducts(queryParams?) {
		return this._httpClient.get('api/product', queryParams);
	}

	getProduct(id) {
		return this._httpClient.get(`api/product/${id}`);
	}

	updateProduct(body) {
		return this._httpClient.post('api/product/update', body);
	}

	recommendProducts(ids) {
		return this._httpClient.post(`api/product/recommend`, {
			ids,
		});
	}

	deleteProduct(ids) {
		return this._httpClient.post(`api/product/delete`, { ids });
	}

	restoreProduct(ids) {
		return this._httpClient.post(`api/product/restore`, { ids });
	}

	// Purchase apis
	createPurchase(body) {
		return this._httpClient.post('api/purchase/store', body);
	}

	getPurchases(queryParams?) {
		return this._httpClient.get('api/purchase', queryParams);
	}

	updatePurchase(body) {
		return this._httpClient.post('api/purchase/update', body);
	}

	deletePurchase(ids) {
		return this._httpClient.post(`api/purchase/delete`, { ids });
	}

	restorePurchase(ids) {
		return this._httpClient.post(`api/purchase/restore`, { ids });
	}

	// Inquery apis
	createInquery(body) {
		return this._httpClient.post('api/inquery/store', body);
	}

	getInqueries(queryParams?) {
		return this._httpClient.get('api/inquery', queryParams);
	}

	updateInquery(body) {
		return this._httpClient.post('api/inquery/update', body);
	}

	deleteInquery(ids) {
		return this._httpClient.post(`api/inquery/delete`, { ids });
	}

	restoreInquery(ids) {
		return this._httpClient.post(`api/inquery/restore`, { ids });
	}

	// Contact apis
	createContact(body) {
		return this._httpClient.post('api/contact/store', body);
	}

	getContacts(queryParams?) {
		return this._httpClient.get('api/contact', queryParams);
	}

	updateContact(body) {
		return this._httpClient.post('api/contact/update', body);
	}

	deleteContact(ids) {
		return this._httpClient.post(`api/contact/delete`, { ids });
	}

	// Expo type apis
	createExpoType(body) {
		return this._httpClient.post('api/expo_type/store', body);
	}

	getExpoTypes(queryParams?) {
		return this._httpClient.get('api/expo_type', queryParams);
	}

	updateExpoType(body) {
		return this._httpClient.post('api/expo_type/update', body);
	}

	deleteExpoType(ids) {
		return this._httpClient.post(`api/expo_type/delete`, { ids });
	}

	// Expo apis
	createExpo(body) {
		return this._httpClient.post('api/expo/store', body);
	}

	getExpoes(queryParams?) {
		return this._httpClient.get('api/expo', queryParams);
	}

	getExpoList(queryParams?) {
		return this._httpClient.get('api/expo/list', queryParams);
	}

	getExpo(id) {
		return this._httpClient.get(`api/expo/${id}`);
	}

	updateExpo(body) {
		return this._httpClient.post('api/expo/update', body);
	}

	uploadExpoVideo(body) {
		return this._httpClient.post('api/expo/update', body, null, {
			reportProgress: true,
			observe: 'events',
		});
	}

	deleteExpo(ids) {
		return this._httpClient.post(`api/expo/delete`, { ids });
	}

	// Expo Applicant seller apis
	createExpoApplicantSeller(body) {
		return this._httpClient.post('api/expo_applicant_seller/store', body);
	}

	importExpoApplicantSellers(body) {
		return this._httpClient.post('api/expo_applicant_seller/import', body);
	}

	getExpoApplicantSellers(queryParams?) {
		return this._httpClient.get('api/expo_applicant_seller', queryParams);
	}

	getExpoApplicantSeller(id) {
		return this._httpClient.get(`api/expo_applicant_seller/${id}`);
	}

	updateExpoApplicantSeller(body) {
		return this._httpClient.post('api/expo_applicant_seller/update', body);
	}

	payExpoApplicantSeller(body) {
		return this._httpClient.post('api/expo_applicant_seller/pay', body);
	}

	recommendExpoApplicantSellers(ids) {
		return this._httpClient.post(`api/expo_applicant_seller/recommend`, {
			ids,
		});
	}

	deleteExpoApplicantSeller(ids) {
		return this._httpClient.post(`api/expo_applicant_seller/delete`, {
			ids,
		});
	}

	// Expo hall apis
	createExpoHall(body) {
		return this._httpClient.post('api/expo_hall/store', body);
	}

	getExpoHalls(queryParams?) {
		return this._httpClient.get('api/expo_hall', queryParams);
	}

	getExpoBuildings(queryParams?) {
		return this._httpClient.get('api/expo_hall/building', queryParams);
	}

	getExpoHallList(queryParams?) {
		return this._httpClient.get('api/expo_hall/list', queryParams);
	}

	getAvailableExpoHalls(queryParams?) {
		return this._httpClient.get('api/expo_hall/available', queryParams);
	}

	updateExpoHall(body) {
		return this._httpClient.post('api/expo_hall/update', body);
	}

	deleteExpoHall(ids) {
		return this._httpClient.post(`api/expo_hall/delete`, {
			ids,
		});
	}

	// Expo badge apis
	createExpoBadge(body) {
		return this._httpClient.post('api/expo_badge/store', body);
	}

	getExpoBadges(queryParams?) {
		return this._httpClient.get('api/expo_badge', queryParams);
	}

	getExpoBadgeOverview(queryParams?) {
		return this._httpClient.get('api/expo_badge/overview', queryParams);
	}

	updateExpoBadge(body) {
		return this._httpClient.post('api/expo_badge/update', body);
	}

	changeBadgeStatus(body) {
		return this._httpClient.post('api/expo_badge/status', body);
	}

	deleteExpoBadge(ids) {
		return this._httpClient.post(`api/expo_badge/delete`, {
			ids,
		});
	}

	// Expo addition apis
	createExpoAddition(body) {
		return this._httpClient.post('api/expo_addition/store', body);
	}

	getExpoAdditions(queryParams?) {
		return this._httpClient.get('api/expo_addition', queryParams);
	}

	getExpoAdditionOverview(queryParams?) {
		return this._httpClient.get('api/expo_addition/overview', queryParams);
	}

	updateExpoAddition(body) {
		return this._httpClient.post('api/expo_addition/update', body);
	}

	changeAdditionStatus(body) {
		return this._httpClient.post('api/expo_addition/status', body);
	}

	deleteExpoAddition(ids) {
		return this._httpClient.post(`api/expo_addition/delete`, {
			ids,
		});
	}

	// Expo lintel apis
	createExpoLintel(body) {
		return this._httpClient.post('api/expo_lintel/store', body);
	}

	getExpoLintels(queryParams?) {
		return this._httpClient.get('api/expo_lintel', queryParams);
	}

	updateExpoLintel(body) {
		return this._httpClient.post('api/expo_lintel/update', body);
	}

	deleteExpoLintel(ids) {
		return this._httpClient.post(`api/expo_lintel/delete`, {
			ids,
		});
	}

	// Expo lintel apis
	getExpoProceeds(queryParams?) {
		return this._httpClient.get('api/expo_proceed', queryParams);
	}

	updateExpoProceed(body) {
		return this._httpClient.post('api/expo_proceed/update', body);
	}

	// Expo Applicant buyer apis
	getExpoApplicantBuyers(queryParams?) {
		return this._httpClient.get('api/expo_applicant_buyer', queryParams);
	}

	getExpoApplicantBuyer(id) {
		return this._httpClient.get(`api/expo_applicant_buyer/${id}`);
	}

	updateExpoApplicantBuyer(body) {
		return this._httpClient.post('api/expo_applicant_buyer/update', body);
	}

	deleteExpoApplicantBuyer(ids) {
		return this._httpClient.post(`api/expo_applicant_buyer/delete`, {
			ids,
		});
	}

	// Expo Applicant bus apis
	createExpoApplicantBuyerBus(body) {
		return this._httpClient.post(
			'api/expo_applicant_buyer_bus/store',
			body,
		);
	}

	getExpoApplicantBuyerBuses(queryParams?) {
		return this._httpClient.get(
			'api/expo_applicant_buyer_bus',
			queryParams,
		);
	}

	updateExpoApplicantBuyerBus(body) {
		return this._httpClient.post(
			'api/expo_applicant_buyer_bus/update',
			body,
		);
	}

	deleteExpoApplicantBuyerBus(ids) {
		return this._httpClient.post(`api/expo_applicant_buyer_bus/delete`, {
			ids,
		});
	}

	// Product custome category apis
	getProductCustomCategories(queryParams?) {
		return this._httpClient.get('api/product_custom_category', queryParams);
	}

	// Bus apis
	createBus(body) {
		return this._httpClient.post('api/bus/store', body);
	}

	getBuses(queryParams?) {
		return this._httpClient.get('api/bus', queryParams);
	}

	updateBus(body) {
		return this._httpClient.post('api/bus/update', body);
	}

	deleteBus(ids) {
		return this._httpClient.post(`api/bus/delete`, {
			ids,
		});
	}

	// Company violation apis
	createCompanyViolation(body) {
		return this._httpClient.post('api/company_violation/store', body);
	}

	getCompanyViolations(queryParams?) {
		return this._httpClient.get('api/company_violation', queryParams);
	}

	updateCompanyViolation(body) {
		return this._httpClient.post('api/company_violation/update', body);
	}

	deleteCompanyViolation(ids) {
		return this._httpClient.post(`api/company_violation/delete`, {
			ids,
		});
	}

	// User share apis
	getUserShares(queryParams: any = {}) {
		return this._httpClient.get('api/user_share', queryParams);
	}

	updateUserShare(body) {
		return this._httpClient.post('api/user_share/update', body);
	}

	deleteUserShare(ids) {
		return this._httpClient.post(`api/user_share/delete`, {
			ids,
		});
	}

	// User share apis
	getSettingInviteCard(queryParams: any = {}) {
		return this._httpClient.get('api/setting_invite_card', queryParams);
	}

	updateSettingInviteCard(body) {
		return this._httpClient.post('api/setting_invite_card/update', body);
	}

	// User promotion apis
	getPromotions(queryParams: any = {}) {
		return this._httpClient.get('api/promotion', queryParams);
	}

	updatePromotion(body) {
		return this._httpClient.post('api/promotion/update', body);
	}

	deletePromotion(ids) {
		return this._httpClient.post(`api/promotion/delete`, {
			ids,
		});
	}

	// Ads space apis
	createAdsSpace(body) {
		return this._httpClient.post('api/ads_space/store', body);
	}

	getAdsSpaces(queryParams?) {
		return this._httpClient.get('api/ads_space', queryParams);
	}

	updateAdsSpace(body) {
		return this._httpClient.post('api/ads_space/update', body);
	}

	deleteAdsSpace(ids) {
		return this._httpClient.post(`api/ads_space/delete`, {
			ids,
		});
	}

	// Ads space applicant apis
	createAdsSpaceApplicant(body) {
		return this._httpClient.post('api/ads_space_applicant/store', body);
	}

	getAdsSpaceApplicants(queryParams?) {
		return this._httpClient.get('api/ads_space_applicant', queryParams);
	}

	updateAdsSpaceApplicant(body) {
		return this._httpClient.post('api/ads_space_applicant/update', body);
	}

	deleteAdsSpaceApplicant(ids) {
		return this._httpClient.post(`api/ads_space_applicant/delete`, {
			ids,
		});
	}

	// Site ads apis
	createSiteAds(body) {
		return this._httpClient.post('api/site_ads/store', body);
	}

	getSiteAdss(queryParams?) {
		return this._httpClient.get('api/site_ads', queryParams);
	}

	updateSiteAds(body) {
		return this._httpClient.post('api/site_ads/update', body);
	}

	deleteSiteAds(ids) {
		return this._httpClient.post(`api/site_ads/delete`, {
			ids,
		});
	}

	// AreaType apis
	getAreaTypes(queryParams: any = {}) {
		return this._httpClient.get('api/area_type', queryParams);
	}

	updateAreaType(body) {
		return this._httpClient.post('api/area_type/update', body);
	}

	deleteAreaType(ids) {
		return this._httpClient.post(`api/area_type/delete`, {
			ids,
		});
	}

	// UserSubscribe content apis
	getUserSubscribes(queryParams: any = {}) {
		return this._httpClient.get('api/user_subscribe', queryParams);
	}

	updateUserSubscribe(body) {
		return this._httpClient.post('api/user_subscribe/update', body);
	}

	recommendUserSubscribes(ids) {
		return this._httpClient.post(`api/user_subscribe/recommend`, { ids });
	}

	deleteUserSubscribe(ids) {
		return this._httpClient.post(`api/user_subscribe/delete`, {
			ids,
		});
	}

	// Site content apis
	getSiteContents(queryParams: any = {}) {
		return this._httpClient.get('api/site_content', queryParams);
	}

	updateSiteContent(body) {
		return this._httpClient.post('api/site_content/update', body);
	}

	recommendSiteContents(ids) {
		return this._httpClient.post(`api/site_content/recommend`, { ids });
	}

	deleteSiteContent(ids) {
		return this._httpClient.post(`api/site_content/delete`, {
			ids,
		});
	}

	// Discover apis
	createDiscover(body) {
		return this._httpClient.post('api/discover/store', body);
	}

	getDiscovers(queryParams: any = {}) {
		return this._httpClient.get('api/discover', queryParams);
	}

	getDiscover(id) {
		return this._httpClient.get(`api/discover/${id}`);
	}

	updateDiscover(body) {
		return this._httpClient.post('api/discover/update', body);
	}

	recommendDiscovers(ids) {
		return this._httpClient.post(`api/discover/recommend`, { ids });
	}

	deleteDiscover(ids) {
		return this._httpClient.post(`api/discover/delete`, {
			ids,
		});
	}

	// Activity signup apis
	getActivitySignups(queryParams: any = {}) {
		return this._httpClient.get('api/activity_signup', queryParams);
	}

	// Discover comment apis
	getDiscoverComments(queryParams: any = {}) {
		return this._httpClient.get('api/discover_comment', queryParams);
	}

	deleteDiscoverComment(ids) {
		return this._httpClient.post(`api/discover_comment/delete`, { ids });
	}

	restoreDiscoverComment(ids) {
		return this._httpClient.post(`api/discover_comment/restore`, { ids });
	}

	// Setting apis
	getSystemSetting(queryParams: any = {}) {
		return this._httpClient.get('api/setting_system', queryParams);
	}

	updateSystemSetting(body) {
		return this._httpClient.post('api/setting_system/update', body);
	}

	// EmailTemplate apis
	createEmailTemplate(body) {
		return this._httpClient.post('api/email_template/store', body);
	}

	getEmailTemplates(queryParams: any = {}) {
		return this._httpClient.get('api/email_template', queryParams);
	}

	updateEmailTemplate(body) {
		return this._httpClient.post('api/email_template/update', body);
	}

	deleteEmailTemplate(ids) {
		return this._httpClient.post(`api/email_template/delete`, {
			ids,
		});
	}

	// Video apis
	createVideo(body) {
		return this._httpClient.post('api/video/store', body);
	}

	getVideos(queryParams: any = {}) {
		return this._httpClient.get('api/video', queryParams);
	}

	updateVideo(body) {
		return this._httpClient.post('api/video/update', body);
	}

	recommendVideos(ids) {
		return this._httpClient.post(`api/video/recommend`, { ids });
	}

	deleteVideo(ids) {
		return this._httpClient.post(`api/video/delete`, {
			ids,
		});
	}

	// Message apis
	createMessage(body) {
		return this._httpClient.post('api/message/store', body);
	}

	getMessages(queryParams: any = {}) {
		return this._httpClient.get('api/message', queryParams);
	}

	updateMessage(body) {
		return this._httpClient.post('api/message/update', body);
	}

	deleteMessage(ids) {
		return this._httpClient.post(`api/message/delete`, {
			ids,
		});
	}

	// Notice apis
	createNotice(body) {
		return this._httpClient.post('api/notice/store', body);
	}

	getNotices(queryParams: any = {}) {
		return this._httpClient.get('api/notice', queryParams);
	}

	updateNotice(body) {
		return this._httpClient.post('api/notice/update', body);
	}

	deleteNotice(ids) {
		return this._httpClient.post(`api/notice/delete`, {
			ids,
		});
	}

	// Vip apis
	createVip(body) {
		return this._httpClient.post('api/vip/store', body);
	}

	getVips(queryParams: any = {}) {
		return this._httpClient.get('api/vip', queryParams);
	}

	updateVip(body) {
		return this._httpClient.post('api/vip/update', body);
	}

	deleteVip(ids) {
		return this._httpClient.post(`api/vip/delete`, {
			ids,
		});
	}

	// Transaction apis
	createTransaction(body) {
		return this._httpClient.post('api/transaction/store', body);
	}

	getTransactions(queryParams: any = {}) {
		return this._httpClient.get('api/transaction', queryParams);
	}

	changeTransactionStatus(body) {
		return this._httpClient.post(`api/transaction/status`, body);
	}

	payArticleFee(body) {
		return this._httpClient.post(`api/transaction/article_fee`, body);
	}
}
