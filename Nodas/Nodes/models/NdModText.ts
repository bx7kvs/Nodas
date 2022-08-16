import NdNodeStylesModel from '../classes/NdNodeStylesModel';
import NdStylesProperty from '../classes/NdNodeStyleProperty';
import {NdColorStr} from '../@types/types';
import {NdFontSpecialValues, NdFontStyles, NdFontWeights} from '../../@types/types';
import NodasFonts from '../../Services/NodasFonts';

export default class NdModText extends NdNodeStylesModel {
    str = new NdStylesProperty<string, string, string>(
        0,
        '',
        (value) => {
            return value
        },
        (value) => {
            return value
        }
    )
    width = new NdStylesProperty<number | 'auto', number | 'auto', number | 'auto'>(
        1,
        'auto',
        (value) => {
            return value
        },
        (value) => {
            return value
        }
    )
    font = new NdStylesProperty<NdFontSpecialValues | string, NdFontSpecialValues | string, NdFontSpecialValues | string>(
        1,
        NdFontSpecialValues.system,
        (current) => {
            return current
        },
        (value) => {
            if (!(Object.values(NdFontSpecialValues) as string[]).includes(value)) {
                if (NodasFonts.get(value)) return value
                else return NdFontSpecialValues.system
            }
            return value
        }
    )
    color = new NdStylesProperty<NdColorStr, NdColorStr, NdColorStr>(
        2,
        'rgba(0,0,0,1)',
        (current) => {
            return current
        },
        (value) => {
            return value
        }
    )
    weight = new NdStylesProperty<NdFontWeights, NdFontWeights, NdFontWeights>(
        2,
        'normal',
        (current) => {
            return current
        },
        (value) => {
            return value
        }
    )
    lineHeight = new NdStylesProperty<number, number, number>(
        2,
        14,
        (current) => {
            return current
        },
        (value) => {
            if (isFinite(value)) {
                return value
            }
            return 14
        }
    )
    style = new NdStylesProperty<NdFontStyles, NdFontStyles, NdFontStyles>(
        2,
        'normal',
        (current) => {
            return current
        },
        (value) => {
            return value
        }
    )

}