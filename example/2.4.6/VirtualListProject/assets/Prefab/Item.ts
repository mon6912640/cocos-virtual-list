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


    private _lblName: cc.Label = null;
    protected onLoad(): void {
        let t = this;
        t.callback = t.onClick;
        t.cbThis = t;
        t._lblName = cc.find("lblName", t.node).getComponent(cc.Label);
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
            t._lblName.string = "f " + pData;
        }
        else {
        }
    }

    public closePanel() {
        this.setData(null);
    }
}
