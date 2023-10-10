import { MyItem } from "../Prefab/MyItem";
import AVirtualScrollView, { ListEvent } from "./core/AVirtualScrollView";
import { Cfg_Stick, Cfg_StickType } from "./data/CFG";
import ItemTagVo from "./data/ItemTagVo";
import MyItemVo from "./data/MyItemVo";
import VTreeNode from "./data/VTreeNode";

const { ccclass, property } = cc._decorator;

@ccclass
export class SceneTest extends cc.Component {

	private _dataList: VTreeNode[] = null;

	@property(AVirtualScrollView)
	mylist: AVirtualScrollView = null;

	@property(cc.JsonAsset)
	cfg_stick: cc.JsonAsset = null;

	@property(cc.JsonAsset)
	cfg_stick_type: cc.JsonAsset = null;

	cfgStickMap: { [itemid: number]: Cfg_Stick } = {};
	cfgStickTypeMap: { [type: number]: Cfg_StickType } = {};

	tagMap: { [type: number]: ItemTagVo } = {};
	itemVoMap: { [id: number]: MyItemVo } = {};

	private _treeRoot: VTreeNode;
	treeVoMap: { [uid: number]: VTreeNode } = {};

	protected onLoad(): void {
		let t = this;

		let t_cfgobj1 = t.cfg_stick.json; //字典
		let t_cfgobj2 = t.cfg_stick_type.json; //数组

		t.cfgStickMap = t_cfgobj1;

		for (let i = 0; i < t_cfgobj2.length; i++) {
			let t_cfg: Cfg_StickType = t_cfgobj2[i];
			t.cfgStickTypeMap[t_cfg.Type] = t_cfg;
		}

		// console.log(t.cfgStickMap);

		t._treeRoot = new VTreeNode();
		t._treeRoot.depth = -1;
		t.treeVoMap[t._treeRoot.uid] = t._treeRoot;

		//构建列表数据
		for (let v of t_cfgobj2) {
			let t_cfg2: Cfg_StickType = v;
			let t_tag = new ItemTagVo();
			t_tag.type = t_cfg2.Type;
			t_tag.cfg = t_cfg2;
			t.tagMap[t_cfg2.Type] = t_tag;

			let t_tnode = new VTreeNode();
			t.treeVoMap[t_tnode.uid] = t_tnode;
			t_tag.tnode = t_tnode;
			t_tnode.data = t_tag;

			if (t_cfg2.P == 0) {
				//一级标签
				t_tag.canFold = true;
				t_tag.itemType = 0;
			}
			else { //有父标签的表示是二级标签
				//二级标签
				t_tag.canFold = false; //二级标签不可折叠
				t_tag.itemType = 1;
			}
		}

		//构建树结构
		for (let k in t_cfgobj1) {
			let t_cfg1: Cfg_Stick = t_cfgobj1[k];
			let t_vo = new MyItemVo();
			t_vo.id = t_cfg1.ItemId;
			t_vo.cfg = t_cfg1;
			t.itemVoMap[t_vo.id] = t_vo;

			let t_tnode = new VTreeNode();
			t.treeVoMap[t_tnode.uid] = t_tnode;
			t_tnode.data = t_vo;

			let t_parent0: VTreeNode;
			if (t_cfg1.Type2) {
				//有二级标签则优先挂在二级标签下
				let t_tag = t.tagMap[t_cfg1.Type2];
				if (!t_tag) {
					console.log(`error 不存在标签type = ${t_cfg1.Type2}`);
					continue;
				}
				let t_node1 = t_tag.tnode;
				if (t_node1) {
					t_node1.addChild(t_tnode);
					t_parent0 = t_node1;
				}
			}
			if (t_cfg1.Type) {
				let t_tag = t.tagMap[t_cfg1.Type];
				if (!t_tag) {
					console.log(`error 不存在标签type = ${t_cfg1.Type}`);
					continue;
				}
				let t_node0 = t_tag.tnode;
				if (t_node0) {
					if (t_tnode.parent) {
						t_node0.addChild(t_tnode.parent);
					}
					else {
						t_node0.addChild(t_tnode);
					}
					t_parent0 = t_node0;
				}
			}
			if (t_parent0) {
				t._treeRoot.addChild(t_parent0);
			}
		}
		console.log(t._treeRoot);

		let t_tnodeList: VTreeNode[] = [];
		//遍历树结构 扁平化树结构
		t._treeRoot.traverse((pNode) => {
			if (pNode.depth == -1) //根节点不处理
				return;
			t_tnodeList.push(pNode);
		});
		t._dataList = t_tnodeList;
	}

	protected start(): void {
		let t = this;
		cc.debug.setDisplayStats(true);

		t.mylist.itemRenderer = t.onItemRender.bind(t);
		t.mylist.node.on(ListEvent.SELECT_CHANGE, t.onSelectChange, t);
		t.mylist.numItems = t._dataList.length;
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
