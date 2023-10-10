import VTreeNode from "./VTreeNode";

const { ccclass, property } = cc._decorator;

@ccclass
export class VTree extends cc.Component {

	root: VTreeNode = null;

	constructor() {
		super();
	}


}