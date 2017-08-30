$R.service.class('Objects',
    ['+Mouse',
        function RectangleObjectClass(MouseHelper) {
            this.mouseCheckFunction(MouseHelper.rectCheckFunction);
            var mouse = this.extension('Mouse');
            mouse.cursorTransformFunction(MouseHelper.rectCursorTransformFunction);
        }
    ]
);