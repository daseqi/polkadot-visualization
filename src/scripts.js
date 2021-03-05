// const{ ApiPromise, WsProvider } = require('@polkadot/api');

// import { ApiPromise, WsProvider } from '@polkadot/api';
// import { WsProvider } from '@polkadot/api';

// import Api from '/node_modules/@polkadot/api/promise';
// import Ws from '/node_modules/@polkadot/rpc-provider/ws';


function createXmlHttp() {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (!(xmlhttp)) {
        alert("Your browser does not support AJAX!");
    }
    return xmlhttp;
}

function get(xmlHttp, target) {
    if (xmlHttp) {
        xmlHttp.open("GET", target, true); // XMLHttpRequest.open(method, url, async)
        var contentType = "application/x-www-form-urlencoded";
        xmlHttp.setRequestHeader("Content-type", contentType);
        xmlHttp.send();
    }
}

function sendGetRequest(targetUrl, callbackFunction) {
    var xmlHttp = createXmlHttp();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4) {
            console.log(xmlHttp);
            var myObject = JSON.parse(xmlHttp.responseText);
            callbackFunction(myObject, targetUrl);
        }
    }
    get(xmlHttp, targetUrl)
}




function initServer() {
    fetch('./loadAPI')
        .then(
            function (response) {
                // console.log(response);
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }
                // Examine the text in the response
                response.json().then(function (data) {
                    // console.log(data);
                    elem = document.getElementById('event_updates_content');
                    oldText = elem.innerText;
                    elem.innerText = data.response + "\n\n" + oldText;
                    initImage();
                    initSidebar();

                }).catch((e) => {
                    console.log(e);
                });
            }
        ).catch(function (err) {
            console.log('Fetch Error :-S', err);
        });

}

function initImage() {
    fetch('./getParachainIDs').then(
        function (response) {
            // console.log(response);
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
                return;
            }
            response.json().then(function (data) {
                // console.log(data);
                chains_array = data.response.ids;
                num_chains = chains_array.length;
                elem = document.getElementById('event_updates_content');
                oldText = elem.innerText;
                elem.innerText = "Parachain IDs:\n[" + chains_array + "]\n\n" + oldText;
                generateChains();
            }).catch((e) => {
                console.log(e);
            });

        }).catch((e) => {
            console.log(e);
        });
}

function initSidebar() {
    fetch('./subscribeToEvents').then(
        function (response) {
            // console.log(response);
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                return;
            }
            response.json().then(function (data) {
                // console.log(data);
                elem = document.getElementById('event_updates_content');
                setInterval(() => { updateRelaychain(); updateParachains(); }, 6000);
            }).catch((e) => {
                console.log(e);
            });

        }).catch((e) => {
            console.log(e);
        });
}

// sleep time expects milliseconds
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

latestNumber = 0;

function updateRelaychain() {
    fetch('./latestEvents').then(
        function (response) {
            // console.log(response);
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                return;
            }
            response.json().then(function (data) {
                // console.log(data);
                elem = document.getElementById('event_updates_content');
                oldText = elem.innerText;
                newText = "";
                if (data.response.head.number != latestNumber) {
                    console.log(data.response.head.number);
                    newText += "Relay Chain - New block: " + data.response.head.number + "\n";
                    latestNumber = data.response.head.number;
                    elem.innerText = newText + "\n" + oldText;
                }


            }).catch((e) => {
                console.log(e);
            });

        }).catch((e) => {
            console.log(e);
        });
}

currentHeads = {}

