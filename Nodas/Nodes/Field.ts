import Node from "./Node";
import NdModBase from "./models/NdModBase";
import {NdParticleArgs, NdParticleModifier, NdParticleVector} from "./@types/types";
import Particle from "./Particle";
import NdModField from "./models/NdModField";
import Nodas from "../../Nodas";
import ParticleEmitter from "./ParticleEmitter";
import {NDB} from "../Services/NodasDebug";
import {alive} from "./decorators/alive";

export default class Field extends Node<NdModField & NdModBase> {
    private fps = 0
    private active = true
    private emitters?: ParticleEmitter[] = []
    private particles?: Particle[] = []
    private modifiers?: NdParticleModifier[] = []

    private fieldFpsCallback() {
        this.fps = this.app!.ticker.fps
    }

    private self: Field | null = this
    ParticleEmitter: new (initiator: (time: Date) => Particle) => ParticleEmitter
    Particle: new(...args: NdParticleArgs) => Particle = Particle

    attach(app: Nodas) {
        if (!this.mounted) {
            this.fps = app.ticker.fps
            app.ticker.on('fps', this.fieldFpsCallback.bind(this))
        } else NDB.positive(`Field ${this.id} has already been attached. Ignore attach`)
        return super.attach(app);
    }

    detach(): this {
        if (this.mounted) {
            this.fps = this.app!.ticker.fps
            this.app!.ticker.on('fps', this.fieldFpsCallback.bind(this))
        } else NDB.positive(`Field ${this.id} has already been detached. Ignore detach`)

        return super.detach();
    }

    constructor(id: string) {
        super(id, {...new NdModField(), ...new NdModBase()});
        const self = this
        this.ParticleEmitter = class FieldParticleEmitter extends ParticleEmitter {
            constructor(initiator: (time: Date) => Particle) {
                super(initiator);
                if (self) this.field(self)
                self.emitter(this)
            }
        }

        this.once('destroyed', () => {
            this.emitters = undefined
            this.particles = undefined
            this.modifiers = undefined
            this.active = false
            this.removeAllListeners()
            this.self = null
        })
    }

    @alive
    private applyFieldVector(vector: NdParticleVector) {
        if (this.data!.wind.protectedValue[0] > 0 || this.data!.wind.protectedValue[1] > 0) {
            if (this.data!.wind.protectedValue[0] > 0) {
                const windDelta = this.data!.wind.protectedValue[0] - vector[0]
                if (windDelta > 0.01) {
                    const portion = (windDelta / this.fps) * .5
                    if (vector[0] < this.data!.wind.protectedValue[0]) vector[0] += portion
                }

            }
            if (this.data!.wind.protectedValue[1] > 0) {
                const windDelta = this.data!.wind.protectedValue[1] - vector[1]
                if (windDelta > 0.01) {
                    const portion = (windDelta / this.fps) * .5
                    if (vector[1] < this.data!.wind.protectedValue[1]) vector[1] += portion
                }
            }
        }
        if (this.data!.gravity.protectedValue > 0) {
            vector[1] += this.data!.gravity.protectedValue / this.fps
        }
        if (this.data!.viscosity.protectedValue) {
            const appliedViscosity = 1 - this.data!.viscosity.protectedValue
            vector[0] *= appliedViscosity
            vector[1] *= appliedViscosity
        }
        this.modifiers!.forEach(v => v(vector))
    }

    @alive
    export(): undefined {
        return
    }

    @alive
    modify(modifier: NdParticleModifier | NdParticleModifier[]) {
        if (modifier instanceof Array) {
            this.modifiers = [...this.modifiers!, ...modifier]
        } else this.modifiers!.push(modifier)
        return this
    }

    @alive
    simplify(modifier: NdParticleModifier) {
        this.modifiers = this.modifiers!.filter(v => v !== modifier)
        return this
    }

    @alive
    render(context: CanvasRenderingContext2D, time: Date) {
        this.emitters!.forEach(e => {
            if (!e.destroyed) e.render(context, time)
        })
        this.particles!.forEach(particle => {
            if (!particle.destroyed) particle.render(this.applyFieldVector.bind(this), context, time)
        })
        return context
    }

    @alive
    test(): false {
        return false
    }

    @alive
    add(particle: Particle | Particle[]): Field {
        if (particle instanceof Array) {
            particle.forEach(v => {
                this.particles!.push(v)
                v.once('destroyed', () => {
                    if (!this.destroyed) this.particles = this.particles!.filter(p => v !== p)
                })
            })
        } else {
            particle.once('destroyed', () => {
                if (!this.destroyed) this.particles = this.particles!.filter(v => v !== particle)
            })
            this.particles!.push(particle)
        }
        return this
    }


    @alive
    emitter(emitter: ParticleEmitter) {
        const e = emitter.field(this)
        this.emitters!.push(e)
        e.once('destroyed', () => {
            if (!this.destroyed) this.emitters = this.emitters!.filter(v => v !== e)
        })
        return e
    }

    @alive
    remove(particle: Particle | Particle[]) {
        if (particle instanceof Array) {
            this.particles = this.particles!.filter(v => particle.indexOf(v) < 0)
        } else {
            this.particles = this.particles!.filter(v => v !== particle)
        }
        return this
    }

    @alive
    start() {
        if (!this.active) this.active = true
        return this
    }

    @alive
    stop() {
        if (this.active) {
            this.active = false
        } else NDB.message('Attempt to activate active Field. Ignored')
        return this
    }

    static Particle = Particle
}