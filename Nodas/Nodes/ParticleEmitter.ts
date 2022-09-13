import NdStyledNode from "./classes/NdStyledNode";
import NdModEmitter from "./models/NdModEmitter";
import {NdDestructibleEventScheme, NdNodeBasicEventScheme} from "./@types/types";
import Particle from "./Particle";
import Field from "./Field";
import {alive} from "./decorators/alive";
import NodasRandom from "../Services/NodasRandom";

export default class ParticleEmitter extends NdStyledNode<NdModEmitter, NdNodeBasicEventScheme<ParticleEmitter> & NdDestructibleEventScheme<ParticleEmitter>> {

    private readonly initiator: (time: Date) => Particle
    private particles?: Particle[] = []
    private emitTimeout: number = 0
    private lastEmittedAt: number = new Date().getTime()
    private _field: Field | null = null;

    constructor(initiator: (time: Date) => Particle) {
        super(new NdModEmitter());
        this.initiator = initiator
        this.emitTimeout = 1000 / this.data!.intensity.protectedValue
        this.watch('intensity', () => {
            this.emitTimeout = 1000 / this.data!.intensity.protectedValue
        })
        this.once('destroyed', () => {
            this._field = null
            this.particles!.forEach(v => v.destroy())
            this.particles = undefined
        })
    }


    @alive
    field(field: Field) {
        this._field = field
        return this
    }

    @alive
    render(context: CanvasRenderingContext2D, time: Date) {
        if (this._field) {
            if (this.particles!.length < this.data!.limit.protectedValue) {
                const now = time.getTime(),
                    delta = now - this.lastEmittedAt;
                if (delta >= this.emitTimeout) {
                    const particle = this.initiator(time)
                    if (typeof this.data!.shape.protectedValue === "number") {
                        if (this.data!.shape.protectedValue === 0) {
                            particle.style('position', [this.data!.position.protectedValue[0], this.data!.position.protectedValue[1]])
                        } else {
                            const point = NodasRandom.pointOnCircle(this.data!.shape.protectedValue)
                            point[0] += this.data!.position.protectedValue[0]
                            point[1] += this.data!.position.protectedValue[1]
                            particle.style('position', [...point])
                        }
                    } else {
                        const point = NodasRandom.pointOnPath(this.data!.shape.protectedValue[NodasRandom.number(this.data!.shape.protectedValue.length - 1)])
                        point[0] += this.data!.position.protectedValue[0]
                        point[1] += this.data!.position.protectedValue[1]
                        particle.style('position', point)
                    }
                    particle.once('destroyed', () => {
                            if (!this.destroyed) this.particles = this.particles!.filter(v => v !== particle)
                        }
                    )
                    this._field.add(particle)
                    this.lastEmittedAt = now
                }
            }
        }
    }
}