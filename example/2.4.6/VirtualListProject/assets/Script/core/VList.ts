import VListItem from "./VListItem";

const { ccclass, property } = cc._decorator;

export enum SelectMode {
    None,
    Single,
    Multiple,
}

export enum ListEvent {
    /** 选中改变事件 */
    SELECT_CHANGE = "select_change",
    /** 多选改变时间 */
    SELECTIONS_CHANGE = "selections_change",
}

/**
 * 虚拟滚动视图 扩展cc.ScrollView 支持item动态尺寸
 * 渲染预制体必需挂载 AItemRenderer子类
 * @author slf
 */
@ccclass
export default class VList extends cc.ScrollView {
    /**渲染预制体必需挂载 AItemRenderer子类 */
    @property({ type: cc.Prefab, serializable: true, displayName: "渲染预制体" })
    itemRenderPF: cc.Prefab = null;

    @property({ type: cc.Enum(SelectMode), serializable: true, displayName: "选择模式" })
    selectMode: SelectMode = SelectMode.None;

    /**子项点击 回调函数  回调作用域*/
    protected callback: (pIndex: number) => void;
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
    private itemComList: VListItem[];
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
    private _diffVo: DiffVo;

    private _numItems: number = 0;
    itemRenderer: (itemNode: cc.Node, index: number) => void;
    private _curSelectedIndex: number = -1;
    private _selectedIndices: number[] = [];
    /** 滚动的目标index */
    private _scrollTargetIndex: number = -1;

    protected onLoad(): void {
        let t = this;
        t._diffVo = new DiffVo();
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
        t.horizontalCount = Math.ceil(t.node.width / t.itemW) + 1;
        t.verticalCount = Math.ceil(t.node.height / t.itemH) + 1;
        console.log(`t.horizontalCount= ${t.horizontalCount}, t.verticalCount= ${t.verticalCount}`);

        if (t.contentLayout.type == cc.Layout.Type.GRID) {
            if (t.contentLayout.startAxis == cc.Layout.AxisDirection.HORIZONTAL) {
                t.horizontalCount = Math.floor(t.node.width / t.itemW);
            } else {
                t.verticalCount = Math.floor(t.node.height / t.itemH);
            }
        }
    }

