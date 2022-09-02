import {NdNumericArray2d} from "../@types/types";
import NdSprite from "../classes/NdSprite";
import {
    NdNodeBasicEventScheme,
    NdParticleSpriteResource,
    NdParticleVector,
    NdUrlSpriteStr,
    NdURLStr
} from "./@types/types";
import NdImage from "../classes/NdImage";
import NdMatrix from "../classes/NdMatrix";
import NdStyledNode from "./classes/NdStyledNode";
import NdModParticle from "./models/NdModParticle";
import NdStateEvent from "../classes/NdStateEvent";
import {alive} from "./decorators/alive";

export default class Particle extends NdStyledNode<NdModParticle, NdNodeBasicEventScheme<Particle>> {

    private sprite: NdParticleSpriteResource | null
    private origin: NdNumericArray2d = [0, 0]
    private readonly _resolver: (vector: NdParticleVector, progress: number, time: Date) => boolean
    private readonly _initiator?: (vector: NdParticleVector, time: Date) => boolean
    private _matrix?: NdMatrix = new NdMatrix(false)
    private _initialised = false

    private startTime: number = 0

    private resetMatrix() {
        this._matrix!.reset()
        this._matrix!.translate(...this.origin)
        this._matrix!.translate(...this.data!.position.protectedValue)
        this._matrix!.rotate(this.data!.rotate.protectedValue)
        this._matrix!.skew(...this.data!.skew.protectedValue)
        this._matrix!.scale(...this.data!.scale.protectedValue)
        this._matrix!.translate(-this.origin[0], -this.origin[1])
    }

    private updateOrigin() {
        if (!this.sprite) return
        this.origin[0] = this.sprite.width * this.data!.origin.protectedValue[0]
        this.origin[1] = this.sprite.height * this.data!.origin.protectedValue[1]
    }

    @alive
    get startedAt() {
        return this.startTime
    }

    @alive
    opacify(amount: number) {
        this.data!.vector.protectedValue[7] += amount
    }

    @alive
    push(vector: NdNumericArray2d) {
        this.data!.vector.protectedValue[0] += vector[0]
        this.data!.vector.protectedValue[1] += vector[1]
        return this
    }


    @alive
    turn(rad: number) {
        this.data!.vector.protectedValue[2] += rad
        return this
    }

    @alive
    explode(vector: NdParticleVector) {
        this.data!.vector.protectedValue[5] += vector[0]
        this.data!.vector.protectedValue[6] += vector[1]
        return this
    }

    @alive
    jelly(vector: NdNumericArray2d) {
        this.data!.vector.protectedValue[3] += vector[0]
        this.data!.vector.protectedValue[4] += vector[1]
        return this
    }

    @alive
    render(applyContext: (vector: NdParticleVector) => void, context: CanvasRenderingContext2D, time: Date) {
        if (((this.sprite instanceof NdSprite || this.sprite instanceof NdImage) && this.sprite.loaded) || this.sprite instanceof HTMLImageElement || this.sprite instanceof HTMLCanvasElement) {
            if (!this._initialised) {
                if (this._initiator) {
                    this._initialised = this._initiator(this.data!.vector.protectedValue, time)
                } else this._initialised = true
                this.startTime = time.getTime()
                this.cast('mount', new NdStateEvent<Particle>(this, null))
            }
            if (this._initialised) {
                applyContext(this.data!.vector.protectedValue)
                let progress = isNaN(this.data!.lifetime.protectedValue) && isFinite(this.data!.lifetime.protectedValue) ? 0 : (time.getTime() - this.startTime) / this.data!.lifetime.protectedValue;
                if (progress > 1) progress = 1
                if (progress < 0) progress = 0
                const keep = this._resolver(this.data!.vector.protectedValue, progress, time)
                if (keep) {
                    this.data!.position.protectedValue[0] += this.data!.vector.protectedValue[0]
                    this.data!.position.protectedValue[1] += this.data!.vector.protectedValue[1]
                    this.data!.rotate.set(this.data!.rotate.protectedValue + this.data!.vector.protectedValue[2], this)
                    this.data!.skew.protectedValue[0] += this.data!.vector.protectedValue[3]
                    this.data!.skew.protectedValue[1] += this.data!.vector.protectedValue[4]
                    this.data!.scale.protectedValue[0] += this.data!.vector.protectedValue[5]
                    this.data!.scale.protectedValue[1] += this.data!.vector.protectedValue[6]
                    this.data!.opacity.set(this.data!.opacity.protectedValue + this.data!.vector.protectedValue[7], this)
                    this.resetMatrix()
                    const image = this.sprite instanceof NdSprite || this.sprite instanceof NdImage ? this.sprite.export(time) : this.sprite
                    if (image) {
                        context.save()
                        context.globalCompositeOperation = this.data!.blending.protectedValue
                        context.globalAlpha *= this.data!.opacity.protectedValue
                        context.transform(...this._matrix!.extract())
                        context.drawImage(image, 0, 0)
                        context.restore()
                    }
                    if(progress === 1) this.destroy()
                } else this.destroy()
            }
        }
    }

    get initialized() {
        return this._initialised && !this.destroyed
    }

    @alive
    reset() {
        this._matrix!.reset()
        Object.values(this.data!).forEach(v => v.reset())
        this._initialised = false
        return this
    }

    constructor(
        sprite: NdParticleSpriteResource | string,
        resolver: (vector: NdParticleVector, progress:number, time:Date) => boolean,
        initiator?: (vector: NdParticleVector, time:Date) => boolean) {
        super(new NdModParticle());
        this._resolver = resolver
        if (initiator) this._initiator = initiator
        this.watch("origin", () => {
            this.updateOrigin()
        })
        this.once('destroy', () => {
            this.sprite = null
            this._matrix = undefined
        })
        if (typeof sprite === "string") {
            this.sprite = NdSprite.isNdUrlSpriteStr(sprite) ? new NdSprite(sprite as NdUrlSpriteStr) : new NdImage(sprite as NdURLStr)

            if (!this.sprite.loaded) {
                this.sprite.once('load', () => this.updateOrigin())
                this.sprite.load()
            } else {
                this.updateOrigin()
            }

        } else {
            this.sprite = sprite
            if (sprite instanceof NdSprite || sprite instanceof NdImage && !sprite.loaded) {
                sprite.once('load', () => this.updateOrigin())
                sprite.load()
            } else {
                this.updateOrigin()
            }
        }

    }
}