/**
 * Created by yaozhiguo on 2017/1/10.
 *
 * ColorMatrixFilter wrapper class for common use.
 * for a color matrix, every position indicates a color range 0-255.
 *
 * red, green, blue color channel depends on the following functions:
 * redResult   = a[0] * srcR + a[1] * srcG + a[2] * srcB + a[3] * srcA + a[4]
 * greenResult = a[5] * srcR + a[6] * srcG + a[7] * srcB + a[8] * srcA + a[9]
 * blueResult  = a[10] * srcR + a[11] * srcG + a[12] * srcB + a[13] * srcA + a[14]
 * alphaResult = a[15] * srcR + a[16] * srcG + a[17] * srcB + a[18] * srcA + a[19]
 *
 *      R  G  B  A  off
 *  R | 1  0  0  0  0  |
 *  G | 0  1  0  0  0  |
 *  B | 0  0  1  0  0  |
 *  A | 0  0  0  1  0  |
 */
export default class ColorFilterFactory
{
    public static RED_FILTER:egret.ColorMatrixFilter = new egret.ColorMatrixFilter(
        [
            2,0,0,0,0,
            0,1,0,0,0,
            0,0,1,0,0,
            0,0,0,1,0
        ]
    );

    public static GREEN_FILTER:egret.ColorMatrixFilter = new egret.ColorMatrixFilter(
        [
            1,0,0,0,0,
            0,2,0,0,0,
            0,0,1,0,0,
            0,0,0,1,0
        ]
    );

    public static BLUE_FILTER:egret.ColorMatrixFilter = new egret.ColorMatrixFilter(
        [
            1,0,0,0,0,
            0,1,0,0,0,
            0,0,2,0,0,
            0,0,0,1,0
        ]
    );

    /**
     * 色彩饱和度
     * @param n (N取值为0到255)
     */
    public static crateSaturationFilter(n:number):egret.ColorMatrixFilter
    {
        return new egret.ColorMatrixFilter(
            [
                0.3086 * (1 - n) + n, 0.6094 * (1 - n), 0.0820 * (1 - n), 0, 0,
                0.3086 * (1 - n), 0.6094 * (1 - n) + n, 0.0820 * (1 - n), 0, 0,
                0.3086 * (1 - n), 0.6094 * (1 - n), 0.0820 * (1 - n) + n, 0, 0,
                0, 0, 0, 1, 0
            ]
        );
    }

    /**
     * 对比度
     * @param n(N取值为0到10)
     * @returns {egret.ColorMatrixFilter}
     */
    public static createContrastFilter(n:number):egret.ColorMatrixFilter
    {
        return new egret.ColorMatrixFilter(
            [
                n, 0, 0, 0, 128 * (1 - n),
                0, n, 0, 0, 128 * (1 - n),
                0, 0, n, 0, 128 * (1 - n),
                0, 0, 0, 1, 0
            ]
        );
    }

    /**
     * 亮度(N取值为-255到255)
     * @param n
     * @returns {egret.ColorMatrixFilter}
     */
    public static createBrightnessFilter(n:number):egret.ColorMatrixFilter
    {
        return new egret.ColorMatrixFilter(
            [
                1, 0, 0, 0, n,
                0, 1, 0, 0, n,
                0, 0, 1, 0, n,
                0, 0, 0, 1, 0
            ]
        );
    }

    /**
     * 颜色反相
     * @returns {egret.ColorMatrixFilter}
     */
    public static createInversionFilter():egret.ColorMatrixFilter
    {
        return new egret.ColorMatrixFilter(
            [
                -1, 0, 0, 0, 255,
                0, -1, 0, 0, 255,
                0, 0, -1, 0, 255,
                0, 0, 0, 1, 0
            ]
        );
    }

    /**
     * 色相偏移
     * @param n
     * @returns {egret.ColorMatrixFilter}
     */
    public static createHueFilter(n:number):egret.ColorMatrixFilter
    {
        const p1:number = Math.cos(n * Math.PI / 180);
        const p2:number = Math.sin(n * Math.PI / 180);
        const p4:number = 0.213;
        const p5:number = 0.715;
        const p6:number = 0.072;
        return new egret.ColorMatrixFilter(
            [
                p4 + p1 * (1 - p4) + p2 * (0 - p4), p5 + p1 * (0 - p5) + p2 * (0 - p5), p6 + p1 * (0 - p6) + p2 * (1 - p6), 0, 0,
                p4 + p1 * (0 - p4) + p2 * 0.143, p5 + p1 * (1 - p5) + p2 * 0.14, p6 + p1 * (0 - p6) + p2 * -0.283, 0, 0,
                p4 + p1 * (0 - p4) + p2 * (0 - (1 - p4)), p5 + p1 * (0 - p5) + p2 * p5, p6 + p1 * (1 - p6) + p2 * p6, 0, 0,
                0, 0, 0, 1, 0
            ]
        );
    }

    /**
     * 阈值
     * @param n(N取值为-255到255)
     * @returns {egret.ColorMatrixFilter}
     */
    public static createThresholdFilter(n:number):egret.ColorMatrixFilter
    {
        return new egret.ColorMatrixFilter(
            [
                0.3086 * 256, 0.6094 * 256, 0.0820 * 256, 0, -256 * n,
                0.3086 * 256, 0.6094 * 256, 0.0820 * 256, 0, -256 * n,
                0.3086 * 256, 0.6094 * 256, 0.0820 * 256, 0, -256 * n,
                0, 0, 0, 1, 0
            ]
        );
    }

    public static GRAY_FILTER:egret.ColorMatrixFilter = ColorFilterFactory.crateSaturationFilter(0);

    public static HIGHLIGHT_FILTER:egret.ColorMatrixFilter = ColorFilterFactory.createBrightnessFilter(100);
}