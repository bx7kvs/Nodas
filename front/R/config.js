/**
 * Created by bx7kv_000 on 12/17/2016.
 */
$R.config({
    apps: ['GameRoot'],
    canvas: 'canvas',
    fps: 58.8,
    framereset: true,
    config: {
        Canvas: {
            size: ['100%', '100%']
        },
        Debug: {
            warnings: true
        },
        Sound: {
            filters: ['Delay','Lowpass','Gain']
        }
    }
});