import { MyItem } from "../Prefab/MyItem";
import VList, { ListEvent } from "./core/VList";
import { Cfg_Stick, Cfg_StickType } from "./data/CFG";
import ItemTagVo from "./data/ItemTagVo";
import MyItemVo from "./data/MyItemVo";
import VTreeNode from "./core/VTreeNode";

const { ccclass, property } = cc._decorator;

@ccclass
export class SceneTest extends cc.Component {

	private _dataList: VTreeNode[] = null;

	@property(VList)
	mylist: VList = null;

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

		t._treeRoot = new VTreeNode(true);
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

		t._treeRoot.foldAll(); //默认折叠所有
		t.rebuildDataList();
	}

	private _curId = 0;

	private rebuildDataList(): void {
		let t = this;
		let t_tnodeList: VTreeNode[] = [];
		//遍历树结构 扁平化树结构
		t._treeRoot.traverse((pNode) => {
			if (pNode.isRoot) //根节点不处理
				return;
			if (pNode.parent.isOpen()) { //父节点是打开状态才显示
				t_tnodeList.push(pNode);
				pNode.listIndex = t_tnodeList.length - 1;
			}
		});
		t._dataList = t_tnodeList;
	}

	protected start(): void {
		let t = this;
		cc.debug.setDisplayStats(true);

		t.mylist.itemRenderer = t.onItemRender.bind(t);
		t.mylist.node.on(ListEvent.SELECT_CHANGE, t.onSelectChange, t);
		t.mylist.numItems = t._dataList.length;
		t.mylist.setTouchItemCallback(t.onItemClick, t);
	}

	private onItemRender(pItem: cc.Node, pIndex: number): void {
		let t = this;
		if (t._dataList) {
			pItem.getComponent(MyItem).setData(t._dataList[pIndex]);
		}
	}

	/** item点击处理（区别于选中） */
	private onItemClick(pIndex: number) {
		let t = this;
		console.log(`onItemClick index=${pIndex}`);
		if (!t._dataList || t._dataList.length <= pIndex)
			return;
		let t_tnode = t._dataList[pIndex];
		let t_vo = t_tnode.data;
		let t_targeNodeUid = 0;
		if (t_vo instanceof ItemTagVo) {
			if (t_tnode.isOpen()) { //已经打开的折叠
				t_tnode.open = false; //折叠
				t_tnode.foldAll(); //折叠所有子节点
			}
			else { //未打开的展开
				//选中最近的末节点
				t_tnode.foldBrother(); //折叠兄弟节点
				let t_curNode = t_tnode;
				while (t_curNode) {
					t_curNode.open = true;
					t_curNode = t_curNode.children[0];
					if (t_curNode.isEndNode())
						break;
				}
				if (t_curNode && t_curNode.data instanceof MyItemVo) {
					t_targeNodeUid = t_curNode.uid;
				}
			}
			t.rebuildDataList(); //重建列表数据
			t.mylist.numItems = t._dataList.length;
			t.mylist.clearSelections(); //清空选中
			if (t_targeNodeUid) {
				let t_curNode = t.treeVoMap[t_targeNodeUid];
				t.mylist.addSeletion(t_curNode.listIndex);
				let t_itemvo = t_curNode.data as MyItemVo;
				console.log(`选中了${t_itemvo.cfg.Desc}`);
			}
		}
		else if (t_vo instanceof MyItemVo) {
			console.log(`选中了${t_vo.cfg.Desc}`);
			t.mylist.clearSelections(); //清空选中
			t.mylist.addSeletion(pIndex);
		}
	}

	/** 选中处理 */
	private onSelectChange(pIndex: number) {
		let t = this;
		// console.log(`onSelectChange index=${pIndex}`);
		// if (!t._dataList || t._dataList.length <= pIndex)
		// 	return;
	}
}
