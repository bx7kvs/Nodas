export const TAGPATTERN = /\[(?<tagname>[cbi])(="(?<value>rgba\(\d*,( )?\d*,( )?\d*(,( )?(\.\d+|1|0))\))")?](?<content>((?!\[\/?\k<tagname>]).)*)\[\/\k<tagname>]/gm
export const WORDPATTERN = /(\S+)/g
export const CIRCLECONST = 0.5522847498