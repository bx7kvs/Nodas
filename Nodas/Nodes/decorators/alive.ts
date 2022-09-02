import NdDestroyableNode from "../classes/NdDestroyableNode";

export function alive (target: NdDestroyableNode<any>, property: string, descriptor: PropertyDescriptor) {
    if (typeof descriptor.value === "function") {
        const method = descriptor.value
        descriptor.value = function (...args: any[]) {
            if (target.destroyed) throw new Error(`Attempt to call [${<string>property}] of a destroyed Node`)
            else return method.apply(this ? this : target, args)
        }
    } else {
        const getter = descriptor.get
        const setter = descriptor.set
        if (setter) {
            descriptor.set = function (arg: any) {
                if (target.destroyed) throw new Error(`Attempt to set a property [${property}] of a destroyed Node`)
                else return setter.call(this, arg)
            }
        }
        if (getter) {
            descriptor.get = function () {
                if (target.destroyed) throw new Error(`Attempt to access property [${property}] of a destroyed Node`)
                else return getter.call(this)
            }
        }
    }
}