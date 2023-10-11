export default class VTreeNode {

	static pool: VTreeNode[] = [];
	static create(): VTreeNode {
		let t = this;
		let t_node = t.pool.pop();
		if (!t_node) {
			t_node = new VTreeNode();
		}
		return t_node;
	}
	static recycle(pNode: VTreeNode) {
		let t = this;
		pNode.recycle();
	}

	static UID = 0;

	uid = 0;

	data: any;

	/** 在扁平化列表中的index */
	listIndex = 0;

	/** 树的根节点引用 */
	root: VTreeNode;
	parent: VTreeNode;
	children: VTreeNode[];
	depth = 0;
	open = false;

	/** 是否是根节点 */
	isRoot = false;

	/** 根节点拥有所有子节点的uid映射 */
	_uidMap: { [uid: number]: VTreeNode };

	constructor(pIsRoot: boolean = false) {
		let t = this;
		t.uid = ++VTreeNode.UID;
		t.setRoot(pIsRoot);
	}

	/** 设置为根节点 */
	setRoot(pVal: boolean) {
		let t = this;
		t.isRoot = pVal;
		if (pVal) {
			t.depth = -1;
			t.open = true;
			t._uidMap = {};
		}
	}

	/**
	 * 通过uid获取子节点（只有根节点才能调用该方法）
	 * @param pUid 
	 * @returns 
	 */
	getChildByUid(pUid: number): VTreeNode {
		let t = this;
		if (t._uidMap) {
			return t._uidMap[pUid];
		}
	}

	/**
	 * 添加uid到根节点的映射
	 * @param pRoot 
	 */
	private addUidToRoot(pRoot: VTreeNode) {
		let t = this;
		t.root = pRoot;
		pRoot._uidMap[t.uid] = t;
		if (t.children) {
			for (let i = 0; i < t.children.length; i++) {
				let t_child = t.children[i];
				t_child.addUidToRoot(pRoot);
			}
		}
	}

	addChild(pChild: VTreeNode) {
		let t = this;
		if (!t.children) {
			t.children = [];
		}
		if (pChild.parent == t)
			return;
		pChild.changeDepth(t.depth + 1);
		pChild.parent = t;
		t.children.push(pChild);
		let t_root: VTreeNode = null;
		if (t.isRoot) {
			t_root = t;
		}
		else {
			t_root = t.root;
		}
		if (t_root) {
			t.addUidToRoot(t_root);
		}
		// else {
		// 	console.log(`addChild root is null`);
		// }
	}

	removeChild(pChild: VTreeNode) {
		let t = this;
		if (!t.children) {
			return;
		}
		let t_index = t.children.indexOf(pChild);
		if (t_index >= 0) {
			t.children.splice(t_index, 1);
		}
	}

	/** 改变深度 */
	changeDepth(pDepth: number) {
		let t = this;
		if (t.depth == pDepth)
			return;
		t.depth = pDepth;
		if (t.children) {
			let len = t.children.length;
			for (let i = 0; i < len; i++) {
				let t_child = t.children[i];
				t_child.changeDepth(pDepth + 1);
			}
		}
	}

	/**
	 * 前序遍历（先遍历根节点再遍历子节点）
	 * @param pFunc 
	 */
	traverse(pFunc: (pNode: VTreeNode) => void) {
		let t = this;
		pFunc(t);
		if (t.children) {
			for (let i = 0; i < t.children.length; i++) {
				let t_child = t.children[i];
				t_child.traverse(pFunc);
			}
		}
	}

	/**
	 * 后序遍历（先遍历子节点再遍历根节点）
	 * @param pFunc 
	 */
	postOrderTraverse(pFunc: (pNode: VTreeNode) => void) {
		let t = this;
		if (t.children) {
			for (let i = 0; i < t.children.length; i++) {
				let t_child = t.children[i];
				t_child.postOrderTraverse(pFunc);
			}
		}
		pFunc(t);
	}


	/** 是否打开 */
	isOpen(): boolean {
		let t = this;
		let t_node: VTreeNode = t;
		while (t_node) {
			if (!t_node.open)
				return false;
			t_node = t_node.parent;
		}
		return true;
	}

	/** 是否末节点 */
	isEndNode(): boolean {
		let t = this;
		return !t.children || t.children.length == 0;
	}

	/** 折叠所有 */
	foldAll() {
		let t = this;
		if (!t.isRoot) {
			t.open = false;
		}
		if (t.children) {
			for (let i = 0; i < t.children.length; i++) {
				let t_child = t.children[i];
				t_child.foldAll();
			}
		}
	}

	/** 折叠除自己外的兄弟节点 */
	foldBrother() {
		let t = this;
		let t_parent = t.parent;
		if (!t_parent)
			return;
		for (let i = 0; i < t_parent.children.length; i++) {
			let t_child = t_parent.children[i];
			if (t_child != t) {
				t_child.foldAll();
			}
		}
	}

	/** 回收 */
	recycle() {
		let t = this;
		//这里使用后序遍历
		if (t.children) {
			for (let i = 0; i < t.children.length; i++) {
				let t_child = t.children[i];
				t_child.recycle();
			}
		}
		t.parent = null;
		t.children && (t.children.length = 0);
		t.depth = 0;
		t.open = false;
		t.data = null;
		t.listIndex = 0;
		t.isRoot = false;
		if (t.root) {
			delete t.root._uidMap[t.uid]; //从根节点的uid映射中删除
			t.root = null;
		}
		VTreeNode.pool.push(t);
	}
}