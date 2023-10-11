import { Cfg_StickType } from "./CFG";
import VTreeNode from "../core/VTreeNode";

export default class ItemTagVo {

	type = 0;

	/** item类型 0一级标签 1二级标签 */
	itemType = 0;

	tnode: VTreeNode;

	cfg: Cfg_StickType;

	constructor() {
	}
}