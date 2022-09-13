import {NdDestructibleEventScheme, NdExportable, NdURLStr} from '../Nodes/@types/types';
import {alive} from "../Nodes/decorators/alive";
import NdDestroyableNode from "../Nodes/classes/NdDestroyableNode";
import NdEvent from "./NdEvent";

export default abstract class NdResource<T extends NdExportable> extends NdDestroyableNode<{
    load: NdEvent<NdResource<T>, null>,
    error: NdEvent<NdResource<T>, null>,

} & NdDestructibleEventScheme<NdResource<T>>> {
    private readonly src: NdURLStr
    private readonly resolve: () => NdResource<T>
    protected status: number = -1
    private resolved: boolean = false
    abstract export(time:Date): T | undefined

    protected constructor(url: NdURLStr, resolve: () => NdResource<T>) {
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
