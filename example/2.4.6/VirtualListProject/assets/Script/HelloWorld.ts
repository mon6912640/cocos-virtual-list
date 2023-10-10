// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import item from "../Prefab/Item";
import VList, { ListEvent } from "./core/VList";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(VList)
    test1: VList = null;
    @property(VList)
    test2: VList = null;
    @property(VList)
    test3: VList = null;
    @property(VList)
    test4: VList = null;

    private _dataList: string[] = null;

    start() {
        cc.debug.setDisplayStats(true);
        var dataL: string[] = [];
        for (var i = 0; i < 100; i++) {
            dataL.push(i + "");
        }
        this._dataList = dataL;

        console.log(this._dataList);

        this.test1.itemRenderer = this.onItemRender.bind(this);
        this.test2.itemRenderer = this.onItemRender.bind(this);
        this.test3.itemRenderer = this.onItemRender.bind(this);
        this.test4.itemRenderer = this.onItemRender.bind(this);

        this.test1.node.on(ListEvent.SELECT_CHANGE, this.onSelectChange, this);
        this.test1.node.on(ListEvent.SELECTIONS_CHANGE, this.onSelectionsChange, this);

        this.test1.numItems = dataL.length;
        // this.test2.numItems = dataL.length;
        this.test3.numItems = dataL.length;
        // this.test4.numItems = dataL.length;

        // this.test1.refreshData(dataL);
        // this.test2.refreshData(dataL);
        // this.test3.refreshData(dataL);
        // this.test4.refreshData(dataL);

        setTimeout(() => {
            // dataL[1] = "666";
            // this.test1.refreshData(dataL);
            // this.test2.refreshData(dataL);
            // this.test3.refreshData(dataL);
            // this.test4.refreshData(dataL);
            // this.test1.numItems = dataL.length;
            // this.test2.numItems = dataL.length;
            // this.test3.numItems = dataL.length;
            // this.test4.numItems = dataL.length;
            // this.test1.numItems = 1;
        }, 3000)

        let t_btnUpdate = this.node.getChildByName("btnUpdate");
        t_btnUpdate.on(cc.Node.EventType.TOUCH_END, () => {
            console.log("点击了更新");
            dataL[5] = "66";
            // this.test1.numItems = dataL.length;
            // this.test2.numItems = dataL.length;
            // this.test3.numItems = dataL.length;
            // this.test4.numItems = dataL.length;
            this.test3.numItems = dataL.length;
        }, this);

        let t_btnUpdate1 = this.node.getChildByName("btnUpdate1");
        t_btnUpdate1.on(cc.Node.EventType.TOUCH_END, () => {
            console.log("点击了更新1");
            dataL[6] = "55";
            // this.test1.refreshData(dataL);
            // this.test2.refreshData(dataL);
            // this.test3.refreshData(dataL);
            // this.test4.refreshData(dataL);
            this.test3.numItems = dataL.length;
        }, this);

        let t_btnLook = this.node.getChildByName("btnLook");
        t_btnLook.on(cc.Node.EventType.TOUCH_END, () => {
            let pos = this.test3.getContentPosition();
            console.log("当前content位置：" + pos);
        }, this);

        let t_btnScroll = this.node.getChildByName("btnScroll");
        t_btnScroll.on(cc.Node.EventType.TOUCH_END, () => {
            let t_index = Math.floor(Math.random() * dataL.length);
            this.test3.scrollToIndex(t_index);
            // this.test1.scrollToIndex(t_index);
        }, this);

    }

    private onItemRender(pItem: cc.Node, pIndex: number) {
        let t = this;
        if (t._dataList) {
            pItem.getComponent(item).setData(t._dataList[pIndex]);
        }
    }

    private onSelectChange(pIndex: number) {
        let t = this;
        console.log("选中了：" + pIndex);
    }
    private onSelectionsChange(pSelections: number[]) {
        let t = this;
        console.log("选中了：" + pSelections);
    }
}
