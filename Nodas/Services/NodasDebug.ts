import NdEmitter from '../classes/NdEmitter';

class NodasDebug extends NdEmitter<{ 'message': string, 'error': string, 'info': string, 'important': string }> {
    private prefix = '⋒'
    private warnings = true
    private groupLevel = 0
    private currentLevel = 0;
    private separatorMessages: { [key: number]: string } = {}

    constructor() {
        super()
    }

    private getMessage(message: string, source?: {} | string) {
        return `${this.prefix}${source ? `[${typeof source == 'string' ? source : source.constructor.name}]` : ''}: ${message}`;
    }

    error(message: string, source?: {} | string) {
        message = this.getMessage(message, source)
        this.cast('error', message)
        console.trace();
        throw new Error('😵' + message)
    }


    warn(message: string, source?: {} | string) {
        message = this.getMessage(message, source)
        console.log('🤬%c' + message, 'border-left:4px solid rgb(178,137,75); padding :2px 6px; background: rgba(131,138,0,.1); color: rgb(178,137,75)');
    }


    info(message: string, source?: {} | string) {
        message = this.getMessage(message, source)
        this.cast('info', message)
        console.log('🧐%c' + message, 'border-left:2px solid rgb(149,202,0); padding :2px 6px; background: rgba(255,255,255,.1);');
    };

    message(message: string, source?: {} | string) {
        message = this.getMessage(message, source)
        this.cast('info', message)
        console.log('🙂%c' + message, 'padding: 1px 10px; border-left:2px solid #10949C; font-weight:bold; background: rgba(0,175,231,.1); color: #10949C');
    };

    separator(message: string, source?: {} | string) {
        message = this.getMessage(message, source)
        this.currentLevel++;
        this.separatorMessages[this.currentLevel] = message;
        this.cast('info', message)
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

    positive(message: string, source?: {} | string) {
        if (!this.warnings) return;
        message = this.getMessage(message, source)
        this.cast('info', message)
        console.log('🥳%c' + message, 'border-left: 2px solid rgb(149,202,0); background:rgba(149,202,0,.1); padding: 4px 10px; color:rgb(149,202,0)');
    };

    negative(message: string, source?: {} | string) {
        if (!this.warnings) return;
        message = this.getMessage(message, source)
        this.cast('info', message)
        console.log('☹%c' + message, 'border-left: 2px solid rgb(224,14,0); background:rgba(224,14,0,.1); padding: 4px 10px; color: rgb(224,14,0)');
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

export const NDB = new NodasDebug()