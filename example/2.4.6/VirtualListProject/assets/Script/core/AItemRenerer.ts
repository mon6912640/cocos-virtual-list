const { ccclass, property } = cc._decorator;
/**
 * 单项渲染基类 T数据结构
 * @author slf
 *  */
@ccclass
export default class AItemRenderer extends cc.Component {
    @property({ displayName: "是否添加点击事件" })
    isClick: boolean = false;

    index = 0;

    protected _callback: (pIndex: number) => void;       //回调函数
    protected _cbThis: any;              //回调作用域

    /**销毁 */
    public onDestroy(): void {
        this._callback = null;
        this._cbThis = null;
    }

    /**
     * 设置点击回调
     * @param pCallback 回调函数
     * @param pCbThis 回调作用域
     */
    public setTouchCallback(pCallback?: (pIndex: number) => void, pCbThis?: any): void {
        this._callback = pCallback;
        this._cbThis = pCbThis;
        if (this.node) {
            if (this.node.hasEventListener(cc.Node.EventType.TOUCH_END)) {
                this.node.off(cc.Node.EventType.TOUCH_END, this.onClickCallback, this);
            }
            this.node.on(cc.Node.EventType.TOUCH_END, this.onClickCallback, this);
        }
    }

    /**
     * 预制体点击回调 会携带data
     * @param e 
     */
    protected onClickCallback(e: cc.Event): void {
        let t = this;
        if (t._callback) {
            console.log(`点击了 index=${t.index}`);
            t._callback.call(t._cbThis, t.index);
        }
    }
}
