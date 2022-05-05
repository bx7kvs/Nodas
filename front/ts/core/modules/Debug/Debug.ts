import EventEmitter from "events";
import {DebugData} from "./types";

declare type DebugEvents = 'error' | 'message' | 'info' | 'important'

export default class Debug {
    private string = '𝐑'
    private regexp = /{[a-zA-Z]+}/g
    private regexpName = /[a-zA-Z]+/g
    private emitter = new EventEmitter()
    private warnings = false
    private groupLevel = 0
    private currentLevel = 0;
    private separatorMessages: { [key: number]: string } = {}
    private name:string
    constructor(name:string) {
        this.name =name
    }

    private getMessage(data: DebugData, message: string, source?: {}) {
        message = message.toString();
        const matches = message.match(this.regexp);
        const props: { [key: string]: { replace: string, data: string } } = {};
        if (matches) {
            matches.forEach((match: string) => {
                const matchName = match.match(this.regexpName)
                if (matchName) props[matchName[0]] = {
                    replace: match,
                    data: '[' + (data[matchName[0]] === undefined ? 'undefined' : data[matchName[0]].toString()) + ']'
                }
            })
        }
        Object.keys(props).forEach(prop => {
            message = message.replace(props[prop].replace, props[prop].data);
        })
        if (source && source.constructor && source.constructor.name) {
            message = ' ' + source.constructor.name + ' │ ' + message;
        }
        return `${this.string}[${this.name}]: ${message}`;
    }

    private processMessageArgs(arg1: DebugData | string, arg2?: string | {}, arg3?: {}) {
        let data: DebugData = {};
        let message: string = '';
        let source
        if (typeof arg1 === "string") {
            message = arg1
            if (arg2) {
                source = arg2
            }
        } else {
            data = arg1
            if (typeof arg2 === "string") message = arg2
            if (arg3) {
                source = arg3
            }
        }
        message = this.getMessage(data, message, source)
        return message
    }

    on(event: DebugEvents, func: () => {}) {
        this.emitter.on(event, func)
    };

    error(data: DebugData, message: string, source: {}): void
    error(message: string, source: {}): void
    error(message: string): void
    error(arg1: DebugData | string, arg2?: string | {}, arg3?: {}) {
        const message = this.processMessageArgs(arg1, arg2, arg3)
        this.emitter.emit('error', message)
        console.trace();
        throw new Error(message)
    }

    warn(data: DebugData, message: string, source: {}): void
    warn(message: string, source: {}): void
    warn(message: string): void
    warn(arg1: DebugData | string, arg2?: string | {}, arg3?: {}) {
        const message = this.processMessageArgs(arg1, arg2, arg3)
        this.emitter.emit('message', message)
        console.log('%c' + message, 'border-left:4px solid rgb(178,137,75); padding :2px 6px; background: rgba(131,138,0,.1); color: rgb(178,137,75)');
    }

    info(data: DebugData, message: string, source: {}): void
    info(message: string, source: {}): void
    info(message: string): void
    info(arg1: DebugData | string, arg2?: string | {}, arg3?: {}) {
        const message = this.processMessageArgs(arg1, arg2, arg3)
        this.emitter.emit('info', message)
        console.log('%c' + message, 'border-left:2px solid rgb(149,202,0); padding :2px 6px; background: rgba(255,255,255,.1);');
    };

    message(arg1: DebugData | string, arg2?: string | {}, arg3?: {}) {
        const message = this.processMessageArgs(arg1, arg2, arg3)
        this.emitter.emit('info', message)
        console.log('%c' + message, 'padding: 1px 10px; border-left:2px solid #10949C; font-weight:bold; background: rgba(0,175,231,.1); color: #10949C');
    };

    separator(arg1: DebugData | string, arg2?: string | {}, arg3?: {}) {
        const message = this.processMessageArgs(arg1, arg2, arg3)
        this.currentLevel++;
        this.separatorMessages[this.currentLevel] = message;
        this.emitter.emit('info', message)
        console.log('%c' + message + ' ⌛', 'padding: 4px 10px; border-left: 2px solid #10949C; background:rgba(16,148,156,0.1); color: #10949C');
    };

    separatorEnd() {
        if (!this.warnings) return;
        if (this.separatorMessages[this.currentLevel]) {
            console.log('%c' + this.separatorMessages[this.currentLevel] + ' ✔', 'padding: 4px 10px; border-left: 2px solid #10949C; background:rgba(16,148,156,0.1); color: #10949C');
            this.currentLevel--;
        }
        if (this.currentLevel === 0) this.separatorMessages = {};
    };

    positive(data: DebugData, message: string, source: {}): void
    positive(message: string, source: {}): void
    positive(message: string): void
    positive(arg1: DebugData | string, arg2?: string | {}, arg3?: {}) {
        if (!this.warnings) return;
        const message = this.processMessageArgs(arg1, arg2, arg3)
        this.emitter.emit('info', message)
        console.log('%c' + message, 'border-left: 2px solid rgb(149,202,0); background:rgba(149,202,0,.1); padding: 4px 10px; color:rgb(149,202,0)');
    };

    negative(data: DebugData, message: string, source: {}): void
    negative(message: string, source: {}): void
    negative(message: string): void
    negative(arg1: DebugData | string, arg2?: string | {}, arg3?: {}) {
        if (!this.warnings) return;
        const message = this.processMessageArgs(arg1, arg2, arg3)
        this.emitter.emit('info', message)
        console.log('%c' + message, 'border-left: 2px solid rgb(224,14,0); background:rgba(224,14,0,.1); padding: 4px 10px; color: rgb(224,14,0)');
    };

    group(message: string) {
        if (!this.warnings) return;
        console.group(message);
        this.groupLevel++;
    };

    groupEnd() {
        if (!this.warnings) return;
        this.groupLevel--;
        console.groupEnd();
    }
}