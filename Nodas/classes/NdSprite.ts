import NdResource from './NdResource';
import {NdUrlSpriteStr, NdURLStr} from '../Nodes/@types/types';
import {NdNumericArray2d} from '../@types/types';
import {NDB} from '../Services/NodasDebug';
import NDR from '../Services/NodasResources';
import {alive} from "../Nodes/decorators/alive";
import NdEvent from "./NdEvent";
import {SPRITEBASE64PATTERN, SPRITEPATTERN} from "../../constants";

export default class NdSprite extends NdResource<HTMLCanvasElement | HTMLImageElement> {
    private frameCount: number = 0
    private refreshRate: number = 12
    private frameTime: number = 0
    private canvas?: HTMLCanvasElement[][] = []
    private image?: HTMLImageElement | undefined
    private chunkSize: NdNumericArray2d = [0, 0]
    private chunkXYCount: number = 0
    private timeStart = new Date().getTime()
    private duration: number = 0
    private frozen: boolean = false

    @alive
    private defineImage(url: NdUrlSpriteStr) {
        const match = url.match(SPRITEPATTERN)
        const match64 = !match ? url.match(SPRITEBASE64PATTERN) : null
        if (match || match64) {
            this.image = NDR.image(match ? match[1] : match64 ? match64[2] : '[invalid-image-src]', () => {
                this.setFrameData()
                this.status = 1
                if (match || match64) {
                    this.frameCount = parseInt(match ? match[2] : match64 ? match64[1] : '0')
                } else NDB.error(`No frame group match for url ${url}. How did you even get here?`)
                this.cast('load', new NdEvent(this, null))

            }, () => {
                NDB.negative(`Error loading sprite ${this.url}.`)
                this.status = 0;
                this.cast('error', new NdEvent(this, null))
            }, () => {
                this.defineImage(url)
            })
        }
        return this
    }

    @alive
    private setFrameData() {
        if (this.image) {
            this.chunkXYCount = Math.ceil(Math.sqrt(this.frameCount))
            this.chunkSize[0] = this.image.width / this.chunkXYCount
            this.chunkSize[1] = this.image.height / this.chunkXYCount
            this.frameTime = 1000 / this.refreshRate
            this.duration = this.frameTime * this.frameCount
            this.chunkSize[0] = this.image.width / this.chunkXYCount
            this.chunkSize[1] = this.image.height / this.chunkXYCount
            this.canvas = []
            for (let r = 0; r < this.chunkXYCount; r++) {
                if (!this.canvas[r]) this.canvas.push([])
                for (let c = 0; c < this.chunkXYCount; c++) {
                    if (!this.canvas[r][c]) {
                        this.canvas[r].push(document.createElement('canvas'))
                        this.canvas[r][c].width = 1
                        this.canvas[r][c].height = 1
                    }
                    this.canvas[r][c].setAttribute('width', this.chunkSize[0].toString());
                    this.canvas[r][c].setAttribute('height', this.chunkSize[0].toString());
                    const context = this.canvas[r][c].getContext('2d');
                    if (context) {
                        context.translate(-this.chunkSize[0] * c, -this.chunkSize[1] * r);
                        context.drawImage(this.image, 0, 0);
                    }
                }
            }
        } else NDB.error('Unable to set sprite frame data. No image.')

    }

    constructor(url: NdUrlSpriteStr) {
        const match = url.match(SPRITEPATTERN)
        const match64 = !match ? url.match(SPRITEBASE64PATTERN) : null
        super(
            (match ? match[1] : match64 ? match64[2] : `invalid-image-src[${url}]`) as NdURLStr,
            () => this.defineImage(url))
        this.once('destroyed', () => {
            this.canvas = []
            this.image = undefined
        })
    }

    get paused() {
        return this.frozen
    }

    @alive
    pause() {
        this.frozen = true
    }

    @alive
    play() {
        this.frozen = false
    }

    @alive
    get frames() {
        return this.frameCount
    }

    set frames(val) {
        this.frameCount = val
        this.setFrameData()
    }

    @alive
    get width() {
        return this.chunkSize[0]
    }

    @alive
    get height() {
        return this.chunkSize[1]
    }

    @alive
    get size() {
        return [...this.chunkSize]
    }

    @alive
    get fps() {
        return this.refreshRate
    }

    set fps(value) {
        this.timeStart = new Date().getTime()
        this.refreshRate = value
        this.setFrameData()
    }

    @alive
    export(time: Date) {
        if (this.frameCount && this.frameTime && (this.chunkSize[0] > 0 || this.chunkSize[1] > 0)) {
            let currentTime = time.getTime()
            let delta = currentTime - this.timeStart
            if (this.frozen) this.timeStart += delta

            let frame = Math.floor(delta / this.frameTime);
            if (frame > this.frameCount - 1) {
                frame = 0
                this.timeStart = currentTime
            }
            let currentY = Math.floor(frame / this.chunkXYCount),
                currentX = frame - currentY * this.chunkXYCount;
            if (this.canvas![currentY]) {
                if (this.canvas![currentY][currentX]) {
                    return this.canvas![currentY][currentX]
                }
            }
        }
    }

    static isNdUrlSpriteStr(str: string) {
        return SPRITEPATTERN.test(str) || SPRITEBASE64PATTERN.test(str)
    }
}