/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.service.class('Objects',
    [ 'Events',
        function
            DefaultObjectType(Events) {
            this.events = Events.emitter(this);
            this.events.register('unmount mount destroy')
        }
    ]
);
