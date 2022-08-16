import {NdStylePropAnimatedApplier, NdStylePropAnimatedStarter} from '../@types/types';
import NdStylesProperty from './NdNodeStyleProperty';
import Node from '../Node';

export default class NdNodeStylePropertyAnimated<StoreType, GetType, SetType, AniType extends SetType,
    Element extends Node<any> = Node<any>>
    extends NdStylesProperty<StoreType, GetType, SetType> {
    private readonly starter: NdStylePropAnimatedStarter<SetType, GetType, AniType>;
    private readonly applier: NdStylePropAnimatedApplier<AniType, Element>;
    private _start?: AniType | false = false;
    private _end?: AniType | false = false;


    constructor(
        order: number,
        initial: StoreType,
        getter: (current: StoreType) => GetType,
        setter: (value: SetType, element: Node<any>) => StoreType,
        starter: NdStylePropAnimatedStarter<SetType, GetType, AniType>,
        applier: NdStylePropAnimatedApplier<AniType, Element>) {
        super(order, initial, getter, setter)
        this.starter = starter;
        this.applier = applier
    }

    get start() {
        return this._start
    }

    private set start(value) {
        this._start = value
    }

    get end() {
        return this._end
    }

    private setStartValue(val: AniType) {
        this.start = val
    }

    private setEndValue(val: AniType) {
        this._end = val
    }

    public init(value: SetType) {
        this.starter(this.get(), value, this.setStartValue.bind(this), this.setEndValue.bind(this))
        return this
    }

    public apply(element: Element, progress: number, value: AniType) {
        value = this.applier(value, element, progress)
        this.set(value, element)
        return this.publicValue
    }


}