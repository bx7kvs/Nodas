import EventEmitter from "events";
import {ReflectEmitterCallback} from "../../@types/types";

export default class Emitter<Events extends string, Data extends {}> {
    private emitter = new EventEmitter();
    protected emit: (eventName: Events, ...args: Data[]) => boolean = this.emitter.emit;

    public on(event: Events, callback: ReflectEmitterCallback<Data>) {
        this.emitter.on(event, callback)
        return this;
    }

    public off(event: Events, callback: ReflectEmitterCallback<Data>) {
        this.emitter.off(event, callback)
        return this;
    }

    public once(event: Events, callback: ReflectEmitterCallback<Data>) {
        this.emitter.once(event, callback)
    }

}