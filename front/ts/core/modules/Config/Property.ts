import {
    ReflectConfigPropertyCheckArrayItem,
    ReflectConfigPropertyChecks,
    ReflectConfigPropertyCheckValue,
    ReflectConfigPropertyValue, ReflectConfigPropertyWatcher
} from "./types";

export default class Property<T> {
    private checkArray:ReflectConfigPropertyCheckArrayItem[] = [];
    private cb:ReflectConfigPropertyWatcher<T>[] = [];
    private val: T;
    private checkValue(v:T):boolean {
        let result = true;
        for (let i = 0; i < this.checkArray.length; i++) {
            result = this.check[this.checkArray[i].f](v, this.checkArray[i].value)
            if (!result) return result
        }
        return result;
    }

    private check = {
        isNumber: (v:T) => {
            return typeof v === "number";
        },
        isString: (v:T)  =>{
            return typeof v === "string";
        },
        isArray:  (v:T) => {
            return typeof v === "object" && v instanceof Array;
        },
        custom: (v:T, f:ReflectConfigPropertyCheckValue) =>{
            return typeof f === "function" ? f(v) : false
        },
        under: (v:T, limit:ReflectConfigPropertyCheckValue) => {
            return typeof v === "number" && limit ? v < limit : false
        },
        greater: (v:T, limit:ReflectConfigPropertyCheckValue) =>{
            return typeof v === "number" && limit ? v > limit : false;
        },
        eq:  (v:T, exact:ReflectConfigPropertyCheckValue) => {
            return typeof v === "number" && v === exact;
        },
        isBool:  (v:T) => {
            return typeof v === "boolean"
        }
    };

    constructor(property:string, value:T, config:ReflectConfigPropertyChecks) {
        this.val = value;
        (Object.keys(config) as Array<keyof ReflectConfigPropertyChecks>).forEach((propName) => {
            this.checkArray.push({f: propName, value: config[propName]});
        })
        if (!this.checkValue(value)) throw new Error('Initial [' + property + ']\'s value does not meet config requirements.');
    }
    value (): T {
        return this.val;
    }

    define (n:T): Property<T> {
        if (this.checkValue(n)) {
            if (n instanceof Array) {
                this.val = n;
            }
            else {
                this.val = n;
            }
        }
        this.cb.forEach((cb) => {
            cb.call(this, this.value());
        })
        return this;
    }

     watch(f:ReflectConfigPropertyWatcher<T>):Property<T> {
        if (typeof f === "function") {
            this.cb.push(f);
        }
        else {
            throw new Error('Can not set config property watcher. Argument f is not a function.');
        }
        return this;
    };


}