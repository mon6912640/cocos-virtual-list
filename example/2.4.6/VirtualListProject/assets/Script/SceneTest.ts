import { MyItem } from "../Prefab/MyItem";
import AVirtualScrollView, { ListEvent } from "./core/AVirtualScrollView";
import { Cfg_Stick, Cfg_StickType } from "./data/CFG";
import MyItemVo from "./data/MyItemVo";

const { ccclass, property } = cc._decorator;

@ccclass
export class SceneTest extends cc.Component {

	private _dataList: MyItemVoTest[] = null;

	@property(AVirtualScrollView)
	mylist: AVirtualScrollView = null;

	@property(cc.JsonAsset)
	cfg_stick: cc.JsonAsset = null;

	@property(cc.JsonAsset)
	cfg_stick_type: cc.JsonAsset = null;

	cfgStickMap: { [itemid: number]: Cfg_Stick };
	cfgStickTypeMap: { [type: number]: Cfg_StickType };

	protected onLoad(): void {
		let t = this;
		let t_cfgobj1 = t.cfg_stick.json; //字典
		let t_cfgobj2 = t.cfg_stick_type.json; //数组

		t.cfgStickMap = t_cfgobj1;

		for (let i = 0; i < t_cfgobj2.length; i++) {
			let t_cfg: Cfg_StickType = t_cfgobj2[i];
			t.cfgStickTypeMap[t_cfg.Type] = t_cfg;
		}

		//构建列表数据
		for (let k in t_cfgobj1) {
			let t_cfgstick: Cfg_Stick = t_cfgobj1[k];
			let t_vo = new MyItemVo();
			t_vo.id = t_cfgstick.ItemId;
			t_vo.cfg = t_cfgstick;
		}
	}

	protected start(): void {
		let t = this;
		cc.debug.setDisplayStats(true);

		let t_dataList: MyItemVoTest[] = [];
		for (let i = 0; i < 100; i++) {
			let t_vo = new MyItemVoTest();
			t_vo.type = Math.floor(Math.random() * 3);
			t_vo.data = i + "";
			t_dataList.push(t_vo);
		}
		t._dataList = t_dataList;

		t.mylist.itemRenderer = t.onItemRender.bind(t);
		t.mylist.node.on(ListEvent.SELECT_CHANGE, t.onSelectChange, t);
		t.mylist.numItems = t_dataList.length;
	}

	private onItemRender(pItem: cc.Node, pIndex: number): void {
		let t = this;
		if (t._dataList) {
			pItem.getComponent(MyItem).setData(t._dataList[pIndex]);
		}
	}

	/** 选中处理 */
	private onSelectChange(pIndex: number) {
		let t = this;
		console.log(`onSelectChange index=${pIndex}`);
	}
}

export class MyItemVoTest {
	type = 0;
	data: any;
}