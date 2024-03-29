import NdEmitter from '../classes/NdEmitter';

class NodasDebug extends NdEmitter<{ message: string, error: string, info: string, important: string }> {
    private prefix = '⋒'
    private warnings = true
    private groupLevel = 0
    private currentLevel = 0;
    private separatorMessages: { [key: number]: string } = {}
    verbose: boolean = false

    constructor() {
        super()
    }

    private getMessage(message: string) {
        return `${this.prefix}: ${message}`;
    }

    error(message: string | Error) {
        if (typeof message === "string") {
            message = this.getMessage(message)
            throw new Error(message)
        } else {
            throw message
        }
    }

    warn(message: string, verbose: boolean = true) {
        if (verbose && !this.verbose) {
            message = this.getMessage(message)
            console.log(`%c ${message} ⚠`, 'border: 1px solid #FFD166; border-radius:2px; background:rgba(255, 209, 102,.01); padding: 4px 6px 4px 4px; color:#B88100');
        }
    }


    info(message: string) {
        if (this.verbose) {
            message = this.getMessage(message)
            this.cast('info', message)
            console.log(`%c ${message} ℹ`, 'border: 1px solid #118AB2; border-radius:2px; background:rgba(7, 59, 76,.01); padding: 4px 6px 4px 4px; color:#118AB2');
        }
    };

    message(message: string) {
        if (this.verbose) {
            message = this.getMessage(message)
            this.cast('info', message)
            console.log('%c' + message, 'border: 1px solid #073B4C; border-radius:2px; background:rgba(7, 59, 76,.01); padding: 4px 6px 4px 4px; color:#073B4C');
        }
    };

    separator(message: string) {
        if (this.verbose) {
            message = this.getMessage(message)
            this.currentLevel++;
            this.separatorMessages[this.currentLevel] = message;
            this.cast('info', message)
            console.log('%c' + message + ' ⌛', 'padding: 4px 10px; border-left: 2px solid #10949C; background:rgba(16,148,156,0.1); color: #10949C');
        }
    };

    separatorEnd() {
        if (this.verbose) {
            if (!this.warnings) return;
            if (this.separatorMessages[this.currentLevel]) {
                console.log('%c' + this.separatorMessages[this.currentLevel] + ' ✔', 'padding: 4px 10px; border-left: 2px solid #10949C; background:rgba(16,148,156,0.1); color: #10949C');
                this.currentLevel--;
            }
            if (this.currentLevel === 0) this.separatorMessages = {};
        }
    };

    positive(message: string) {
        if (this.verbose) {
            if (!this.warnings) return;
            message = this.getMessage(message)
            this.cast('info', message)
            console.log(`%c ${message} ✅`, 'border: 1px solid rgb(6, 214, 160); border-radius:2px; background:rgba(6, 214, 160,.01); padding: 4px 6px 4px 4px; color:#05B384');
        }
    };

    negative(message: string) {
        if (!this.warnings) return;
        message = this.getMessage(message)
        this.cast('info', message)
        console.log(`%c ${message} ❌`, 'border: 1px solid #EF476F; border-radius:2px; background:rgba(239, 71, 111,.01); padding: 4px 6px 4px 4px; color:#EB1E4E');
    };

    group(message: string) {
        if (this.verbose) {
            console.group(message);
            this.groupLevel++;
        }

    };

    groupEnd() {
        if (this.verbose) {
            if (!this.warnings) return;
            this.groupLevel--;
            console.groupEnd();
        }
    }
}

export const NDB = new NodasDebug()