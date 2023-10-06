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

    private _defaultW = 0;
    private _defaultH = 0;
    private _itemAnchorX = 0;
    private _itemAnchorY = 0;
    private _dyncSize = false;

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
        t._itemAnchorX = itemNode.anchorX;
        t._itemAnchorY = itemNode.anchorY;
        t._defaultW = itemNode.width;
        t._defaultH = itemNode.height;
        t.startPos = new cc.Vec2(itemNode.width * itemNode.anchorX + t.contentLayout.paddingLeft, -(itemNode.height * itemNode.anchorY + t.contentLayout.paddingTop));
        //预制体宽高
        t.itemW = itemNode.width + t.contentLayout.spacingX;
        t.itemH = itemNode.height + t.contentLayout.spacingY;
        //垂直、水平最大预制体数量
        t.horizontalCount = Math.ceil(t.node.width / t.itemW) + 2;
        t.verticalCount = Math.ceil(t.node.height / t.itemH) + 2;

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
        this.refresh = true; //标记刷新
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

    // /**
    //  * 刷新数据
    //  * @param data 数据源 单项|队列
    //  */
    // public refreshData(data: any | any[]): void {
    //     if (Array.isArray(data)) {
    //         // this.dataList = data;
    //         this._numItems = data.length;
    //     } else {
    //         // this.dataList = [data];
    //         this._numItems = 1;
    //     }

    //     if (this.interval) {
    //         clearInterval(this.interval);
    //     }
    //     this.addItem();
    //     this.refreshContentSize();
    //     this.forcedRefresh = true;
    //     this.refresh = true;
    //     this.interval = setInterval(this.refreshItem.bind(this), 1000 / 10); //定时刷新
    // }


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
                // console.log("this.content.height=" + this.content.height);
                if (this._dyncSize) {
                    this._dyncSize = false;
                    let t_itemTotalH = 0;
                    for (let i = 0; i < dataListLen; i++) {
                        let t_vo = this.getVo(i);
                        t_itemTotalH += (t_vo.realH ? t_vo.realH : this._defaultH) + layout.spacingY;
                    }
                    this.content.height = layout.paddingTop + t_itemTotalH + layout.paddingBottom;
                }
                else {
                    this.content.height = layout.paddingTop + dataListLen * this.itemH + layout.paddingBottom;
                }
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
        let t_contentRefresh = false;
        // let start = Math.floor(Math.abs(this.getContentPosition().y) / this.itemH);
        let start = this.getIndexByPos(this.getContentPosition(), this.contentLayout.type);
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

        console.log("=====================================");
        // console.log("this.getContentPosition().y=" + this.getContentPosition().y);
        console.log("start=" + start + " end=" + end);

        let tempV = 0;
        let itemListLen = this.itemList.length;
        // console.log("itemListLen=" + itemListLen);
        for (var i = 0; i < itemListLen; i++) {
            let idx = (start + i) % itemListLen;
            let item = this.itemList[idx];
            // tempV = this.startPos.y + (-(start + i) * this.itemH);
            let t_vo = this.getVo(start + i);
            tempV = t_vo.y;
            if (item.y != tempV || this.forcedRefresh) {
                console.log("修改的数据=" + (start + i))
                item.y = tempV;
                console.log(`index= ${start + i}, item.y= ${item.y}`);

                console.log(`t_vo.y= ${t_vo.y}`);
                // this.itemRendererList[idx].data = this.dataList[start + i];
                if (this.itemRenderer) {
                    this.itemRenderer(start + i, item); // 传递索引和item
                }
                console.log("item.height=" + item.height);

            }
            if (item.height != this._defaultH && t_vo.realH != item.height) {
                //重新计算content高度
                t_vo.realH = item.height;
                t_contentRefresh = true;
            }
        }
        if (t_contentRefresh) {
            this._dyncSize = true;
            this.calAllVoPos();
            this.refreshContentSize();
            this.refreshVertical();
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

        for (let i = 0; i < value; i++) {
            let t_vo = new AVItemVo();
            t_vo.index = i;
        }

        if (t.interval) {
            clearInterval(t.interval);
        }
        t.addItem();
        t.refreshContentSize();
        t.calAllVoPos(true);
        t.forcedRefresh = true;
        t.refresh = true;
        t.interval = setInterval(t.refreshItem.bind(this), 1000 / 10); //定时刷新
    }

    private _voList: AVItemVo[] = [];
    private calAllVoPos(pClear = false) {
        let t = this;
        if (pClear) {
            t._voList.length = 0;
            for (let i = 0; i < t._numItems; i++) {
                let t_vo = new AVItemVo();
                t_vo.index = i;
                t._voList.push(t_vo);
                switch (this.contentLayout.type) {
                    case cc.Layout.Type.HORIZONTAL:
                        t_vo.x = t.startPos.x + (i * t.itemW);
                        t_vo.y = t.startPos.y;
                        break;
                    case cc.Layout.Type.VERTICAL:
                        t_vo.x = t.startPos.x;
                        t_vo.y = t.startPos.y + -(i * t.itemH);
                        break;
                    case cc.Layout.Type.GRID:
                        if (this.contentLayout.startAxis == cc.Layout.AxisDirection.HORIZONTAL) {
                            t_vo.x = t.startPos.x + (Math.floor(i / t.verticalCount)) * t.itemW;
                            t_vo.y = t.startPos.y + -((i % t.verticalCount)) * t.itemH;
                        } else if (this.contentLayout.startAxis == cc.Layout.AxisDirection.VERTICAL) {
                            t_vo.x = t.startPos.x + ((i % t.horizontalCount)) * t.itemW;
                            t_vo.y = t.startPos.y + -(Math.floor(i / t.horizontalCount)) * t.itemH;
                        }
                        break;
                }
                t_vo.letf = t_vo.x - t._itemAnchorX * t._defaultW;
                t_vo.right = t_vo.x + (1 - t._itemAnchorX) * t._defaultW;
                t_vo.top = t_vo.y + (1 - t._itemAnchorY) * t._defaultH;
                t_vo.bottom = t_vo.y - t._itemAnchorY * t._defaultH;
            }
        }
        else {
            let t_accRight = t.contentLayout.paddingLeft;
            let t_accBottom = -t.contentLayout.paddingTop;
            for (let i = 0; i < t._numItems; i++) {
                let t_vo = t._voList[i];
                switch (this.contentLayout.type) {
                    case cc.Layout.Type.HORIZONTAL:
                        let t_showW = t_vo.realW ? t_vo.realW : t._defaultW;
                        t_vo.x = t_accRight + t_showW * t._itemAnchorX;
                        t_vo.y = t.startPos.y;
                        t_accRight = t_vo.x + t.contentLayout.spacingX + t_showW * (1 - t._itemAnchorX);
                        t_vo.letf = t_vo.x - t._itemAnchorX * t_showW;
                        t_vo.right = t_vo.x + (1 - t._itemAnchorX) * t_showW;
                        t_vo.top = t_vo.y + (1 - t._itemAnchorY) * t._defaultH;
                        t_vo.bottom = t_vo.y - t._itemAnchorY * t._defaultH;
                        break;
                    case cc.Layout.Type.VERTICAL:
                        let t_showH = t_vo.realH ? t_vo.realH : t._defaultH;
                        t_vo.x = t.startPos.x;
                        t_vo.y = t_accBottom - t_showH * t._itemAnchorY;
                        t_accBottom = t_vo.y - t.contentLayout.spacingY - t_showH * (1 - t._itemAnchorY);
                        t_vo.letf = t_vo.x - t._itemAnchorX * t._defaultW;
                        t_vo.right = t_vo.x + (1 - t._itemAnchorX) * t._defaultW;
                        t_vo.top = t_vo.y + (1 - t._itemAnchorY) * t_showH;
                        t_vo.bottom = t_vo.y - t._itemAnchorY * t_showH;
                        break;
                    case cc.Layout.Type.GRID:
                        //不支持动态尺寸
                        break;
                }
            }
        }

        if(this.contentLayout.type == cc.Layout.Type.VERTICAL){
            for(let i = 0; i< t._numItems; i++){
                let t_vo = t._voList[i];
                console.log(`t_vo.y= ${t_vo.y}, t_vo.top= ${t_vo.top}, t_vo.bottom= ${t_vo.bottom}`);
            }
        }
    }

    private getVo(pIndex: number) {
        let t = this;
        return t._voList[pIndex];
    }

    private getIndexByPos(pPos: cc.Vec2, pLayoutType: cc.Layout.Type) {
        let t = this;
        let t_index = 0;
        console.log(`pPos.x= ${pPos.x}, pPos.y= ${pPos.y}`);
        switch (pLayoutType) {
            case cc.Layout.Type.HORIZONTAL:
                for (let i = 0; i < t._numItems; i++) {
                    let t_vo = t.getVo(i);
                    if (pPos.x >= t_vo.letf && pPos.x <= t_vo.right + t.contentLayout.spacingX) {
                        t_index = i;
                        break;
                    }
                }
                return t_index;
            case cc.Layout.Type.VERTICAL:
                for (let i = 0; i < t._numItems; i++) {
                    let t_vo = t.getVo(i);
                    if (-pPos.y <= t_vo.top && -pPos.y >= t_vo.bottom - t.contentLayout.spacingY) {
                        console.log(`pPos.y= ${pPos.y}, t_vo.top= ${t_vo.top}, t_vo.bottom= ${t_vo.bottom}`);
                        t_index = i;
                        break;
                    }
                }
                return t_index;
        }
    }
}

class AVItemVo {
    index = 0;
    item: cc.Node = null;
    x = 0;
    y = 0;
    realW = 0;
    realH = 0;
    letf = 0;
    right = 0;
    top = 0;
    bottom = 0;
}