/**
 * Created by bx7kv_000 on 1/13/2017.
 */
$R.service.class('Objects',
    ['+Mouse',
        function CircleObjectClass(MouseHelper) {
            this.mouseCheckFunction(MouseHelper.circleCheckFunction);
        }
    ]
);