//合成
export interface Cfg_Stick{
	ItemId: number ; // 合成道具ID
	Desc: string ; // 合成名字
	Level: number ; // 等级
	Type: number ; // 标签页类型
	Type2: number ; // 二级页签
	NeedItem: string ; // 所需道具ID及数量
	Rate: number ; // 合成万分比
	RateShow: number ; // 合成万分比
	RedPoint: number ; // （后端）红点是否处理
}
//二级标签
export interface Cfg_StickType{
	Type: number ; // 标签页类型
	Title: string ; // 类型名称
	P: number ; // 父页签
	GN: number ; // 功能关联
}