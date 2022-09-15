export default class NdEvent<TargetType,
    DataType> {
    public readonly time: Date = new Date()
    public readonly data: DataType;
    public readonly target: TargetType
    protected _type: string = 'default'
    public propagate: boolean = true

    get type() {
        return this._type
    }

    constructor(
        target: TargetType,
        data: DataType) {
        this.target = target;
        this.data = data
    }
}