export class MathUtil {
    public static random(min: number, max: number): number {
        return min + Math.floor(Math.random() * (max - min + 1));
    }
    public static rndLength(dir: number, length: number, min: number, max: number): number {
        if (dir == 1) {
            var left = length - min;
            return left + min + Math.round(Math.random() * (max - min));
        }
        else {
            var left = min - length;
            return left - min + Math.round(Math.random() * (min - max));
        }
    }
    public static getPosValue(start: number, end: number, rate: number) {
        var value: number = start + rate * (end - start);
        value = end > start ? (value > end ? end : value) : (value < end ? end : value);
        return value;
    }
    /**注意 这个距离没有开平方根*/
    public static distance(px1, py1, px2, py2): number {
        var gx = px1 - px2;
        var gy = py1 - py2;
        var dis: number = gx * gx + gy * gy;
        return dis;
    }
    /** 求最小公倍数 */
    static getLCM(va: number, vb: number) {
        if (va == vb)
            return va;
        if (va > vb) {
            var t_small = vb; //存放两个数中最小的
            var t_big = va; //存放两个数中最大的
        }
        else {
            t_small = va;
            t_big = vb;
        }
        let t_max = t_small * t_big; //求两个数的乘积
        while (t_small != 0) {
            t_big = t_big > t_small ? t_big : t_small;
            let m = t_big % t_small;
            t_big = t_small;
            t_small = m;
        }
        return t_max / t_big;
    }
    /** 随机一个整数 */
    public static randomInt(min: number, max: number) {
        var floatNum = Math.random() * (max - min + 1) >> 0;
        var ret = min + floatNum;
        if (ret > max) {
            ret = max;
        }
        return ret;
    }
    /**
     * 随机抽出数组中的一个元素
     * @static
     * @param {any[]} pArray
     * @returns {*}
     * @memberof MathUtil
     */
    public static randomElement(pArray: any[]): any {
        return pArray[Math.floor(Math.random() * pArray.length)];
    }
    /**
     * 将数组随机乱序
     * @static
     * @param {any[]} pSource
     * @returns {any[]}
     * @memberof MathUtil
     */
    public static randomArray(pSource: any[]): any[] {
        //选择法乱序（效率最优）
        var t_result = pSource.slice();
        var i: number = t_result.length;
        var t_temp: any;
        var t_indexA: number;
        var t_indexB: number;
        while (i) {
            t_indexA = i - 1;
            t_indexA = Math.floor(Math.random() * i);
            i--;
            if (t_indexA == t_indexB)
                continue;
            t_temp = t_result[t_indexA];
            t_result[t_indexA] = t_result[t_indexB];
            t_result[t_indexB] = t_temp;
        }
        return t_result;
        // //传统插入法乱序
        // var t_clone:any[] = $source.slice();
        // var t_result:any[] = [];
        // var i:number = t_clone.length;
        // while(i)
        // {
        // 	t_result.push(t_clone.splice(Math.floor(Math.random()*i--),1)[0]);
        // }
        // return t_result;
        // //自身插入法乱序（传统插入法的修改版），数组元素200个以上，效率比传统插入法低
        // var t_result:any[] = $source.slice();
        // var i:number = t_result.length;
        // while(i)
        // {
        // 	t_result.push(t_result.splice(Math.floor(Math.random()*i--),1)[0]);
        // }
        // return t_result;
    }
    /**
     * 计算索引值
     * @param  {number} pCurIndex
     * @param  {number} pDiff
     * @param  {number} pMax
     * @returns number
     */
    public static calIndex(pCurIndex: number, pDiff: number, pMax: number): number {
        var t_result: number = (pCurIndex + pDiff) % pMax;
        if (t_result < 0) {
            t_result = pMax + t_result;
        }
        return t_result;
    }
    /**
     * 浮点数保留几位小数
     * @param value 需要转换的数字
     * @param len 保留的位数
     */
    public static floatNumToLen(value: number, len: number): number {
        let unit: number = Math.pow(10, len);
        return Math.floor(value * unit) / unit;
    }
    /**
   * 弧度制转换为角度值
   * @param {number} radian
   * @returns {number}
   */
    static getAngle(radian: number): number {
        return 180 * radian / Math.PI;
    }
    /**
     * 角度值转换为弧度制
     * @param {number} angle
     */
    static getRadian(angle: number): number {
        return angle / 180 * Math.PI;
    }
}
