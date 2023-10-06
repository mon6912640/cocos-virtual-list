// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import item from "../Prefab/Item";
import AVirtualScrollView from "./core/AVirtualScrollView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(AVirtualScrollView)
    test1: AVirtualScrollView = null;
    @property(AVirtualScrollView)
    test2: AVirtualScrollView = null;
    @property(AVirtualScrollView)
    test3: AVirtualScrollView = null;
    @property(AVirtualScrollView)
    test4: AVirtualScrollView = null;

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

        this.test1.numItems = dataL.length;
        this.test2.numItems = dataL.length;
        this.test3.numItems = dataL.length;
        this.test4.numItems = dataL.length;

        // this.test1.refreshData(dataL);
        // this.test2.refreshData(dataL);
        // this.test3.refreshData(dataL);
        // this.test4.refreshData(dataL);

        setTimeout(() => {
            dataL[1] = "666";
            // this.test1.refreshData(dataL);
            // this.test2.refreshData(dataL);
            // this.test3.refreshData(dataL);
            // this.test4.refreshData(dataL);
            this.test1.numItems = dataL.length;
            this.test2.numItems = dataL.length;
            this.test3.numItems = dataL.length;
            this.test4.numItems = dataL.length;
        }, 3000)
    }

    private onItemRender(pIndex: number, pItem: cc.Node) {
        let t = this;
        if (t._dataList) {
            pItem.getComponent(item).setData(t._dataList[pIndex]);
        }
    }
}
