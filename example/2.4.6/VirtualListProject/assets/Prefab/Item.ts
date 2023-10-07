// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AItemRenderer from "../Script/core/AItemRenerer";


const { ccclass, property } = cc._decorator;

@ccclass
export default class item extends AItemRenderer {


    private _defaultH = 0;
    private _defaultW = 0;

    private _lblName: cc.Label = null;
    private _bg: cc.Node = null;
    private _bgSelect: cc.Node = null;

    protected onLoad(): void {
        let t = this;
        t._lblName = t.node.getChildByName("lblName").getComponent(cc.Label);
        t._bg = t.node.getChildByName("bg");
        t._bgSelect = t.node.getChildByName("bgSelect");

        t._defaultH = t.node.height;
        t._defaultW = t.node.width;

        t.onSelectedChanged(false);
    }

    private _curData: any;
    public setData(pData: any) {
        let t = this;
        console.log(`setData index=${t.index} data=${pData}`);
        t._curData = pData;
        if (pData) {
            t._lblName.string = "" + pData;

            let id = ~~pData;
            if (id % 3 == 0) {
                t.node.height = t._defaultH;
                t.node.width = t._defaultW;
                t._bg.color = cc.Color.WHITE;
            }
            else {
                t.node.height = t._defaultH * 2;
                t.node.width = t._defaultW * 2;
                t._bg.color = cc.Color.RED;
            }
            t._bg.height = t.node.height;
            t._bg.width = t.node.width;
        }
        else {
        }
    }

    protected onSelectedChanged(pVal: boolean): void {
        let t = this;
        t._bgSelect.active = pVal;
    }

    public closePanel() {
        this.setData(null);
    }

    protected onClickCallback(e: cc.Event): void {
        let t = this;
        super.onClickCallback(e);
        console.log("点击了" + t._curData);
    }
}
