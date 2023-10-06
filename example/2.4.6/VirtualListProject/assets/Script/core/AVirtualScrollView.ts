import AItemRenderer from "./AItemRenerer";

const { ccclass, property } = cc._decorator;

/**
 * 虚拟滚动视图 扩展cc.ScrollView
 * 渲染预制体必需挂载 AItemRenderer子类
 * @author slf
 */
@ccclass
export default class AVirtualScrollView extends cc.ScrollView {
    /**渲染预制体必需挂载 AItemRenderer子类 */
    @property({ type: cc.Prefab, serializable: true, displayName: "渲染预制体" })
    itemRenderPF: cc.Prefab = null;

    /**子项点击 回调函数  回调作用域*/
    protected callback: Function;
    protected cbThis: any;

    /**最大渲染预制体 垂直数量 */
    private verticalCount: number;
    /**最大渲染预制体 水平数量 */
    private horizontalCount: number;
    /**预制体宽高 */
    private itemW: number;
    private itemH: number;
    /**定时器 */
    private interval: number;
    /**预制体池 */
    private itemPool: cc.Node[];
    /**预制体列表 */
    private itemList: cc.Node[];
    /**预制体渲染类列表 */
    private itemComList: AItemRenderer<any>[];
    /**数据列表 */
    // private dataList: any[];
    /**开始坐标 */
    private startPos: cc.Vec2;
    /**布局*/
    private contentLayout: cc.Layout;

    /**强制刷新 */
    private forcedRefresh: boolean;
    /**刷新 */
    private refresh: boolean;

    private _numItems: number = 0;
    itemRenderer: (index: number, itemNode: cc.Node) => void;

    protected onLoad(): void {
        let t = this;
        t.itemList = [];
        t.itemPool = [];
        t.itemComList = [];
        t.contentLayout = t.content.getComponent(cc.Layout);
        t.contentLayout.enabled = false;

        //起始位置
        let itemNode: cc.Node = t.itemRenderPF.data;
        t.startPos = new cc.Vec2(itemNode.width * itemNode.anchorX + t.contentLayout.paddingLeft, -(itemNode.height * itemNode.anchorY + t.contentLayout.paddingTop));
        //预制体宽高
        t.itemW = itemNode.width + t.contentLayout.spacingX;
        t.itemH = itemNode.height + t.contentLayout.spacingY;
        //垂直、水平最大预制体数量
        t.horizontalCount = Math.ceil(t.node.width / t.itemW) + 1;
        t.verticalCount = Math.ceil(t.node.height / t.itemH) + 1;

        if (t.contentLayout.type == cc.Layout.Type.GRID) {
            if (t.contentLayout.startAxis == cc.Layout.AxisDirection.HORIZONTAL) {
                t.horizontalCount = Math.floor(t.node.width / t.itemW);
            } else {
                t.verticalCount = Math.floor(t.node.height / t.itemH);
            }
        }
    }

    protected onDestroy(): void {
        // this.dataList = null;
        this._numItems = 0;
        this.itemList = null;
        this.itemComList = null;
        clearInterval(this.interval);
    }

    /**利用cc.ScrollView本身方法 来标记滑动中 */
    setContentPosition(position: cc.Vec2) {
        super.setContentPosition(position);
        this.refresh = true;
    }

    /**
    * 设置列表 子项点击回调
    * 回调会携带当前子项的 data
    * @param cb 回调
    * @param cbT 作用域
    */
    public setTouchItemCallback(cb: Function, cbT: any): void {
        this.callback = cb;
        this.cbThis = cbT;
    }

    /**选中数据 */
    private onItemTap(data: any): void {
        this.callback && this.callback.call(this.cbThis, data);
    }

    /**
     * 刷新数据
     * @param data 数据源 单项|队列
     */
    public refreshData(data: any | any[]): void {
        if (Array.isArray(data)) {
            // this.dataList = data;
            this._numItems = data.length;
        } else {
            // this.dataList = [data];
            this._numItems = 1;
        }

        if (this.interval) {
            clearInterval(this.interval);
        }
        this.addItem();
        this.refreshContentSize();
        this.forcedRefresh = true;
        this.refresh = true;
        this.interval = setInterval(this.refreshItem.bind(this), 1000 / 10); //定时刷新
    }