    protected onDestroy(): void {
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
    public setTouchItemCallback(cb: (pIndex: number) => void, cbT: any): void {
        this.callback = cb;
        this.cbThis = cbT;
    }

    /**选中数据 */
    private onItemTap(pIndex: number): void {
        let t = this;
        t.callback && t.callback.call(t.cbThis, pIndex);
        switch (t.selectMode) {
            case SelectMode.Single:
                t.setSelectedIndex(pIndex, true);
                break;
            case SelectMode.Multiple:
                if (t._selectedIndices.indexOf(pIndex) == -1) {
                    t.addSeletion(pIndex, true);
                }
                else {
                    t.removeSelection(pIndex, true);
                }
                break;
        }
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
        len = Math.min(len, this._numItems);

        let itemListLen = this.itemList.length;
        if (itemListLen < len) {
            for (var i = itemListLen; i < len; i++) {
                let child = this.itemPool.length > 0 ? this.itemPool.shift() : cc.instantiate(this.itemRenderPF);
                this.content.addChild(child);
                child.active = false;
                this.itemList.push(child);
                let itemCom = child.getComponent(VListItem);
                this.itemComList.push(itemCom);

                if (itemCom.isClick) {
                    itemCom.setTouchCallback(this.onItemTap, this);
                }
            }
        } else {
            let cL: number = this.content.childrenCount;
            while (cL > len) {
                let item = this.itemList[cL - 1];
                // this.content.removeChild(item);
                item.removeFromParent();
                this.itemList.splice(cL - 1, 1);
                this.itemComList.splice(cL - 1, 1);
                this.itemPool.push(item);
                item.x = 0;
                item.y = 0;
                item.active = false;
                cL = this.content.childrenCount;
            }
        }
    }

    /**根据数据数量 改变content宽高 */
    private refreshContentSize(): void {
        let layout: cc.Layout = this.contentLayout;
        let dataListLen = this._numItems;
        switch (this.contentLayout.type) {
            case cc.Layout.Type.VERTICAL:
                let t_itemTotalH = 0;
                for (let i = 0; i < dataListLen; i++) {
                    let t_vo = this.getVo(i);
                    t_itemTotalH += t_vo.height + layout.spacingY;
                }
                this.content.height = layout.paddingTop + t_itemTotalH + layout.paddingBottom;
                break;
            case cc.Layout.Type.HORIZONTAL:
                let t_itemTotalW = 0;
                for (let i = 0; i < dataListLen; i++) {
                    let t_vo = this.getVo(i);
                    t_itemTotalW += t_vo.width + layout.spacingX;
                }
                this.content.width = layout.paddingLeft + t_itemTotalW + layout.paddingRight;
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

    /**渲染预制体位置 和 数据填充 */
    private renderItem(): void {
        if (!this.refresh) {
            return;
        }
        this._diffVo.reset();
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
    private refreshHorizontal(pContenSizeChanged = false) {
        let t_contentRefresh = false;
        let start = this.getIndexByPos(this.getContentPosition(), this.contentLayout.type);
        if (start < 0 || this.getContentPosition().x > 0) {                //超出边界处理
            start = 0;
        }
        let end = start + this.horizontalCount;
        if (end > this._numItems) {//超出边界处理
            end = this._numItems;
            start = Math.max(end - this.horizontalCount, 0);
        }

        // console.log("=====================================");
        // console.log("start=" + start + " end=" + end);

        let targetV = 0;
        let itemListLen = this.itemList.length;
        for (var i = 0; i < itemListLen; i++) {
            let idx = (start + i) % itemListLen;
            let item = this.itemList[idx];
            let t_vo = this.getVo(start + i);
            targetV = t_vo.x;
            let t_needAdjustContentPos = false; //是否需要调整content位置
            if (item.x != targetV || this.forcedRefresh) {
                console.log("修改数据 " + (start + i))
                let t_com = item.getComponent(VListItem);
                t_com.index = t_vo.index;
                if (targetV < item.x) {
                    //item往前移动的情况需要重新计算content位置
                    t_needAdjustContentPos = true;
                }
                item.x = targetV;
                item.getComponent(VListItem).index = t_vo.index;
                if (this.itemRenderer) {
                    this.itemRenderer(item, start + i); // 传递索引和item
                }
                if (t_com.index == this._curSelectedIndex || this._selectedIndices.indexOf(t_com.index) != -1) {
                    t_com.selected = true;
                }
                else {
                    t_com.selected = false;
                }
                if (item.width != t_vo.width) {
                    //重新计算content尺寸
                    if (t_needAdjustContentPos) {
                        this._diffVo.addW(item.width - t_vo.width); //累积宽度差
                    }
                    t_vo.width = item.width;
                    t_contentRefresh = true;
                }
            }
        }
        if (t_contentRefresh) {
            this.refreshVoData();
            this.refreshContentSize();
            this.refreshHorizontal(true);
            this.adjustContentPos();
        }
        else {
            this.scheduleOnce(() => {
                if (this._scrollTargetIndex != -1) {
                    console.log(`_scrollTargetIndex= ${this._scrollTargetIndex}`);
                    console.log(`重新滚动定位`);
                    this.doScrollToIndex(this._scrollTargetIndex);
                    this._scrollTargetIndex = -1;
                }
            }, 0);
        }
    }

    /**刷新垂直 */
    private refreshVertical(pContenSizeChanged = false): void {
        let t_contentRefresh = false;
        let start = this.getIndexByPos(this.getContentPosition(), this.contentLayout.type);
        if (start < 0 || this.getContentPosition().y < 0) {
            start = 0;
        }

        let end = start + this.verticalCount;
        if (end > this._numItems) {
            end = this._numItems;
            start = Math.max(end - this.verticalCount, 0);
        }

        // console.log("=====================================");
        // console.log("this.getContentPosition().y=" + this.getContentPosition().y);
        // console.log("start=" + start + " end=" + end);

        let targetV = 0;
        let itemListLen = this.itemList.length;
        for (var i = 0; i < itemListLen; i++) {
            let idx = (start + i) % itemListLen;
            let item = this.itemList[idx];
            let t_vo = this.getVo(start + i);
            targetV = t_vo.y;
            let t_needAdjustContentPos = false; //是否需要调整content位置
            if (item.y != targetV || this.forcedRefresh) {
                console.log("修改数据 " + (start + i))
                let t_com = item.getComponent(VListItem);
                t_com.index = t_vo.index;
                if (targetV > item.y) {
                    //item往前移动的情况需要重新计算content位置
                    t_needAdjustContentPos = true;
                }
                item.y = targetV;
                // console.log(`index= ${start + i}, item.y= ${item.y}`);

                // console.log(`t_vo.y= ${t_vo.y}`);
                if (!pContenSizeChanged) {
                    item.active = true;
                    if (this.itemRenderer) {
                        this.itemRenderer(item, start + i); // 传递索引和item
                    }
                    if (t_com.index == this._curSelectedIndex || this._selectedIndices.indexOf(t_com.index) != -1) {
                        t_com.selected = true;
                    }
                    else {
                        t_com.selected = false;
                    }
                }
                // console.log("item.height=" + item.height);
                if (item.height != t_vo.height) {
                    //重新计算content尺寸
                    if (t_needAdjustContentPos) {
                        this._diffVo.addH(item.height - t_vo.height); //累积高度差
                    }
                    t_vo.height = item.height;
                    t_contentRefresh = true;
                }
            }
        }
        if (t_contentRefresh) {
            console.log(`需要调整content尺寸`);
            this.refreshVoData();
            this.refreshContentSize();
            this.refreshVertical(true);
            this.adjustContentPos();
        }
        else {
            this.scheduleOnce(() => {
                if (this._scrollTargetIndex != -1) {
                    console.log(`_scrollTargetIndex= ${this._scrollTargetIndex}`);
                    console.log(`重新滚动定位`);
                    this.doScrollToIndex(this._scrollTargetIndex);
                    this._scrollTargetIndex = -1;
                }
            }, 0);
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
                // console.log("修改数据 " + (start + i))
                item.x = tempX;
                item.y = tempY;
                if (this.itemRenderer) {
                    this.itemRenderer(item, start + i); // 传递索引和item
                }
            }
        }
    }

    /** 调整content的位置 */
    private adjustContentPos() {
        let t = this;
        if (t._diffVo.w == 0 && t._diffVo.h == 0)
            return false;
        let t_contentPos = t.getContentPosition();
        t_contentPos.x -= t._diffVo.w;
        t_contentPos.y += t._diffVo.h; //坐标系不同
        t.setContentPosition(t_contentPos);
        console.log(`adjustContentPos() -- t._diffVo.w= ${t._diffVo.w}, t._diffVo.h= ${t._diffVo.h}`);
        t._diffVo.reset();
        return true;
    }

    private _voList: AVItemVo[] = [];
    /** 计算vo尺寸定位数据 */
    private refreshVoData() {
        let t = this;
        let t_accRight = t.contentLayout.paddingLeft;
        let t_accBottom = -t.contentLayout.paddingTop;
        for (let i = 0; i < t._numItems; i++) {
            let t_vo = t._voList[i];
            if (!t_vo) {
                t_vo = new AVItemVo();
                t_vo.index = i;
                t._voList[i] = t_vo;
                t_vo.width = t._defaultW;
                t_vo.height = t._defaultH;
            }
            switch (this.contentLayout.type) {
                case cc.Layout.Type.HORIZONTAL:
                    let t_showW = t_vo.width;
                    t_vo.x = t_accRight + t_showW * t._itemAnchorX;
                    t_vo.y = t.startPos.y;
                    t_accRight = t_vo.x + t.contentLayout.spacingX + t_showW * (1 - t._itemAnchorX);
                    t_vo.letf = t_vo.x - t._itemAnchorX * t_showW;
                    t_vo.right = t_vo.x + (1 - t._itemAnchorX) * t_showW;
                    t_vo.top = t_vo.y + (1 - t._itemAnchorY) * t._defaultH;
                    t_vo.bottom = t_vo.y - t._itemAnchorY * t._defaultH;
                    break;
                case cc.Layout.Type.VERTICAL:
                    let t_showH = t_vo.height;
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
        if (t._voList.length > t._numItems) {
            //删除多余的
            t._voList.length = t._numItems;
        }

        // if (this.contentLayout.type == cc.Layout.Type.VERTICAL) {
        //     for (let i = 0; i < t._numItems; i++) {
        //         let t_vo = t._voList[i];
        //         console.log(`t_vo.y= ${t_vo.y}, t_vo.top= ${t_vo.top}, t_vo.bottom= ${t_vo.bottom}`);
        //     }
        // }
        // if (this.contentLayout.type == cc.Layout.Type.HORIZONTAL) {
        //     for (let i = 0; i < t._numItems; i++) {
        //         let t_vo = t._voList[i];
        //         console.log(`i= ${t_vo.index}, t_vo.x= ${t_vo.x}, t_vo.letf= ${t_vo.letf}, t_vo.right= ${t_vo.right}`);
        //     }
        // }
    }

    private getVo(pIndex: number) {
        let t = this;
        return t._voList[pIndex];
    }

    private getIndexByPos(pPos: cc.Vec2, pLayoutType: cc.Layout.Type) {
        let t = this;
        let t_index = 0;
        // console.log(`pPos.x= ${pPos.x}, pPos.y= ${pPos.y}`);
        switch (pLayoutType) {
            case cc.Layout.Type.HORIZONTAL:
                for (let i = 0; i < t._numItems; i++) {
                    let t_vo = t.getVo(i);
                    if (-pPos.x >= t_vo.letf && -pPos.x <= t_vo.right + t.contentLayout.spacingX) {
                        t_index = i;
                        break;
                    }
                }
                return t_index;
            case cc.Layout.Type.VERTICAL:
                for (let i = 0; i < t._numItems; i++) {
                    let t_vo = t.getVo(i);
                    if (-pPos.y <= t_vo.top && -pPos.y >= t_vo.bottom - t.contentLayout.spacingY) {
                        // console.log(`pPos.y= ${pPos.y}, t_vo.top= ${t_vo.top}, t_vo.bottom= ${t_vo.bottom}`);
                        t_index = i;
                        break;
                    }
                }
                return t_index;
            default:
                return t_index;
        }
    }

    //=============================================================
    //===========================API===============================
    //=============================================================

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
        t.refreshVoData();
        t.refreshContentSize();
        t.forcedRefresh = true;
        t.refresh = true;
        t.interval = setInterval(t.renderItem.bind(this), 100); //定时刷新
    }

    get selectedIndex(): number {
        let t = this;
        return t._curSelectedIndex;
    }

    /**
     * 选中（单选）
     * @param value 
     * @param pDispatchEvent 是否抛出事件，默认false
     * @returns 
     */
    setSelectedIndex(value: number, pDispatchEvent = false) {
        let t = this;
        if (t._curSelectedIndex == value)
            return;
        t._curSelectedIndex = value;
        for (let i = 0; i < t.itemList.length; i++) {
            let t_com = t.itemList[i].getComponent(VListItem);
            t_com.selected = t_com.index == t._curSelectedIndex;
        }
        if (pDispatchEvent) {
            t.node.emit(ListEvent.SELECT_CHANGE, t._curSelectedIndex);
        }
    }

    /**
     * 添加选中（多选）
     * @param pIndex 
     * @param pDispatchEvent 是否抛出事件，默认false
     */
    addSeletion(pIndex: number, pDispatchEvent = false) {
        let t = this;
        if (t._selectedIndices.indexOf(pIndex) == -1) {
            t._selectedIndices.push(pIndex);
            for (let v of t.itemList) {
                let t_com = v.getComponent(VListItem);
                if (t_com.index == pIndex) {
                    t_com.selected = true;
                    break;
                }
            }
            if (pDispatchEvent)
                t.node.emit(ListEvent.SELECTIONS_CHANGE, t._selectedIndices.concat());
        }
    }

    /**
     * 移除选中（多选）
     * @param pIndex 
     * @param pDispatchEvent 是否抛出事件，默认false
     */
    removeSelection(pIndex: number, pDispatchEvent = false) {
        let t = this;
        let i = t._selectedIndices.indexOf(pIndex);
        if (i != -1) {
            t._selectedIndices.splice(i, 1);
            for (let v of t.itemList) {
                let t_com = v.getComponent(VListItem);
                if (t_com.index == pIndex) {
                    t_com.selected = false;
                    break;
                }
            }
            if (pDispatchEvent)
                t.node.emit(ListEvent.SELECTIONS_CHANGE, t._selectedIndices.concat());
        }
    }

    /**
     * 清除所有选中
     * @param pDispatchEvent 是否抛出事件，默认false
     */
    clearSelections(pDispatchEvent = false) {
        let t = this;
        t._selectedIndices.length = 0;
        for (let v of t.itemList) {
            let t_com = v.getComponent(VListItem);
            t_com.selected = false;
        }
        if (pDispatchEvent)
            t.node.emit(ListEvent.SELECTIONS_CHANGE, []);
    }

    /** 获取选中的index列表 */
    getSelections(): number[] {
        let t = this;
        return t._selectedIndices;
    }

    /**
     * 定位到指定index
     * @param pIndex 
     * @returns 
     */
    scrollToIndex(pIndex: number) {
        let t = this;
        if (t.contentLayout.type == cc.Layout.Type.GRID) //暂不支持网格布局
            return;
        if (pIndex < 0 || pIndex >= t._numItems)
            return;
        if (t._scrollTargetIndex == pIndex)
            return;
        t._scrollTargetIndex = pIndex;
        t.doScrollToIndex(pIndex);
    }

    private doScrollToIndex(pIndex: number) {
        let t = this;
        t.stopAutoScroll(); //停止本来的自动滚动
        let t_dir = 1;
        let t_targetvo = t.getVo(pIndex);
        let t_contentPos = t.getContentPosition();
        console.log(`scrollToIndex= ${pIndex}, 
        t_targetvo.x= ${t_targetvo.x}, 
        t_targetvo.y= ${t_targetvo.y},
        t_targetvo.letf= ${t_targetvo.letf},
        t_targetvo.top= ${t_targetvo.top},
        `);
        console.log(`contentPos= ${t_contentPos.x}, ${t_contentPos.y}`);
        switch (t.contentLayout.type) {
            case cc.Layout.Type.HORIZONTAL:
                t_dir = 1;
                t_contentPos.x = -t_dir * t_targetvo.letf;
                break;
            case cc.Layout.Type.VERTICAL:
                t_dir = -1;
                t_contentPos.y = t_dir * t_targetvo.top;
                break;
            case cc.Layout.Type.GRID:
                break;
        }
        t.setContentPosition(t_contentPos);
        console.log(`contentPos= ${t_contentPos.x}, ${t_contentPos.y}`);
    }
}

class AVItemVo {
    index = 0;
    item: cc.Node = null;
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    letf = 0;
    right = 0;
    top = 0;
    bottom = 0;
}
class DiffVo {
    w = 0;
    h = 0;

    addW(pValue: number) {
        let t = this;
        t.w += pValue;
    }
    addH(pValue: number) {
        let t = this;
        t.h += pValue;
    }
    reset() {
        let t = this;
        t.w = 0;
        t.h = 0;
    }
}