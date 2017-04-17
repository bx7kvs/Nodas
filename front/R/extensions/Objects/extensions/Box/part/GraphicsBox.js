/**
 * Created by Viktor Khodosevich on 2/7/2017.
 */
$R.part('Objects', function GraphicsBox() {

    var container = {
            size: [0, 0],
            position: [0, 0]
        },
        sprite = {
            margin: [0, 0, 0, 0],
            position: [0, 0],
            size: [0, 0]
        };

    this.get = function () {
        return {
            size: [container.size[0], container.size[1]],
            position: [container.position[0], container.position[1]]
        }
    };

    this.set = function (x, y, width, height, top, right, bottom, left) {
        container.size[0] = width;
        container.size[1] = height;
        container.position[0] = x;
        container.position[1] = y;
        sprite.margin[0] = top;
        sprite.margin[1] = right;
        sprite.margin[2] = bottom;
        sprite.margin[3] = left;
        sprite.size[0] = left + width + right;
        sprite.size[1] = top + height + bottom;
        sprite.position[0] = x - left;
        sprite.position[1] = y - top;
    };

    this.value = function () {
        return container;
    };
    this.sprite = function () {
        return sprite;
    };

});