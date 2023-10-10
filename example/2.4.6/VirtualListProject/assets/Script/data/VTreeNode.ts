export default class VTreeNode {

	static UID = 0;

	uid = 0;

	data: any;

	parent: VTreeNode;
	children: VTreeNode[];
	depth = 0;
	fold = false;
	canFold = false;

	constructor() {
		let t = this;
		t.uid = VTreeNode.UID++;
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
	 * 遍历
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
}