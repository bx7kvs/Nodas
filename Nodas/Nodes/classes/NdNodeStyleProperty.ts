import Node from '../Node';

type forkArray<T, True, False> = T extends any[] ? True : False
type ModelPropertyValueCallback<T> = (itemIndex: number, itemValueIndex?: number) => T
export default class NdStylesProperty<StoreType, GetType, SetType> {
    private _value: StoreType
    public readonly default: StoreType
    public readonly ordering: number = 0
    public get: () => GetType
    public set: (value: SetType, element: Node<any>) => StoreType = () => this._value
    private value: GetType

    get protectedValue(): StoreType {
        return this._value
    }

    get publicValue(): GetType {
        return this.get()
    }

    sync<T extends StoreType & any[], K extends keyof T & number, M extends keyof T[K] & number>
    (model: any[], filler: T[K] | forkArray<T[K], ModelPropertyValueCallback<T[K][M]>[], ModelPropertyValueCallback<T[K]>>) {
        if (this._value instanceof Array) {
            if (this._value.length > model.length) this._value.splice(0, model.length)
            if (this._value.length < model.length) {
                const diff = model.length - this._value.length
                for (let i = 0; i < diff; i++) {
                    if (typeof filler == 'function') {
                        this._value.push(filler(i))
                    } else {
                        if(filler instanceof Array) {
                            this._value.push(
                                filler.map((value: T[K], key: number) => typeof value === 'function' ? value(i, key) : value)
                            )
                        } else {
                            this._value.push(filler)
                        }
                    }
                }
            }
        }
    }

    constructor(
        order: number,
        initial: StoreType,
        get: (current: StoreType) => GetType,
        set?: (value: SetType, element: Node<any>) => StoreType) {
        this._value = initial
        this.default = initial
        this.ordering = order
        this.value = get(this._value)
        this.get = () => {
            this.value = get(this._value)
            return this.value
        };
        if (set) {
            this.set = (value: SetType, element: Node<any>) => {
                this._value = set(value, element);
                this.value = get(this._value)
                return this._value
            }
        }

    }
}