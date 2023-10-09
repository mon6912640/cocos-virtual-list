/*
 * @Author: your name
 * @Date: 2020-03-02 10:45:31
 * @LastEditTime: 2020-05-25 17:06:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \RPG_Cocos\assets\script\s\com\ButtonStyle.ts
 */


// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property, menu } = cc._decorator;
@ccclass
@menu('自定义组件/按钮')
export default class ButtonStyle extends cc.Component {
    private myScalex: number = 1;
    private myScaley: number = 1;


    @property(cc.Node)
    node_: cc.Node = null;
    @property(cc.Node)
    nodeArr: cc.Node[] = [];

    start() {
        if (this.node_ == null) {
            this.node_ = this.node;
        }
        this.myScalex = this.node_.scaleX;
        this.myScaley = this.node_.scaleY;
        this.setStyle();
    }

    /**
     * 设置按钮效果
     */
    setStyle() {
        this.node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            // event.stopPropagation();
            if (this.node_ && this.node_.isValid) {
                this.node_.scaleX = this.myScalex * 0.9;
                this.node_.scaleY = this.myScaley * 0.9;
            }
            for (let i = 0; this.nodeArr && i < this.nodeArr.length; i++) {
                let node = this.nodeArr[i];
                if (cc.isValid(node)) {
                    node.scaleX = this.myScalex * 0.9;
                    node.scaleY = this.myScaley * 0.9;
                }
            }
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            // event.stopPropagation();
            if (this.node_ && this.node_.isValid) {
                this.node_.scaleX = this.myScalex;
                this.node_.scaleY = this.myScaley;
            }
            for (let i = 0; this.nodeArr && i < this.nodeArr.length; i++) {
                let node = this.nodeArr[i];
                if (cc.isValid(node)) {
                    node.scaleX = this.myScalex;
                    node.scaleY = this.myScaley;
                }
            }
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch) => {
            // event.stopPropagation();
            if (this.node_ && this.node_.isValid) {
                this.node_.scaleX = this.myScalex;
                this.node_.scaleY = this.myScaley;
            }
            for (let i = 0; this.nodeArr && i < this.nodeArr.length; i++) {
                let node = this.nodeArr[i];
                if (cc.isValid(node)) {
                    node.scaleX = this.myScalex;
                    node.scaleY = this.myScaley;
                }
            }
        }, this);
    }
    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START);
        this.node.off(cc.Node.EventType.TOUCH_END);
    }
}
