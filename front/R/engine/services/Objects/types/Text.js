/**
 * Created by Viktor Khodosevich on 3/25/2017.
 */
$R.service.class('Objects',
    ['+Mouse',
        function TextObjectClass(MouseHelper) {
            this.mouseCheckFunction(MouseHelper.rectCheckFunction);
        }
    ]
);