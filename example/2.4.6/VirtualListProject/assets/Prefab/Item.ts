// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AItemRenderer from "../Script/core/AItemRenerer";


const { ccclass, property } = cc._decorator;

@ccclass
export default class item extends AItemRenderer<string> {


    private _defaultH = 0;

    private _lblName: cc.Label = null;
    private _bg:cc.Node = null;

    protected onLoad(): void {
        let t = this;
        t.callback = t.onClick;
        t.cbThis = t;
        t._lblName = t.node.getChildByName("lblName").getComponent(cc.Label);
        t._bg = t.node.getChildByName("bg");

        t._defaultH = t.node.height;
    }

    protected dataChanged(): void {
        cc.find("lblName", this.node).getComponent(cc.Label).string = this.data;
    }

    private onClick(pData: any) {
        let t = this;
        console.log("点击了" + pData);
    }

    private _curData: any;
    public setData(pData: any) {
        let t = this;
        t._curData = pData;
        if (pData) {
            t._lblName.string = "" + pData;

            let id = ~~pData;
            if (id % 2 == 0) {
                t.node.height = t._defaultH;
                t._bg.color = cc.Color.WHITE;
            }
            else {
                t.node.height = t._defaultH * 2;
                t._bg.color = cc.Color.RED;
            }
            t._bg.height = t.node.height;
        }
        else {
        }
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
