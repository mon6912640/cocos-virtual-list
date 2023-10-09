import { MyItem } from "../Prefab/MyItem";
import AVirtualScrollView, { ListEvent } from "./core/AVirtualScrollView";

const { ccclass, property } = cc._decorator;

@ccclass
export class SceneTest extends cc.Component {

	private _dataList: MyItemVo[] = null;

	@property(AVirtualScrollView)
	mylist: AVirtualScrollView = null;

	@property(cc.JsonAsset)
	cfg_stick: cc.JsonAsset = null;

	@property(cc.JsonAsset)
	cfg_stick_type: cc.JsonAsset = null;

	protected onLoad(): void {
		let t = this;
		let t_cfgobj1 = t.cfg_stick.json;
		console.log(t_cfgobj1);
	}

	protected start(): void {
		let t = this;
		cc.debug.setDisplayStats(true);

		let t_dataList: MyItemVo[] = [];
		for (let i = 0; i < 100; i++) {
			let t_vo = new MyItemVo();
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

export class MyItemVo {
	type = 0;
	data: any;
}