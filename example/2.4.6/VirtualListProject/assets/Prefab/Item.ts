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

    protected onLoad(): void {
        let t = this;
        t.callback = t.onClick;
        t.cbThis = t;
    }

    protected dataChanged(): void {
        cc.find("lblName", this.node).getComponent(cc.Label).string = this.data;
    }

    private onClick(pData: any) {
        let t = this;
        console.log("点击了" + pData);
    }
}
