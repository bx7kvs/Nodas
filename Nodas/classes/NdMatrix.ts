import {NdMatrixVal} from '../Nodes/@types/types';
import {NdNumericArray2d} from '../@types/types';
import Node from '../Nodes/Node';
import Group from '../Nodes/Group';

export default class NdMatrix {
    private _element: Node<any>
    private _value: NdMatrixVal = [1, 0, 0, 1, 0, 0];
    private _inversion: NdMatrixVal = [1, 0, 0, 1, 0, 0];
    private _globalInversion: NdMatrixVal | null = null;
    private history: {
        translate?: NdNumericArray2d,
        skew?: NdNumericArray2d,
        scale?: NdNumericArray2d,
        rotate?: number
    }[] = [];

    constructor(element: Node<any>) {
        this._element = element
    }

    invert() {
        for (let i = this.history.length - 1; i >= 0; i--) {
            if (this.history[i].rotate !== undefined) {
                const sinA = Math.sin(-<number>this.history[i].rotate)
                const cosA = Math.cos(-<number>this.history[i].rotate)
                NdMatrix.multiply(this._inversion, [cosA, sinA, -sinA, cosA, 0, 0])
            }
            if (this.history[i].translate) {
                NdMatrix.multiply(this._inversion, [1, 0, 0, 1, -(<NdNumericArray2d>this.history[i].translate)[0], -(<NdNumericArray2d>this.history[i].translate)[1]])
            }
            if (this.history[i].skew) {
                NdMatrix.multiply(this._inversion, [1, Math.tan(-(<NdNumericArray2d>this.history[i].skew)[1]), Math.tan(-(<NdNumericArray2d>this.history[i].skew)[0]), 1, 0, 0])
            }
            if (this.history[i].scale) {
                NdMatrix.multiply(this._inversion, [1 / (<NdNumericArray2d>this.history[i].scale)[0], 0, 0, 1 / (<NdNumericArray2d>this.history[i].scale)[1], 0, 0])
            }
        }
    };

    rotate(angle: number) {
        const sinA = Math.sin(angle),
            cosA = Math.cos(angle),
            m = [cosA, sinA, -sinA, cosA, 0, 0] as NdMatrixVal;

        NdMatrix.multiply(this._value, m);

        this.history.push({'rotate': angle});

        return this;
    };

    translate(x: number, y: number) {
        const m = [1, 0, 0, 1, x, y] as NdMatrixVal;
        if (x !== 0 || y !== 0) {
            NdMatrix.multiply(this._value, m);
            this.history.push({'translate': [x, y]});
        }

        return this;
    };

    scale(...[x, y]: NdNumericArray2d) {
        if (x !== 1 || y !== 1) {
            const m = [x, 0, 0, y, 0, 0] as NdMatrixVal;
            NdMatrix.multiply(this._value, m);
            this.history.push({'scale': [x, y]});
        }
        return this;
    };

    skew(...[x, y]: NdNumericArray2d) {
        if (x !== 0 || y !== 0) {
            const tanA = Math.tan(x),
                tanB = Math.tan(y),
                m = [1, tanB, tanA, 1, 0, 0] as NdMatrixVal;

            NdMatrix.multiply(this._value, m);
            this.history.push({'skew': [x, y]});
        }

        return this;
    };

    globalInversion() {
        if (this._globalInversion) return this._globalInversion;

        const parent = this._element.parent;
        this._globalInversion = [...this._inversion]
        if (parent) NdMatrix.multiply(this._globalInversion, parent.matrix.globalInversion());
        return [...this._globalInversion] as NdMatrixVal;
    };

    traceCursorToLocalSpace(point: NdNumericArray2d) {
        return  NdMatrix.applyMatrixToPoint(this.globalInversion(), point);
    };

    reset() {
        this._value = [1, 0, 0, 1, 0, 0];
        this._inversion = [1, 0, 0, 1, 0, 0];
        this._globalInversion = null;
        this.history = [];
    }
    purgeInversion() {
        this._globalInversion = null
        if(this._element instanceof Group) {
            this._element.forEachChild((e) => {
                e.matrix.purgeInversion()
            })
        }
    }

    extract(): NdMatrixVal {
        return this._value;
    };

    extractInversion(): NdMatrixVal {
        return [...this._inversion];
    };

    private static multiply(target: NdMatrixVal, multiplier: NdMatrixVal) {
        // noinspection UnnecessaryLocalVariableJS
        const a0 = target[0] * multiplier[0] + target[2] * multiplier[1],
            a1 = target[1] * multiplier[0] + target[3] * multiplier[1],
            a2 = target[0] * multiplier[2] + target[2] * multiplier[3],
            a3 = target[1] * multiplier[2] + target[3] * multiplier[3],
            a4 = target[0] * multiplier[4] + target[2] * multiplier[5] + target[4],
            a5 = target[1] * multiplier[4] + target[3] * multiplier[5] + target[5]
        target[0] = a0;
        target[1] = a1;
        target[2] = a2;
        target[3] = a3;
        target[4] = a4;
        target[5] = a5;
    }

    private static applyMatrixToPoint(matrix: NdMatrixVal, point: NdNumericArray2d) {
        const x = point[0] * matrix[0] + point[1] * matrix[2] + matrix[4]
        const y = point[0] * matrix[1] + point[1] * matrix[3] + matrix[5]
        point[0] = x
        point[1] = y
        return point
    }
}