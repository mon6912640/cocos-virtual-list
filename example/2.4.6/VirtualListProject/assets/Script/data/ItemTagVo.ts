import { Cfg_StickType } from "./CFG";
import VTreeNode from "./VTreeNode";

export default class ItemTagVo {

	type = 0;
	/** 能否折叠 */
	canFold = false;

	/** item类型 0一级标签 1二级标签 */
	itemType = 0;

	tnode: VTreeNode;

	cfg: Cfg_StickType;

	constructor() {
	}
}