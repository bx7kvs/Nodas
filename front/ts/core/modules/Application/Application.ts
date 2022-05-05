import {ReflectServicesList} from "../../../config/services.config";
import ReflectService from "../../ReflectService";
import Canvas from "../Canvas/Canvas";
import Config from "../Config/Config";
import {ReflectConfig, ReflectConfigPropertyWatcher} from "../Config/types";
import Debug from "../Debug/Debug";
import Ticker from "../Ticker/Ticker";
import Fonts from "../Fonts/Fonts";

export default class Application {
    public readonly name: string;
    public readonly Ticker = new Ticker()
    public readonly Canvas = new Canvas(this.Ticker)
    public readonly Config = new Config()
    public readonly Fonts: Fonts
    public readonly Debug: Debug
    protected readonly services: { [Key in keyof typeof ReflectServicesList]?: ReflectService };
    constructor(name: string) {
        this.name = name
        this.Debug = new Debug(name)
        this.Fonts = new Fonts(name, this.Config)
        this.services = Object.fromEntries(Object.keys(ReflectServicesList)
            .map(
                (name) => {
                    return [name, new ReflectServicesList[name](this)]
                }
            ))
    }

    public config(a?: string | ReflectConfig, b?: ReflectConfigPropertyWatcher<any>) {
        if (typeof a === "string") {
            this.Config.set(a, b)
            if (typeof b === "function") {
                this.Config.watch(a, b);
            } else {
                return this.Config.get(a);
            }
        } else if (typeof a === "object" && a.constructor !== Array) {
            Object.keys(a).forEach((prop) => {
                this.Config.set(prop, a[prop])
            })
        } else {
            throw new Error('Unable to config application. Config format is invalid');
        }
        return this;
    };
}