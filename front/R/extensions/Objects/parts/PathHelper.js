/**
 * Created by bx7kv_000 on 12/29/2016.
 */
$R.part('Objects', ['Debug', function PathHelper(Debug) {

    function getControlPoints(x0, y0, x1, y1, x2, y2, t) {
        var d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        var d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        var fa = t * d01 / (d01 + d12);
        var fb = t * d12 / (d01 + d12);
        var p1x = x1 - fa * (x2 - x0);
        var p1y = y1 - fa * (y2 - y0);
        var p2x = x1 + fb * (x2 - x0);
        var p2y = y1 + fb * (y2 - y0);
        return [p1x, p1y, p2x, p2y];
    }

    /*
     path = [x1,y1,x2,y2,ax1,ay1,ax2,ay2]
     */

    this.convertComplexPath = function (path) {
        var result = [];

        for (var i = 0; i < path.length; i++) {
            result.push([
                path[i][0],
                path[i][1]
            ]);
        }

        return result;
    };

    this.convertSimplePath = function (path) {

        if (path.length < 2) {
            Debug.error('Path should consist of at least two points!');
            return;
        }

        var result = [];

        for (var i = 0; i < path.length; i++) {
            var x = path[i][0],
                y = path[i][1];

            if (typeof x !== "number" || typeof  y !== "number") {
                Debug.error('Incorrect Path!');
                result = undefined;
                break;
            }

            if (i < path.length - 1) {
                if (!result[i]) result.push([]);
                result[i].push(x);
                result[i].push(y);
            }

            if (i !== 0) {
                result[i - 1].push(x);
                result[i - 1].push(y);
                result[i - 1].push(result[i - 1][0]);
                result[i - 1].push(result[i - 1][1]);

                result[i - 1].push(x);
                result[i - 1].push(y);
            }
        }

        return result;
    };

    this.interpolate = function (path, smoothing) {

        for (var i = 0; i < path.length; i++) {

            var prev = [], mid = [path[i][0], path[i][1]], next = [path[i][2], path[i][3]], pts = null;

            if (i == 0) {
                prev = mid;
            }
            else {
                prev = [path[i-1][0], path[i-1][1]];

            }

            pts = getControlPoints(prev[0], prev[1], mid[0], mid[1], next[0], next[1], smoothing);

            if (i == 0) {
                path[i][4] = pts[2];
                path[i][5] = pts[3];
            }
            else {
                path[i - 1][6] = pts[0];
                path[i - 1][7] = pts[1];
                path[i][4] = pts[2];
                path[i][5] = pts[3];
            }

            if(i == path.length-1) {

                prev = [path[i][0], path[i][1]];
                mid = [path[i][2], path[i][3]];
                next = mid;

                pts = getControlPoints(prev[0], prev[1], mid[0], mid[1], next[0], next[1], smoothing);

                path[i][6] = pts[0];
                path[i][7] = pts[1];
            }


        }
    };

    this.checkSimplePath = function (path) {
        if (typeof path !== "object" || path.constructor !== Array) return false;

        var deepcheck = true;

        for (var i = 0; i < path.length; i++) {
            if (
                typeof path[i] !== "object" || path[i].constructor !== Array || path[i].length !== 2 ||
                typeof path[i][0] !== "number" || typeof  path[i][1] !== "number"
            ) {
                deepcheck = false;
                break;
            }
        }

        return deepcheck;
    };

    this.comparePaths = function (path1, path2) {
        var result = true;

        if (path1.length !== path2.length) {
            return false;
        }

        for (var i = 0; i < path1.length; i++) {
            for (var n = 0; n < path1[i].length; n++) {
                if (path1[i][n] !== path2[i][n]) {
                    result = false;
                    break;
                }
            }
        }

        return result;
    }


}]);