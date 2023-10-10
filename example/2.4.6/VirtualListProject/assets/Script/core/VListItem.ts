const { ccclass, property } = cc._decorator;
/**
 * 单项渲染基类 T数据结构
 * @author slf
 *  */
@ccclass
export default class VListItem extends cc.Component {
    @property({ displayName: "是否添加点击事件" })
    isClick: boolean = false;

    index = 0;

    /** 回调函数 */
    protected _callback: (pIndex: number) => void;
    /** 回调作用域 */
    protected _cbThis: any;

    /**销毁 */
    public onDestroy(): void {
        this._callback = null;
        this._cbThis = null;
    }

    protected _selected: boolean = false;
    get selected(): boolean {
        let t = this;
        return t._selected;
    }

    set selected(pValue: boolean) {
        let t = this;
        t._selected = pValue;
        t.onSelectedChanged(pValue);
    }

    /** 选中处理 */
    protected onSelectedChanged(pVal: boolean): void {
        //供子类重写
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
                this.node.off(cc.Node.EventType.TOUCH_END, this.onClickCallback, this, true);
            }
            this.node.on(cc.Node.EventType.TOUCH_END, this.onClickCallback, this, true);
        }
    }

    /**
     * 预制体点击回调 会携带data
     * @param e 
     */
    protected onClickCallback(e: cc.Event): void {
        let t = this;
        if (t._callback) {
            t._callback.call(t._cbThis, t.index);
        }
    }
}
