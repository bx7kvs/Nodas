export const TAGPATTERN = /\[(?<tagname>[cbi])(="(?<value>rgba\(\d*,( )?\d*,( )?\d*(,( )?(\.\d+|1|0))\))")?](?<content>((?!\[\/?\k<tagname>]).)*)\[\/\k<tagname>]/gm
export const WORDPATTERN = /(\S+)/g