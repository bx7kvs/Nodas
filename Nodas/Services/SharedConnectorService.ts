import Node from "../Nodes/Node";
import NdNodeConnector from "../Nodes/classes/NdNodeConnector";

class SharedConnectorService {
    private pairs: [Node<any>,NdNodeConnector][] = []

    register(node:Node<any>, connector:NdNodeConnector) {
        if(!this.pairs.find(v => v[0] === node)) {
            this.pairs.push([node, connector])
        }
    }
    unregister(node:Node<any>) {
        this.pairs = this.pairs.filter(v => v[0] !== node)
    }

    connector(node:Node<any>) {
        const pair = this.pairs.find(v => v[0] === node)
        if(pair) return pair[1]
    }
}
export default new SharedConnectorService()
