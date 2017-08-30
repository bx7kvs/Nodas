/**
 * Created by bx7kv_000 on 12/26/2016.
 */
$R.service.class('Objects',
    ['Tree',
        function DefaultObjectType(Tree) {
            Tree.root(this).append(this);
        }
    ]
);