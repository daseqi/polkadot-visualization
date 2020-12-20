const{ ApiPromise, WsProvider } = require('@polkadot/api');



async function main() {
    // const provider = new WsProvider('wss://rococo-rpc.polkadot.io/');
    const provider = new WsProvider('wss://rococo-rpc.polkadot.io/');
    const api = await ApiPromise.create({ provider });
    const chain = await api.rpc.system.chain();
    console.log(`Connected to ${chain}!`);

    update_parachain_heads(api);
    // show_queues(api);
    show_new_blocks(api);
    get_current_head(api)
}

async function get_current_head(api) {
    const lastHeader = await api.rpc.chain.getHeader();
    console.log("Last Number: " + lastHeader.number);
}



// async function get_parachain_name() {
//     const name = await dapi.rpc.system.chain()
//     console.log(name);
// }

async function show_new_blocks(api) {
    const block_unsub = await api.rpc.chain.subscribeNewHeads((block) => {
        console.log("New block: " + block.number);
    })
}

// async function show_queues(api) {
//     const parachainIDS = await api.query.paras.parachains(); // returns an arary of all the parachains connected to the network
//     parachainIDS.forEach(async (id)=>{
//         await api.query.parachains.downwardMessageQueue(id, (incoming_messages) => {
//             console.log("Parachain with ID " + id + " - Incoming Messages: " + incoming_messages.length);
//         });
//         await api.query.parachains.relayDispatchQueue(id, (outgoing_messages) => {
//             console.log("Parachain ID " + id + " - Outoging Messages: " + outgoing_messages.length);
//         });
//     })
// }

async function update_parachain_heads(api) {
    const parachainIDS = await api.query.paras.parachains(); // returns an arary of all the parachains connected to the network

    parachainIDS.forEach(async (id)=>{
        await api.query.paras.heads(id, (head)=>{
            // elem = document.getElementById('event_updates_content');
            // elem.innerText = elem.innerText + "Parachain with ID: " + id + " new head: " + head.toHuman() + "\n";
            console.log("Parachain with ID " + id + " - New Head: " + head.toHuman().substring(0, 20) + "...");
        });
    });
}

main()