function updateParachains() {
    fetch('./getParachains').then(
        function (response) {
            console.log(response);
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                return;
            }
            response.json().then(function (data) {
                console.log(data);
                elem = document.getElementById('event_updates_content');
                oldText = elem.innerText;
                newText = "";
                newText2 = "";
                hash_array = data.response.parachains;
                console.log(hash_array);
                for(i=0; i<hash_array.length; i++){
                    elem2 = document.getElementById('hash_text_id_' + chains_array[i]);

                    if(currentHeads[i] == null){
                        newText += parachain_id_to_name[hash_array[i]['id']] + "(" + hash_array[i]['id'] + ") - current head: " + hash_array[i]['head'].substring(0, 15) + "...\n";
                        newText2 = "Hash: " + hash_array[i]['head'].substring(0, 15) + "...";
                        console.log(newText2);
                        elem2.innerHTML = newText2;
                    }
                    else if(currentHeads[i]['head'] != hash_array[i]['head']){
                        newText += parachain_id_to_name[hash_array[i]['id']] + "(" + hash_array[i]['id'] + ") - new head: " + hash_array[i]['head'].substring(0, 15) + "...\n";
                        newText2 = "Hash: " + hash_array[i]['head'].substring(0, 15) + "...";
                        console.log(newText2);
                        elem2.innerHTML = newText2;
                    }
                }
                currentHeads = hash_array;
                if(newText != ""){
                    elem.innerText = newText + "\n" + oldText;
                }

            }).catch((e) => {
                console.log(e);
            });

        }).catch((e) => {
            console.log(e);
        });
}

function showChains(result, url) {
    console.log(result);
    elem = document.getElementById('event_updates_content');
    oldText = elem.innerText;
    elem.innerText = result.response + oldText;
}


// function animatePathFrom(from_id, length) {
//     elem = document.getElementById('chain_id_' + from_id);
//     elem2 = document.getElementById('path_id_' + from_id);
//     elem.setAttribute('fill', '#00BB00');
//     elem2.setAttribute('stroke', '#00BB00');
//     anime({
//         targets: '#path_id_' + from_id,
//         strokeDashoffset: [anime.setDashoffset, 0],
//         easing: 'linear',
//         duration: length,
//         direction: 'alternate',
//         // loop: true
//     });
// }

// function animatePathTo(to_id, length) {
//     elem = document.getElementById('chain_id_' + to_id);
//     elem2 = document.getElementById('path_id_' + to_id);
//     elem3 = document.getElementById('path_under_id_' + to_id);
//     elem.setAttribute('fill', '#00BB00');
//     elem2.setAttribute('stroke', '#000000');
//     elem3.setAttribute('stroke', '#00BB00');
//     anime({
//         targets: '#path_id_' + to_id,
//         strokeDashoffset: [anime.setDashoffset, 0],
//         easing: 'linear',
//         duration: length,
//         delay: length,
//         direction: 'reverse',
//         // loop: true
//     });
// }

function animatePathFrom(from_id, length){
    elem = document.getElementById('chain_id_' + from_id);   
    elem3 = document.getElementById('chain_under_id_' + from_id);
    elem2 = document.getElementById('path_id_' + from_id);   
    elem.setAttribute('fill', '#E6007A');
    elem3.setAttribute('fill', '#E6007A');
    elem2.setAttribute('stroke', '#E6007A');
    var x = document.getElementById('chain_under_id_' + from_id).getAttribute("x");
    x = 338-x;
    var y = document.getElementById('chain_under_id_' + from_id).getAttribute("y");
    y = 348-y;
    anime({
        targets: '#chain_under_id_' + from_id,
        translateX: x,
        translateY: y,
        easing: 'linear',
        duration: length/2,
        //direction: 'reverse',
    });
    
    anime({
        targets: '#path_id_' + from_id,
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'linear',
        duration: length,
        //direction: 'alternate',
        // loop: true
    });
}

function animatePathTo(to_id, from_id, length){
    document.getElementById('chain_under_id_' + from_id).setAttribute('fill', 'none');
    elem = document.getElementById('chain_id_' + to_id); 
    elem5 = document.getElementById('chain_under_id_' + to_id);  
    elem2 = document.getElementById('path_id_' + to_id); 
    elem3 = document.getElementById('path_under_id_' + to_id);     
    elem.setAttribute('fill', '#E6007A');
    elem2.setAttribute('stroke', '#000000');
    elem3.setAttribute('stroke', '#E6007A');
    elem5.setAttribute('fill', '#E6007A');
    var x2 = document.getElementById('chain_under_id_' + to_id).getAttribute("x");
    x2 = 338-x2;
    var y2 = document.getElementById('chain_under_id_' + to_id).getAttribute("y");
    y2 = 348-y2;
    
    anime({
        // delay: 3000,
        targets: '#chain_under_id_' + to_id,
        translateX: x2,
        translateY: y2,
        easing: 'linear',
        duration: length/2,
        direction: 'reverse',
    });

    anime({
        targets: '#path_id_' + to_id,
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'linear',
        duration: length,
        delay: length,
        direction: 'reverse',
        // loop: true
    });
}


