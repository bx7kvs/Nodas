/**
 * Created by Viktor Khodosevich on 3/26/2017.
 */
$R.part('Objects', ['$ColorHelper', '@extend', '$DrawerHelper', function TextWordClass(ColorHelper, extend, DrawerHelper) {

    extend(this, 'TextElementClass');

    var string = '',
        self = this;

    this.string = function (val) {
        if (typeof val === "string") {
            string = val;
            this.propertyChanged('string',val);
            return this;
        }
        return string;
    };

    function getWidth(context) {
        context.font = self.extractFontString();
        return context.measureText(string).width;
    }

    this.width = function () {
        return DrawerHelper.measureText(getWidth);
    };


    this.draw = function (context, x, y) {
        if (typeof x !== "number") x = 0;
        if (typeof y !== "number") y = 0;
        context.save();
        context.fillStyle = this.color();
        context.font = this.extractFontString();
        context.fillText(string, x, y);
        context.restore();

        return this;
    };

}]);