    /**添加预制体 */
    private addItem(): void {
        let len: number = 0;
        switch (this.contentLayout.type) {
            case cc.Layout.Type.HORIZONTAL:
                len = this.horizontalCount;
                break;
            case cc.Layout.Type.VERTICAL:
                len = this.verticalCount;
                break;
            case cc.Layout.Type.GRID:
                len = this.horizontalCount * this.verticalCount;
                break;
        }
        // len = Math.min(len, this.dataList.length);
        len = Math.min(len, this._numItems);

        let itemListLen = this.itemList.length;
        if (itemListLen < len) {
            for (var i = itemListLen; i < len; i++) {
                let child = this.itemPool.length > 0 ? this.itemPool.shift() : cc.instantiate(this.itemRenderPF);
                this.content.addChild(child);
                this.itemList.push(child);
                let itemCom = child.getComponent(AItemRenderer);
                this.itemComList.push(itemCom);

                if (itemCom.isClick) {
                    itemCom.setTouchCallback(this.onItemTap, this);
                }
            }
        } else {
            let cL: number = this.content.childrenCount;
            while (cL > len) {
                let item = this.itemList[cL - 1];
                this.content.removeChild(item);
                this.itemList.splice(cL - 1, 1);
                this.itemComList.splice(cL - 1, 1);
                this.itemPool.push(item);
                cL = this.content.childrenCount;
            }
        }
    }

    /**根据数据数量 改变content宽高 */
    private refreshContentSize(): void {
        let layout: cc.Layout = this.contentLayout;
        // let dataListLen: number = this.dataList.length;
        let dataListLen = this._numItems;
        switch (this.contentLayout.type) {
            case cc.Layout.Type.VERTICAL:
                this.content.height = layout.paddingTop + dataListLen * this.itemH + layout.paddingBottom;
                console.log("this.content.height=" + this.content.height);
                break;
            case cc.Layout.Type.HORIZONTAL:
                this.content.width = layout.paddingLeft + dataListLen * this.itemW + layout.paddingRight;
                break;
            case cc.Layout.Type.GRID:
                if (this.contentLayout.startAxis == cc.Layout.AxisDirection.HORIZONTAL) {
                    this.content.height = layout.paddingTop + Math.ceil(dataListLen / this.horizontalCount) * this.itemH + layout.paddingBottom;
                } else if (this.contentLayout.startAxis == cc.Layout.AxisDirection.VERTICAL) {
                    this.content.width = layout.paddingLeft + Math.ceil(dataListLen / this.verticalCount) * this.itemW + layout.paddingRight;
                }
                break;
        }
    }

    /**刷新预制体位置 和 数据填充 */
    private refreshItem(): void {
        if (!this.refresh) {
            return;
        }
        switch (this.contentLayout.type) {
            case cc.Layout.Type.HORIZONTAL:
                this.refreshHorizontal();
                break;
            case cc.Layout.Type.VERTICAL:
                this.refreshVertical();
                break;
            case cc.Layout.Type.GRID:
                this.refreshGrid();
                break;
        }
        this.refresh = false;
        this.forcedRefresh = false;
    }

    /**刷新水平 */
    private refreshHorizontal() {
        let start = Math.floor(Math.abs(this.getContentPosition().x) / this.itemW);
        if (start < 0 || this.getContentPosition().x > 0) {                //超出边界处理
            start = 0;
        }
        let end = start + this.horizontalCount;
        // if (end > this.dataList.length) {//超出边界处理
        //     end = this.dataList.length;
        //     start = Math.max(end - this.horizontalCount, 0);
        // }
        if (end > this._numItems) {//超出边界处理
            end = this._numItems;
            start = Math.max(end - this.horizontalCount, 0);
        }
        let tempV = 0;
        let itemListLen = this.itemList.length;
        for (var i = 0; i < itemListLen; i++) {
            let idx = (start + i) % itemListLen;
            let item = this.itemList[idx];
            tempV = this.startPos.x + ((start + i) * this.itemW);
            if (item.x != tempV || this.forcedRefresh) {
                // console.log("修改的数据=" + (start + i))
                item.x = tempV;
                // this.itemRendererList[idx].data = this.dataList[start + i];
                if (this.itemRenderer) {
                    this.itemRenderer(start + i, item); // 传递索引和item
                }
            }
        }
    }

