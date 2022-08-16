import {NdEasingF} from '../Nodes/@types/types';

export const ndEasings = {
    default(...[t, b, c, d]: Parameters<NdEasingF>) {
        return c * (t /= d) * t * t + b;
    },

    linear(...[t, b, c, d]: Parameters<NdEasingF>) {
        t /= d;
        return b + c * (t);
    },

    linearSoft(...[t, b, c, d]: Parameters<NdEasingF>) {
        const ts = (t /= d) * t;
        const tc = ts * t;
        return b + c * (4 * tc * ts + -10 * ts * ts + 8 * tc + -2 * ts + t);
    },

    linearSoftOut(...[t, b, c, d]: Parameters<NdEasingF>) {
        const ts = (t /= d) * t;
        const tc = ts * t;
        return b + c * (-3 * tc * ts + 11 * ts * ts + -14 * tc + 6 * ts + t);
    },

    linearSoftIn(...[t, b, c, d]: Parameters<NdEasingF>) {
        const ts = (t /= d) * t;
        const tc = ts * t;
        return b + c * (-1 * tc * ts + 2 * tc);
    },

    easeInQuad(...[t, b, c, d]: Parameters<NdEasingF>) {
        return c * (t /= d) * t + b;
    },

    easeOutQuad(...[t, b, c, d]: Parameters<NdEasingF>) {
        return -c * (t /= d) * (t - 2) + b;
    },

    easeInOutQuad(...[t, b, c, d]: Parameters<NdEasingF>) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },

    easeInCubic(...[t, b, c, d]: Parameters<NdEasingF>) {
        return c * (t /= d) * t * t + b;
    },

    easeOutCubic(...[t, b, c, d]: Parameters<NdEasingF>) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },

    easeInOutCubic(...[t, b, c, d]: Parameters<NdEasingF>) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    },

    easeInQuart(...[t, b, c, d]: Parameters<NdEasingF>) {
        return c * (t /= d) * t * t * t + b;
    },

    easeOutQuart(...[t, b, c, d]: Parameters<NdEasingF>) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },

    easeInOutQuart(...[t, b, c, d]: Parameters<NdEasingF>) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },

    easeInQuint(...[t, b, c, d]: Parameters<NdEasingF>) {
        return c * (t /= d) * t * t * t * t + b;
    },

    easeOutQuint(...[t, b, c, d]: Parameters<NdEasingF>) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },

    easeInOutQuint(...[t, b, c, d]: Parameters<NdEasingF>) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },

    easeInSine(...[t, b, c, d]: Parameters<NdEasingF>) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },

    easeOutSine(...[t, b, c, d]: Parameters<NdEasingF>) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },

    easeInOutSine(...[t, b, c, d]: Parameters<NdEasingF>) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },

    easeInExpo(...[t, b, c, d]: Parameters<NdEasingF>) {
        return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },

    easeOutExpo(...[t, b, c, d]: Parameters<NdEasingF>) {
        return (t === d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },

    easeInOutExpo(...[t, b, c, d]: Parameters<NdEasingF>) {
        if (t === 0) return b;
        if (t === d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },

    easeInCirc(...[t, b, c, d]: Parameters<NdEasingF>) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },

    easeOutCirc(...[t, b, c, d]: Parameters<NdEasingF>) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },

    easeInOutCirc(...[t, b, c, d]: Parameters<NdEasingF>) {
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },

    easeInBack(...[t, b, c, d]: Parameters<NdEasingF>) {
        const ts = (t /= d) * t;
        const tc = ts * t;
        return b + c * (15.26 * tc * ts + -43.56 * ts * ts + 39.8 * tc + -10.6 * ts + 0.1 * t);
    },

    easeOutBack(...[t, b, c, d]: Parameters<NdEasingF>) {
        const ts = (t /= d) * t;
        const tc = ts * t;
        return b + c * (11.24 * tc * ts + -23.96 * ts * ts + 12.24 * tc + 1.44 * ts + 0.04 * t);
    },

    easeInOutBack(...[t, b, c, d]: Parameters<NdEasingF>) {
        const ts = (t /= d) * t;
        const tc = ts * t;
        return b + c * (22.92 * tc * ts + -57.78 * ts * ts + 45 * tc + -9.28 * ts + 0.14 * t);
    },

    easeOutBounce(...[t, b, c, d]: Parameters<NdEasingF>) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        }
    }
}