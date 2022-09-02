import {NdExportable, NdURLStr} from '../Nodes/@types/types';
import {alive} from "../Nodes/decorators/alive";
import NdDestroyableNode from "../Nodes/classes/NdDestroyableNode";
import NdStateEvent from "./NdStateEvent";

export default abstract class NdResource<T extends NdExportable> extends NdDestroyableNode<{
    load: NdStateEvent<NdResource<T>>,
    error: NdStateEvent<NdResource<T>>,
    destroy: NdStateEvent<NdResource<T>>,
    destroyed: NdStateEvent<NdResource<T>>
}> {
    private readonly src: NdURLStr
    private readonly resolve: () => NdResource<T>
    protected status: number = -1
    private resolved: boolean = false
    abstract export(time:Date): T | undefined

    constructor(url: NdURLStr, resolve: () => NdResource<T>) {
        super()
        this.src = url
        this.resolve = resolve
    }

    get url(): NdURLStr {
        return this.src
    }

    get loaded() {
        return this.status > 0
    }

    get error() {
        return this.status == 0
    }

    @alive
    load() {
        if (!this.resolved) {
            this.resolved = true
            return this.resolve()
        }
        return this
    }
}
