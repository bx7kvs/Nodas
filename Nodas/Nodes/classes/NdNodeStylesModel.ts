import {NdNumericArray2d} from '../../@types/types';
import {NdArrColor, NdColorStr, NDCpArr, NdPath, NdPathBezier, NdPercentStr, NdSegmentBezier} from '../@types/types';
import NdStylesProperty from './NdNodeStyleProperty';
import NdNodeStylePropertyAnimated from './NdNodeStylePropertyAnimated';

export default abstract class NdNodeStylesModel {
    [key: string]: NdStylesProperty<any, any, any> | NdNodeStylePropertyAnimated<any, any, any, any>

    static degToRad(value: number) {
        if (value > 360) {
            value -= value * Math.floor(value / 360)
        }
        if (value < 360) {
            value += value * Math.floor(value / 360)
        }
        return value * Math.PI / 180
    }

    static radToDeg(value: number) {
        return value * (180 / Math.PI)
    }

    static normalizeColor(color: NdColorStr | NdArrColor): NdArrColor {
        if (typeof color == 'string') color = NdNodeStylesModel.colorToArray(color)
        color.map((v, key) => {
            if (key < 3) {
                v = Math.round(v);
                if (v > 255) return 255;
                if (v < 0) return 0;
                return v
            } else {
                if (v < 0) v = 0
                if (v > 1) v = 1;
                return v.toFixed(2)
            }
        })
        return color
    }

    static colorToArray(value: NdColorStr): NdArrColor {
        const values = value.match(/^rgba\(([\d.]+),([\d.]+),([\d.]+),([\d.]+)\)$/)
        return values ? NdNodeStylesModel.normalizeColor([parseInt(values[1]), parseInt(values[2]), parseInt(values[3]), parseFloat(values[4])]) : [0, 0, 0, 1]
    }

    static arrayToColor(value: NdArrColor): NdColorStr {
        value = NdNodeStylesModel.normalizeColor(value)
        return (`rgba(${value[0]},${value[1]},${value[2]},${value[3]})` as NdColorStr)
    }

    static getControlPoints(...[x0, y0, x1, y1, x2, y2, t]: [number, number, number, number, number, number, number]): NDCpArr {
        let d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)),
            d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
            fa = t * d01 / (d01 + d12),
            fb = t * d12 / (d01 + d12),
            p1x = x1 - fa * (x2 - x0),
            p1y = y1 - fa * (y2 - y0),
            p2x = x1 + fb * (x2 - x0),
            p2y = y1 + fb * (y2 - y0);
        return [p1x, p1y, p2x, p2y];
    }

    static convertComplexPath(path: NdPathBezier): NdPath {
        const result: NdPath = [];

        for (let i = 0; i < path.length; i++) {
            result.push([
                path[i][0],
                path[i][1]
            ]);
        }

        return result;
    };

    static convertSimplePath = function (path: NdPath, closed: boolean = false): NdPathBezier {
        if (path.length < 2) throw new Error('Invalid path length')

        const result: NdPathBezier = [];

        path.forEach((v, key) => {
            const x = v[0], y = v[1];
            const bezierPoint: NdSegmentBezier = [0, 0, 0, 0, 0, 0, 0, 0]
            if (key < path.length - 1) {
                bezierPoint[0] = x;
                bezierPoint[1] = y;
            }
            if (key !== 0) {
                result[key - 1][2] = x;
                result[key - 1][3] = y;
                result[key - 1][4] = result[key - 1][0]
                result[key - 1][5] = result[key - 1][1]
                result[key - 1][6] = x;
                result[key - 1][7] = y;
            }
            result.push(bezierPoint)
        })
        result.pop() //remove extra point
        if (closed) {
            if (result[result.length - 1][2] !== result[0][0] && result[result.length - 1][3] !== result[0][1]) {
                result.push([result[result.length - 1][2], result[result.length - 1][3], result[0][0], result[0][1], result[result.length - 1][2], result[result.length - 1][3], result[0][0], result[0][1]])
            }
        }
        return result;
    };

    static interpolate(path: NdPathBezier, smoothing: number, closed: boolean): void {
        path.forEach((v, key) => {
            let prev: NdNumericArray2d,
                mid = [v[0], v[1]],
                next = [v[2], v[3]],
                controls: NDCpArr;

            prev = key === 0 ? closed ? [path[path.length - 1][0], path[path.length - 1][1]] : [mid[0] - (next[0] - mid[0]), mid[1] - (next[1] - mid[0])] : [path[key - 1][0], path[key - 1][1]]

            controls = NdNodeStylesModel.getControlPoints(prev[0], prev[1], mid[0], mid[1], next[0], next[1], smoothing)

            if (key == 0) {
                path[key][4] = controls[2]
                path[key][5] = controls[3]
            } else {
                path[key - 1][6] = controls[0]
                path[key - 1][7] = controls[1]
                v[4] = controls[2]
                v[5] = controls[3]
            }
            if (key == path.length - 1) {
                prev = [path[key][0], path[key][1]];
                mid = [path[key][2], path[key][3]];
                next = closed ? [path[0][2], path[0][3]] : [mid[0] + (prev[0] - mid[0]), mid[1] + (prev[0] - mid[0])];
                controls = NdNodeStylesModel.getControlPoints(prev[0], prev[1], mid[0], mid[1], next[0], next[1], smoothing);
                v[6] = controls[0]
                v[7] = controls[1]
            }
        })
    };

    static getPathSegmentTPoint([sx, sy, ex, ey, cp1x, cp1y, cp2x, cp2y]: NdSegmentBezier, t: number): NdNumericArray2d {
        if (t > 1) t = 1
        if (t < 0) t = 0
        return [
            Math.pow(1 - t, 3) * sx + 3 * t * Math.pow(1 - t, 2) * cp1x + 3 * t * t * (1 - t) * cp2x + t * t * t * ex,
            Math.pow(1 - t, 3) * sy + 3 * t * Math.pow(1 - t, 2) * cp1y + 3 * t * t * (1 - t) * cp2y + t * t * t * ey
        ];
    }

    static comparePaths(path1: NdPath | NdPathBezier, path2: NdPath | NdPathBezier): boolean {
        if (path1.length !== path2.length) return false;
        let result = true;
        for (let i = 0; i < path1.length; i++) {
            for (let n = 0; n < path1[i].length; n++) {
                if (path1[i][n] !== path2[i][n]) {
                    result = false;
                    break;
                }
            }
        }
        return result;
    }

    static extractPercentFraction(value: NdPercentStr) {
        return parseFloat(value) / 100
    }

    static syncArray<T extends any[], K extends keyof T, V extends any[]>(base: any[], array: T, filler: V) {
        if (array.length > base.length) array.splice(0, base.length)
        if (array.length < base.length) {
            for (let i = 0; i < base.length - array.length; i++) {
                array.push(filler.map((value, key) => typeof value == 'function' ? value(i, key
                ) : value))
            }
        }
    }
}