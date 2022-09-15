import {NdMatrixVal} from '../@types/types';
import {NdNumericArray2d} from '../../@types/types';
import Node from '../Node';
import Group from '../Group';
import NdMatrix from "../../classes/NdMatrix";

export default class NdNodeMatrix extends NdMatrix {
    private _globalInversion: NdMatrixVal | null = null;
    globalInversion: (node: Node<any>) => NdMatrixVal
    purgeInversion: (node: Node<any>) => void

    constructor() {
        super()
        this.globalInversion = (node) => {
            if (this._globalInversion) return this._globalInversion;
            const parent = node.parent;
            this._globalInversion = [...this._inversion]
            if (parent) NdNodeMatrix.multiply(this._globalInversion, parent.matrix.globalInversion(parent));
            return [...this._globalInversion] as NdMatrixVal;
        }
        this.purgeInversion = (node) => {
            this._globalInversion = null
            if (node instanceof Group) node.forEachChild((e) => e.matrix.purgeInversion(e))
        }
    }

    traceCursorToLocalSpace(point: NdNumericArray2d, node: Node<any>) {
        return NdMatrix.applyMatrixToPoint(this.globalInversion(node), point);
    };

    reset() {
        super.reset();
        this._globalInversion = null;
    }


}