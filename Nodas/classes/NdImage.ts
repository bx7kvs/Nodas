import NdResource from './NdResource';
import {NdURLStr} from '../Nodes/@types/types';

export default class NdImage extends NdResource<() => HTMLImageElement> {
    public readonly image = new Image()
    private _size: [number, number] = [0, 0]

    constructor(url: NdURLStr) {
        super(url, () => {
            this.image.addEventListener('load', () => {
                this._status = 1;
                this._size[0] = this.image.width
                this._size[1] = this.image.height
                this.cast('load', null)
            })
            this.image.addEventListener('error', () => {
                this._status = 0
                this.cast('load', null)
                this.cast('error', null)
            })
            this.image.src = url
            return this
        });
    }

    export = () => this.image

    get width() {
        return this._size[0]
    }

    get height() {
        return this._size[1]
    }

    get size() {
        return [...this._size]
    }

    static NdUrlStrRegex = /(^.+\.(png)|(jpg)])$/

    static isNdUrlStrRegex(str: string) {
        return NdImage.NdUrlStrRegex.test(str)
    }
}
