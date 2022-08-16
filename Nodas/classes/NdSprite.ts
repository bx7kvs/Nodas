import NdResource from './NdResource';
import {NdUrlSpriteStr, NdURLStr} from '../Nodes/@types/types';
import {NdNumericArray2d} from '../@types/types';
import {NDB} from '../Services/NodasDebug';

export default class NdSprite extends NdResource<(time: Date) => HTMLCanvasElement | HTMLImageElement> {
    private frameCount: number = 0
    private refreshRate: number = 12
    private frameTime: number = 0
    private canvas: HTMLCanvasElement[][] = []
    private image: HTMLImageElement = new Image()
    private chunkSize: NdNumericArray2d = [0, 0]
    private chunkXYCount: number = 0
    private timeStart = new Date().getTime()
    private duration: number = 0
    private frozen: boolean = false

    private setFrameData() {
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
    }

    get paused() {
        return this.frozen
    }

    pause() {
        this.frozen = true
    }

    play() {
        this.frozen = false
    }

    get frames() {
        return this.frameCount
    }

    set frames(val) {
        this.frameCount = val
        this.setFrameData()
    }

    get width() {
        return this.chunkSize[0]
    }

    get height() {
        return this.chunkSize[1]
    }

    get size() {
        return [...this.chunkSize]
    }

    get fps() {
        return this.refreshRate
    }

    set fps(value) {
        this.timeStart = new Date().getTime()
        this.refreshRate = value
        this.setFrameData()
    }

    public readonly export = (time: Date) => {
        if (this.loaded && !this.error) {
            if (this.frameCount && this.frameTime && (this.chunkSize[0] > 0 || this.chunkSize[1] > 0)) {
                let currentTime = time.getTime()
                let delta = currentTime - this.timeStart
                if (this.frozen) this.timeStart += delta

                let frame = Math.floor(delta / this.frameTime);
                if (frame > this.frameCount -1) {
                    frame = 0
                    this.timeStart = currentTime
                }
                let currentY = Math.floor(frame / this.chunkXYCount),
                    currentX = frame - currentY * this.chunkXYCount;
                if (this.canvas[currentY]) {
                    if (this.canvas[currentY][currentX]) {
                        return this.canvas[currentY][currentX]
                    }
                }
            }
        }
    }

    constructor(url: NdUrlSpriteStr) {
        const match = url.match(/(^.+)\[(\d+)]/)
        super(
            (match ? match[1] : `invalid-image-src[${url}]`) as NdURLStr,
            () => {
                this.image.addEventListener('load', () => {
                    NDB.positive(`Loaded sprite ${this.url}.`)
                    this.setFrameData()
                    this._status = 1
                    this.cast('load', null)
                })
                this.image.addEventListener('error', () => {
                    NDB.negative(`Error loading sprite ${this.url}.`)
                    this._status = 0;
                    this.cast('error', null)
                })
                if (match) {
                    this.image.src = match[1]
                } else throw new Error('How did you even get here?')
                return this
            })
        if (match && match[2]) this.frameCount = parseInt(match[2])
    }

    static NdUrlSpriteStrRegex = /(^.+)\[([0-9]+)]$/

    static isNdUrlSpriteStr(str: string) {
        return NdSprite.NdUrlSpriteStrRegex.test(str)
    }
}