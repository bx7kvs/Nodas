export const TAGPATTERN = /\[(?<tagname>[cbi])(="(?<value>rgba\(\d*,( )?\d*,( )?\d*(,( )?(\.\d+|1|0))\))")?](?<content>((?!\[\/?\k<tagname>]).)*)\[\/\k<tagname>]/gm
export const WORDPATTERN = /(\S+)/g
export const IMAGEBASE64URLPATTERN = /^data:image\/([a-zA-Z]*);base64,(.*)/
export const IMAGEPATTERN = /(^.+\.(png)|(jpg)])$/
export const SPRITEPATTERN = /(^.+)\[([0-9]+)]$/
export const SPRITEBASE64PATTERN = /^\[([0-9]+)](data:image\/([a-zA-Z]*);base64,(.*))/
export const CIRCLECONST = 0.5522847498