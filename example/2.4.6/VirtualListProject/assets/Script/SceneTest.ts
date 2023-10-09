import { MyItem } from "../Prefab/MyItem";
import AVirtualScrollView from "./core/AVirtualScrollView";

const { ccclass, property } = cc._decorator;

@ccclass
export class SceneTest extends cc.Component {

	private _dataList: MyItemVo[] = null;

	@property(AVirtualScrollView)
	mylist: AVirtualScrollView = null;

	protected onLoad(): void {
		let t = this;
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

		t.mylist.numItems = t_dataList.length;
	}

	private onItemRender(pItem: cc.Node, pIndex: number): void {
		let t = this;
		if (t._dataList) {
			pItem.getComponent(MyItem).setData(t._dataList[pIndex]);
		}
	}
}

export class MyItemVo {
	type = 0;
	data: any;
}