import NdResource from './NdResource';
import {NdURLStr} from '../Nodes/@types/types';
import NDR from '../Services/NodasResources';
import {NDB} from '../Services/NodasDebug';
import {alive} from "../Nodes/decorators/alive";
import NdEvent from "./NdEvent";
import {IMAGEBASE64URLPATTERN, IMAGEPATTERN} from "../../constants";

export default class NdImage extends NdResource<HTMLImageElement> {
    public image?: HTMLImageElement
    private _size: [number, number] = [0, 0]

    @alive
    private defineImage(url: NdURLStr) {
        this.image = NDR.image(url,
            () => {
                this.status = 1;
                if (this.image) {
                    this._size[0] = this.image.width
                    this._size[1] = this.image.height
                } else NDB.error('Unable to set size of image that was not yet defined')
                this.cast('load', new NdEvent(this, null))
            },
            () => {
                this.status = 0
                this.cast('load', new NdEvent(this, null))
                this.cast('error', new NdEvent(this, null))
            },
            () => this.defineImage(url)
        )
        return this
    }

    constructor(url: NdURLStr) {
        super(url, () => this.defineImage(url));
        this.once('destroy', () => this.image = undefined)
    }

    @alive
    export() {
        return this.image
    }

    @alive
    get width() {
        return this._size[0]
    }

    @alive
    get height() {
        return this._size[1]
    }

    @alive
    get size() {
        return [...this._size]
    }

    static isNdUrlStrRegex(str: string) {
        return IMAGEPATTERN.test(str) || IMAGEBASE64URLPATTERN.test(str)
    }
}