function sendMessage() {
    from_id = document.getElementById('from_chain').value;
    to_id = document.getElementById('to_chain').value;
    console.log("Animating sending a message from " + from_id + " to " + to_id);
    animatePathFrom(from_id, 4000);
    setTimeout(() => { animatePathTo(to_id, from_id, 4000) }, 2000)
    // animatePathTo(to_id, 4000);
    setTimeout(() => { generateChains() }, 8000); //reset the paths after a message is sent... Not really sure why 4000 is the delay, I feel like it should be 8000 but idk
}


chains_array = [];
num_chains = 0;

function changeColor(chain) {
    elem = document.getElementById('chain_id_' + chain);
    // text += "<rect id='chain_id_" + i + "' x='" + (thisX-30) + "' y='" + (thisY-30) + "' rx='10' ry='10' width='60' height='60' stroke='black' stroke-width='0' fill='#BBBBBB' />\n";
    elem.setAttribute('fill', '#00BB00');

}


// Hard coded URLs for each of the parachains.. Not really a better way to do this because the URLs aren't named with any real consistency
parachain_id_to_url = {    100: 'tick-rpc.polkadot.io',
                            110: 'trick-rpc.polkadot.io',
                            120: 'track-rpc.polkadot.io',
                            1000: 'rpc.parachain.plasmnet',
                            3000: 'parachain-rpc.robonomics.network',
                            5000: 'rococo-1.acala.laminar.one',
                            5001: 'rococo-1.laminar-chain.laminar.one',
                            8000: 'parachain-rpc.darwinia.network'
                        }

// There might be a way to get these from the Network, but it would require the URLs above anyway, so we might as well just hardcode these too
parachain_id_to_name = {    100: 'Tick',
                            110: 'Trick',
                            120: 'Track',
                            1000: 'Plasm',
                            3000: 'Robonomics',
                            5000: 'Mandala',
                            5001: 'Turbulence',
                            8000: 'Darwinia'
                        }


