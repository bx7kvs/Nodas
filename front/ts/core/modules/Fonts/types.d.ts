export type ReflectFontFormats = 'eot' | 'svg' | 'ttf' | 'woff';
export type ReflectFontSupportedWeights = 'light' | 'normal' | 'bold' | 'black' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 900 | 1000
export type ReflectFontSupportedStyles = 'normal' | 'italic'
export type ReflectFontDescription ={
    name : string,
    weight : ReflectFontSupportedWeights[]
    style: ReflectFontSupportedStyles[]
}