import {NDB} from './NodasDebug';
import {NdURLStr} from '../Nodes/@types/types';
import {IMAGEBASE64URLPATTERN} from "../../constants";

class NodasResources {

    private images: {
        [key: string]: {
            loaded: boolean,
            loading: boolean,
            onError: (() => void)[],
            onLoad: (() => void)[],
            onReset: (() => void)[],
            error: boolean,
            src: string,
            image: HTMLImageElement
        }
    } = {}

    private hash(string: string) {
        if (string.length === 0) return 0;
        let hash = 0,
            i, chr;
        for (i = 0; i < string.length; i++) {
            chr = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return hash;
    }

    image(src: string, onLoad?: () => void, onError?: () => void, onReset?: () => void) {
        const isBase64 = IMAGEBASE64URLPATTERN.test(src)
        const key = isBase64 ? this.hash(src) >>> 0 : src
        if (this.images[key]) {
            if (this.images[key].loading) {
                if (onLoad) this.images[key].onLoad.push(onLoad)
                if (onError) this.images[key].onError.push(onError)
            } else {
                setTimeout(() => {

                    if (this.images[key]) {
                        if (this.images[key].loaded && onLoad) onLoad()
                        if (this.images[key].error && onError) onError()
                    }
                })
            }
            if (onReset) this.images[key].onReset.push(onReset)
        } else {
            NDB.info(`Loading image ${isBase64 ? `base64 encoded [${key}]` : key}`)
            this.images[key] = {
                loaded: false,
                error: false,
                loading: true,
                onError: onError ? [onError] : [],
                onLoad: onLoad ? [onLoad] : [],
                onReset: onReset ? [onReset] : [],
                src: src,
                image: new Image()
            }
            this.images[key].image.addEventListener('load', () => {
                NDB.positive(`Image  ${isBase64 ? `base64 encoded key[${key}]` : key} loaded.`)
                this.images[key].loaded = true
                this.images[key].loading = false
                this.images[key].error = false
                this.images[key].onLoad.forEach(v => v())
                this.images[key].onError = []
                this.images[key].onLoad = []
            })
            this.images[key].image.addEventListener('error', () => {
                NDB.negative(`Image ${isBase64 ? `base64 encoded key[${key}]` : key} failed to load`)
                this.images[key].loaded = false
                this.images[key].error = true
                this.images[key].loading = false
                this.images[key].onError.forEach(v => v())
                this.images[key].onError = []
                this.images[key].onLoad = []
            })
            this.images[key].image.src = src
        }
        return this.images[key].image
    }

    reset() {
        const images = Object.values(this.images)
        this.images = {}
        images.forEach(v => v.onReset.forEach(v => v()))
    }

    bulkLoad(resources: NdURLStr[]) {
        resources.forEach(v => {
            this.image(v)
        })
    }
}

export const NDR = new NodasResources()
export default NDR