    /**刷新垂直 */
    private refreshVertical(): void {
        let start = Math.floor(Math.abs(this.getContentPosition().y) / this.itemH);
        if (start < 0 || this.getContentPosition().y < 0) {
            start = 0;
        }

        let end = start + this.verticalCount;
        // if (end > this.dataList.length) {
        //     end = this.dataList.length;
        //     start = Math.max(end - this.verticalCount, 0);
        // }
        if (end > this._numItems) {
            end = this._numItems;
            start = Math.max(end - this.verticalCount, 0);
        }

        let tempV = 0;
        let itemListLen = this.itemList.length;
        for (var i = 0; i < itemListLen; i++) {
            let idx = (start + i) % itemListLen;
            let item = this.itemList[idx];
            tempV = this.startPos.y + (-(start + i) * this.itemH);
            if (item.y != tempV || this.forcedRefresh) {
                console.log("修改的数据=" + (start + i))
                item.y = tempV;
                // this.itemRendererList[idx].data = this.dataList[start + i];
                if (this.itemRenderer) {
                    this.itemRenderer(start + i, item); // 传递索引和item
                }
            }
        }
    }

    /**刷新网格 */
    private refreshGrid(): void {
        //是否垂直方向 添加网格
        let isVDirection = this.contentLayout.startAxis == cc.Layout.AxisDirection.VERTICAL;
        let start = Math.floor(Math.abs(this.getContentPosition().y) / this.itemH) * this.horizontalCount;
        if (isVDirection) {
            start = Math.floor(Math.abs(this.getContentPosition().x) / this.itemW) * this.verticalCount;
            if (this.getContentPosition().x > 0) {
                start = 0;
            }
        } else if (this.getContentPosition().y < 0) {
            start = 0;
        }

        if (start < 0) {
            start = 0;
        }

        let end = start + this.horizontalCount * this.verticalCount;
        // if (end > this.dataList.length) {
        //     end = this.dataList.length;
        //     start = Math.max(end - this.horizontalCount * this.verticalCount, 0);
        // }
        if (end > this._numItems) {
            end = this._numItems;
            start = Math.max(end - this.horizontalCount * this.verticalCount, 0);
        }

        let tempX = 0;
        let tempY = 0;
        let itemListLen = this.itemList.length;
        for (var i = 0; i < itemListLen; i++) {
            let idx = (start + i) % itemListLen;
            let item = this.itemList[idx];
            if (isVDirection) {
                tempX = this.startPos.x + (Math.floor((start + i) / this.verticalCount)) * this.itemW;
                tempY = this.startPos.y + -((start + i) % this.verticalCount) * this.itemH;
            } else {
                tempX = this.startPos.x + ((start + i) % this.horizontalCount) * this.itemW;
                tempY = this.startPos.y + -(Math.floor((start + i) / this.horizontalCount)) * this.itemH;
            }

            if (item.y != tempY || item.x != tempX || this.forcedRefresh) {
                // console.log("修改的数据=" + (start + i))
                item.x = tempX;
                item.y = tempY;
                // this.itemRendererList[idx].data = this.dataList[start + i];
                if (this.itemRenderer) {
                    this.itemRenderer(start + i, item); // 传递索引和item
                }
            }
        }
    }


    get numItems(): number {
        let t = this;
        return t._numItems;
    }

    set numItems(value: number) {
        let t = this;
        t._numItems = value;

        if (t.interval) {
            clearInterval(t.interval);
        }
        t.addItem();
        t.refreshContentSize();
        t.forcedRefresh = true;
        t.refresh = true;
        t.interval = setInterval(t.refreshItem.bind(this), 1000 / 10); //定时刷新
    }
}
