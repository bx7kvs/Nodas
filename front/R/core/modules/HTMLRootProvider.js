/**
 * Created by Viktor Khodosevich on 4/27/2017.
 */
$R.$(function HTMLProvider() {

    function HTMLRoot() {
        var element = document.createElement('div');

        this.element = function () {
            return element;
        }
    }

    this.HTMLRootContructor = function () {
        return HTMLRoot;
    }
});