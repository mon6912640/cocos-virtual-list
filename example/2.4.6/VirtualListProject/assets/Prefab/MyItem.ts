import { MyItemVo } from "../Script/SceneTest";
import AItemRenderer from "../Script/core/AItemRenerer";

const { ccclass, property } = cc._decorator;

@ccclass
export class MyItem extends AItemRenderer {

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

	private _curData: MyItemVo;
	public setData(pData: MyItemVo) {
		let t = this;
		t._curData = pData;
		if (pData) {
			let t_type = pData.type;
			console.log(`setData index=${t.index} data=${pData} type=${t_type}`);
			t.changeNode(t_type);
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

	public closePanel() {
		this.setData(null);
	}

	public onDestroy(): void {
		let t = this;
		t.setData(null);
	}
}