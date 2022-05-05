import Application from "./modules/Application/Application";

export default class ReflectService {
    public readonly app:Application;

    constructor(app:Application) {
       this.app = app
    }
}