export default class ReflectEvent<Data, Target> {
    public readonly time: Date = new Date()
    public readonly type: string;
    public readonly data: Data;
    public readonly target: Target

    constructor(target: Target, payload: Data, type: string) {
        this.type = type;
        this.target = target;
        this.data = payload
    }
}