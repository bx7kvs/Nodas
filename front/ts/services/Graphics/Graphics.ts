import Application from "../../core/modules/Application/Application";
import ReflectService from "../../core/ReflectService";
import Area from "./elements/Area";
import Circle from "./elements/Circle";
import Group from "./elements/Group";
import Image from "./elements/Image";
import Line from "./elements/Line";
import Rectangle from "./elements/Rectangle";
import ReflectElement from "./ReflectElement";
import Sprite from "./elements/Sprite";
import Text from "./elements/Text";

export default class Graphics extends ReflectService{
    constructor(app:Application) {
        super(app);
    }
    //TODO: Create intermediate Type for Graphics
    create (Type:typeof ReflectElement, id:string) {
        return new Type(this.app, id);
    };

    group (id:string) {
        return new Group({app:this.app, id})
    };

    line (id:string) {
        return new Line({app:this.app, id})
    };

    rect (id:string) {
        return new Rectangle({app:this.app, id})
    };

   circle (id:string) {
        return new Circle({app:this.app, id})
    };

    image  (id:string) {
        return new Image({app:this.app, id})
    };

    sprite (id:string) {
        return new Sprite({app:this.app, id})
    };

    text (id:string) {
        return new Text({app:this.app, id})
    };

    area (id:string) {
        return new Area({app:this.app, id})
    };

    get (id:string) {
        return this.app.Tree.get(id);
    };
}