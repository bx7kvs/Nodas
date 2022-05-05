import {ReflectBoxGetter, ReflectCacheGetter, ReflectCacheRegister, ReflectCacheRegisterReturn} from "../@types/types";
import ReflectElement from "../ReflectElement";
import ReflectElementBox from "./ReflectElementBox";
import ReflectCache from "./ReflectCache";

export default class ReflectBox<T extends ReflectElement<any>> {
    private f: ReflectBoxGetter<T>;
    private boxContainer = new ReflectElementBox();
    private cache: ReflectCache;
    private readonly element: T;
    public readonly box: ReflectCacheRegisterReturn<ReflectElementBox>["getter"];
    public readonly purge: ReflectCacheRegisterReturn<ReflectElementBox>["purge"];
    private boxGetter = () => {
        if (!this.f) return this.boxContainer;
        this.f(this.boxContainer, this.element)
        return this.boxContainer;
    }

    get resolver() {
        return this.f
    }

    set resolver(f) {
        this.f = f
    }

    constructor(cache: ReflectCache, element: T, compute: ReflectBoxGetter<T>) {
        this.cache = cache
        this.element = element;
        this.f = compute;
        const {
            purge,
            getter
        }: ReflectCacheRegisterReturn<ReflectElementBox> = cache.register<ReflectElementBox>('box', this.boxGetter)
        this.box = getter;
        this.purge = purge;
    }
}