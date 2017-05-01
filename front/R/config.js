/**
 * Created by bx7kv_000 on 12/17/2016.
 */
$R.cfg('Loader',
    {
        Debug: {
            warnings: true
        },
        Canvas : {
            width : '100%',
            height : '100%'
        },
        Sound : {
            filters: ['Delay','Lowpass','Gain']
        }
    }
);
$R.run('Loader');