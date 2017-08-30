/**
 * Created by Viktor Khodosevich on 3/28/2017.
 */
$R.plugin.class('Objects', 'Text',
    ['@extend', '$DrawerHelper',
        function TextSpaceClass(extend, DrawerHelper) {
            extend(this, '$TextElementClass');

            var string = ' ',
                width = 0,
                self = this;

            function getWidth(context) {
                context.font = self.extractFontString();
                return context.measureText(string).width;
            }

            this.string = function () {
                return string;
            };

            this.width = function (context) {
                return DrawerHelper.measureText(getWidth);
            }
        }
    ]
);