// This generates the image on the webpage of the network
// It does so by generating the SVG components that make up the complete image
function generateChains() {
    console.log("Generating parachains.");
    elem = document.getElementById('message_svg');
    // number = document.getElementById('num_chains').value;
    number = num_chains
    angleBetween = (360 / number) * (Math.PI / 180);
    centerX = 350;
    centerY = 360;
    offsetX = 0; // previously used, no longer to center the SVG in a rectangle, change to 0 because the SVG is just a square now
    text = "";

    // build the outer parachain boxes and the paths that lead to the middle
    for (var i = 0; i < number; i++) {
        thisX = offsetX + centerX + Math.cos(angleBetween * i) * (centerX * .8);
        thisY = centerY + Math.sin(angleBetween * i) * (centerX * .8);
        text += "<a href='https://polkadot.js.org/apps/?rpc=wss%3A%2F%2F";
        text += parachain_id_to_url[chains_array[i]];
        text += "#/explorer'>";
        text += "<rect id='chain_id_" + chains_array[i] + "' x='" + (thisX - 30) + "' y='" + (thisY - 30) + "' rx='10' ry='10' width='60' height='60' stroke='black' stroke-width='0' fill='#BBBBBB' transform='rotate(" + (360/num_chains)*i + ", " + (thisX) + ", " + (thisY) + " )' />\n";
        text += "<rect id='innerchain_id_" + chains_array[i] + "' x='" + (thisX - 12) + "' y='" + (thisY - 12) + "' rx='5' ry='5' width='24' height='24' fill='#FFFFFF' transform='rotate(" + (360/num_chains)*i + ", " + (thisX) + ", " + (thisY) + " )' />\n";
        text += "<rect id='chain_under_id_" + chains_array[i] + "' x='" + (thisX-12) + "' y='" + (thisY-12) + "' rx='5' ry='5' width='24' height='24' fill='#FFFFFF' transform='rotate(" + (360/num_chains)*i + ", " + (thisX) + ", " + (thisY) + " )' />\n";
        text += "</a>\n";
        text += "<path id='path_under_id_" + chains_array[i] + "'d='M" + thisX + " " + thisY + " L" + (offsetX + centerX) + " " + centerY + " Z' stroke='black' stroke-width='2' />\n";
        text += "<path id='path_id_" + chains_array[i] + "'d='M" + thisX + " " + thisY + " L" + (offsetX + centerX) + " " + centerY + " Z' stroke='black' stroke-width='2' />\n";
        text += "<text x='" + (thisX - 50) + "' y='" + (thisY - 60) + "' fill='black'> " + parachain_id_to_name[chains_array[i]] + " (" + chains_array[i] + ")</text>";
        text += "<text id='hash_text_id_" + chains_array[i] + "' x='" + (thisX - 50) + "' y='" + (thisY - 40) + "' fill='black'></text>";
    }

    // build the relay chain
    text += "<a href='https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frococo-rpc.polkadot.io#/explorer'>";
    text += "<circle cx='" + (centerX + offsetX) + "' cy='" + centerY + "' r='120' fill='none' stroke-width='40' stroke='#777777' />";
    text += "</a>";

    // build the little white boxes in the relay chain
    for (var i = 0; i < number; i++) {
        thisX = offsetX + centerX + Math.cos(angleBetween * i) * (centerX * .34);
        thisY = centerY + Math.sin(angleBetween * i) * (centerX * .34);
        text += "<rect id='chain_connect_id_" + chains_array[i] + "' x='" + (thisX - 10) + "' y='" + (thisY - 10) + "' rx='4' ry='4' width='20' height='20' fill='#FFFFFF' transform='rotate(" + (360/num_chains)*i + ", " + (thisX) + ", " + (thisY) + " )' />\n";
    }
    // console.log(text);
    elem.innerHTML = text;
}


async function main() {
    const provider = new WsProvider('wss://rococo-rpc.polkadot.io/');
    const api = await ApiPromise.create({ provider });
    const chain = await api.rpc.system.chain();
    console.log(`Connected to ${chain}!`);

    update_parachain_heads(api);
    show_new_blocks(api);
    show_queues(api);

}

async function show_new_blocks(api) {
    const block_unsub = await api.rpc.chain.subscribeNewHeads((block) => {
        console.log("New block: " + block.number + "\n");
    })
}

async function show_queues(api) {
    const parachainIDS = await api.query.registrar.parachains(); // returns an arary of all the parachains connected to the network
    parachainIDS.forEach(async (id) => {
        await api.query.parachains.downwardMessageQueue(id, (incoming_messages) => {
            console.log("Parachain with ID " + id + " - Incoming Messages: " + incoming_messages.length + "\n");
        });
        await api.query.parachains.relayDispatchQueue(id, (outgoing_messages) => {
            console.log("Parachain ID " + id + " - Outoging Messages: " + outgoing_messages.length + "\n");
        });
    })
}

async function update_parachain_heads(api) {
    const parachainIDS = await api.query.paras.parachains(); // returns an arary of all the parachains connected to the network

    parachainIDS.forEach(async (id) => {
        await api.query.paras.heads(id, (head) => {
            // elem = document.getElementById('event_updates_content');
            // elem.innerText = elem.innerText + "Parachain with ID: " + id + " new head: " + head.toHuman() + "\n";
            console.log("Parachain with ID " + id + " - New Head: " + head.toHuman().substring(0, 20) + "...\n");
        });
    });
}

// main()