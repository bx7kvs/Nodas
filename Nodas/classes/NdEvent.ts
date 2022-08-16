export default class NdEvent<TargetType,
    DataType> {
    public readonly time: Date = new Date()
    public readonly data: DataType;
    public readonly target: TargetType
    public propagate: boolean = true

    constructor(
        target: TargetType,
        data: DataType) {
        this.target = target;
        this.data = data
    }
}