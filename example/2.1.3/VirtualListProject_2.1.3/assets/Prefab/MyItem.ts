import VListItem from "../Script/core/VListItem";
import ItemTagVo from "../Script/data/ItemTagVo";
import MyItemVo from "../Script/data/MyItemVo";
import VTreeNode from "../Script/data/VTreeNode";

const { ccclass, property } = cc._decorator;

@ccclass
export class MyItem extends VListItem {

	private _btn0: cc.Node = null;
	private _btn1: cc.Node = null;
	private _btn2: cc.Node = null;

	private _nodelist: cc.Node[];

	private _bg0: cc.Node = null;
	private _bg1: cc.Node = null;
	private _arrow0: cc.Node = null;
	private _arrow1: cc.Node = null;
	private _lb: cc.Label = null;

	private _curNode: cc.Node = null;

	private _itemType = 0;

	onLoad(): void {
		let t = this;

		t._btn0 = t.node.getChildByName("btn0");
		t._btn1 = t.node.getChildByName("btn1");
		t._btn2 = t.node.getChildByName("btn2");

		t._btn0.active = true;
		t._btn1.active = false;
		t._btn2.active = false;

		t._nodelist = [t._btn0, t._btn1, t._btn2];
	}

	private _curData: VTreeNode;
	public setData(pData: VTreeNode) {
		let t = this;
		t._curData = pData;
		if (pData) {
			let t_type = 0;
			if (pData.data instanceof ItemTagVo) {
				t_type = pData.data.itemType;
			}
			else if (pData.data instanceof MyItemVo) {
				t_type = 2;
			}
			t._itemType = t_type;
			// console.log(`setData index=${t.index} data=${pData} type=${t_type}`);
			t.changeNode(t_type);

			let t_vo = pData.data;
			if (t_vo instanceof ItemTagVo) {
				//标签
				t._lb.string = t_vo.cfg.Title;
				t.doSelect(pData.open);
			}
			else if (t_vo instanceof MyItemVo) {
				//数据
				t._lb.string = t_vo.cfg.Desc;
			}
		}
		else {
		}
	}

	/** 切换节点 */
	private changeNode(pType: number): void {
		let t = this;
		for (let i = 0; i < t._nodelist.length; i++) {
			let t_node = t._nodelist[i];
			if (i == pType) {
				t_node.active = true;
				t._curNode = t._nodelist[i];
			}
			else {
				t_node.active = false;
			}
		}
		if (t._curNode) {
			t._bg0 = t._curNode.getChildByName("bg0");
			t._bg1 = t._curNode.getChildByName("bg1");
			t._arrow0 = t._curNode.getChildByName("arrow0");
			t._arrow1 = t._curNode.getChildByName("arrow1");
			t._lb = t._curNode.getChildByName("lb").getComponent(cc.Label);

			t.node.height = t._curNode.height;
			t.node.width = t._curNode.width;
		}
		t.initByType(pType);
	}

	private initByType(pType: number): void {
		let t = this;
		switch (pType) {
			case 0:
				t._bg0.active = true;
				t._bg1.active = false;
				t._arrow0.active = true;
				t._arrow1.active = false;
				break;
			case 1:
				t._bg0.active = true;
				t._bg1.active = false;
				break;
			case 2:
				t._bg0.active = true;
				t._bg1.active = false;
				break;
		}
		t._lb.node.active = true;
	}

	protected onSelectedChanged(pVal: boolean): void {
		let t = this;
		if (!t._curData || !(t._curData.data instanceof MyItemVo))
			return;
		t.doSelect(pVal)
	}

	private doSelect(pVal: boolean): void {
		let t = this;
		if (t._itemType == 0) {
			t._arrow0.active = !pVal;
			t._arrow1.active = pVal;
		}
		t._bg0.active = !pVal;
		t._bg1.active = pVal;
	}

	public closePanel() {
		this.setData(null);
	}

	public onDestroy(): void {
		let t = this;
		t.setData(null);
	}
}