import NdResource from './NdResource';
import {NdURLStr} from '../Nodes/@types/types';
import NDR from '../Services/NodasResources';
import {NDB} from '../Services/NodasDebug';

export default class NdImage extends NdResource<() => HTMLImageElement> {
    public image:HTMLImageElement | undefined
    private _size: [number, number] = [0, 0]

    private defineImage (url:NdURLStr) {
        if(!this.destroyed) {
            this.image = NDR.image(url,
                () => {
                    this._status = 1;
                    if(this.image) {
                        this._size[0] = this.image.width
                        this._size[1] = this.image.height
                    } else NDB.error('Unable to set size of image that was not yet defined')
                    this.cast('load', null)
                },
                () => {
                    this._status = 0
                    this.cast('load', null)
                    this.cast('error', null)
                },
                () => this.defineImage(url)
            )
        } else NDB.info(`Sprite ${url} has been destroyed. Load skipped.`)
        return this
    }
    constructor(url: NdURLStr) {
        super(url, () => this.defineImage(url));
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
