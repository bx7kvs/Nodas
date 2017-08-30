/**
 * Created by Viktor Khodosevich on 4/16/2017.
 */
$R.service.class('Sound',
    ['@Audio', '@extend',
        function DestinationNode(audio, extend) {

            extend(this, '$AudioNode');

            this.build('destination', audio.context().destination, false);

        }
    ]
);