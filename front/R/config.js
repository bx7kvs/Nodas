/**
 * Created by bx7kv_000 on 12/17/2016.
 */
$R
    .cfg('Loader',
        {
            Container : {
                z : 100
            },
            Debug: {
                warnings: true
            },
            Canvas: {
                width: '100%',
                height: '100%'
            },
            Sound: {
                filters: ['Delay', 'Lowpass', 'Gain']
            },
            Objects: {
                clear: true
            }
        }
    )
    .cfg('Root',
        {
            Container : {
                z : 50
            },
            Debug: {
                warnings: true
            },
            Canvas: {
                width: '100%',
                height: '100%'
            },
            Sound: {
                filters: ['Delay', 'Lowpass', 'Gain']
            },
            Objects: {
                clear: true
            }
        }
    )
    .run('Root');
