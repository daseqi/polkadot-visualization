import 'dotenv/config';
import { ApiPromise, WsProvider } from '@polkadot/api';

const uri = process.env.URI;
const max_stored_blocks = 10;



export default class API {
    papi = null;
    ids = null;
    testMessage = 'ok';



    // test method to ensure api is working
    test() {
        return ({ 'message': this.testMessage });
    }

    loadAPI() {
        return new Promise((resolve, reject) => {
            if (this.papi != null){
                // this.papi = r; // I think this is causing "undefined" error
                this.papi.rpc.system.chain().then((r) => {
                    resolve(`Connection already established. Connected to ${r} at ${uri}`, r, uri);
                }).catch((e) => { reject(e); });
            }
            else{
                let provider = new WsProvider(uri);
                ApiPromise.create({ provider }).then((r) => {
                    this.papi = r;
                    this.papi.rpc.system.chain().then((r) => {
                        resolve(`Created new connection. Connected to ${r} at ${uri}`, r, uri);
                    }).catch((e) => { reject(e); });
                }).catch((e) => { reject(e); });
            }
        });
    }

    // save parachain ids in this.ids
    getParachainIDs() {
        return new Promise((resolve, reject) => {
            if (this.papi == null) reject('API not loaded. Call loadAPI() before calling another function.');
            this.papi.query.paras.parachains().then((r) => {
                this.ids = r;
                resolve({ ids: r });
            }).catch((e) => { reject(e); })
        });
    }

    // return all parachains on relay
    getParachains() {
        return new Promise((resolve, reject) => {
            if (this.papi == null) reject('API not loaded. Call loadAPI() before calling another function.');
            let headRequests = [];
            if (this.ids == null || this.ids.length == 0) { reject('No parachain ids.'); }
            this.ids.forEach(id => {
                headRequests.push(this.papi.query.paras.heads(id));
            });
            Promise.all(headRequests).then((heads) => {
                let response = {};
                response.parachains = [];
                for (let i = 0; i < headRequests.length; i++) {
                    response.parachains.push({
                        id: this.ids[i],
                        head: heads[i]
                    });
                    console.log('Parachain with ID: ' + this.ids[i] + ' new head:' + heads[i] + '\n');
                }
                resolve(response);
            }).catch((e) => {
                // Parachain head request failed
                reject(e);
            });
        });
    }

    heads = [];
    head = null;
    subscription = null;

    dirtyHeads = 0;

    // Returns whether or not the api is subscribed to new heads
    subscribed() { return (this.subscription != null); }

    // Subscribes to new heads and unsubscribes once a certain number of heads have been received
    async subscribeNewHeads() {
        if (this.subscribed()){
            console.log("Already subscribed:");
            return "Already subscribed.";

        }
        this.subscription = await this.papi.rpc.chain.subscribeNewHeads((block) => {
            console.log("New block: " + block.number + "\n");
            
            // Add new block to list of blocks
            this.heads.push(block);
            if (this.heads.length > max_stored_blocks) this.heads.pop();
            
            // Store latest block
            this.head = block;
            
            // Unsubscribe if more than dirtyHeads blocks have been loaded since a latestHead request
            this.dirtyHeads++;
            if (this.dirtyHeads > max_stored_blocks) this.unsubscribeNewHeads();
        });
        return "Subscribed to new blocks.";
    }

    // Unsubscribes the api from new heads and sets subscription to null
    unsubscribeNewHeads() {
        if (this.subscription != null) {
            this.subscription();
            this.subscription = null;
            this.heads = [];
            console.log('unsubscribed!!!');
            return "Unsubscribed successfully.";
        } else return "Must be subscribed to unsubscribe.";
    }

    // Returns the latest head
    latestHead() {
        this.dirtyHeads = 0;
        return { head: this.head };
    }

    parachainHeads = {};
    chainSubscriptions = {};

    parachainSubscribed(ID){
        console.log("Checking " + ID);
        console.log(this.chainSubscriptions[ID] != null);
        return (this.chainSubscriptions[ID] != null);
    }

    async subscribeParachainHeads() {
        const parachainIDS = await this.papi.query.registrar.parachains(); // returns an arary of all the parachains connected to the network
        console.log("Parachain IDS: " + parachainIDS);
        for(i = 0; i<parachainIDS.length; i++){
            this.chainSubscriptions[parachainIDS[i]] = null;
            subscribeParachainHead(parachainIDS[i]);
        }
        return "Subscribed to parachains";
    }

    async subscribeParachainHead(chainID) {
        if (parachainSubscribed(chainID)){
            console.log("Chain " + chainID + " already subscribed.");
            return "Chain " + chainID + " already subscribed.";
        }

        this.chainSubscriptions[chainNum] = await this.papi.query.parachains.heads(chainID, (head)=>{
            this.parachainHeads[chainID] = head;
            console.log("Parachain with ID " + chainID + " - New Head: " + head.toHuman().substring(0, 20) + "...");
        });
        console.log("Subscribed to parachain " + chainNum);
        return "Subscribed to parachain " + chainNum;
    }


    getParachainHeads() {
        return {parachainHeads: this.parachainHeads}
    }

    // added: hard-coded the return of a proposed Rococo parachain with ID 1
    // to-do: need to find way to return all proposed parachains...
    getProposedParachains() {
        return new Promise((resolve, reject) => {
            if (this.papi == null) reject('API not loaded. Call loadAPI() before calling another function.');
            let chains = []
            this.papi.query.proposeParachain.proposals(1).then((r) => { // returns parachain with ID #1
                resolve(r);
            }).catch((e) => { reject(e); })
        });
    }

    // added
    getActiveValidators() {
        return new Promise((resolve, reject) => {
            if (this.papi == null) reject('API not loaded. Call loadAPI() before calling another function.');
            this.papi.query.session.validators().then((r) => { //
                resolve(r);
            }).catch((e) => { reject(e); })
        });
    }

    // added
    getValidatorGroups() {
        return new Promise((resolve, reject) => {
            if (this.papi == null) reject('API not loaded. Call loadAPI() before calling another function.');
            this.papi.query.scheduler.validatorGroups().then((r) => { // 
                resolve(r);
            }).catch((e) => { reject(e); })
        });
    }


    
    async getConstants() {   
        
        /*
        console.log("I AM HERE");
        return new Promise((resolve, reject) => {
            if (this.papi == null) reject('API not loaded. Call loadAPI() before calling another function.');
            this.papi.query.balances.totalIssuance().then((r) => { //
                resolve(r);
            }).catch((e) => { reject(e); })
        });
        */
        const DOT_DECIMAL_PLACES = 1000000000000;
        let lowest = "no one";
        let highest = "no one";
        let highestAmount = NaN;
        let lowestAmount = NaN;
        let highestCommission = "no one";
        let lowestCommission = "no one";
        let highestCommissionAmount = NaN;
        let lowestCommissionAmount = NaN;

        const provider = new WsProvider('wss://kusama-rpc.polkadot.io/')
        const api = await ApiPromise.create({ provider })
        const [ currentValidators, totalIssuance, currentEra ] = await Promise.all([
          api.query.session.validators(),
          api.query.balances.totalIssuance(),
          api.query.staking.currentEra(),
        ]);
        const totalBondingStake = await api.query.staking.erasTotalStake(currentEra.toString())
        const totalKSM = parseInt(totalIssuance.toString())
        const theTotalKSM = totalKSM/DOT_DECIMAL_PLACES
        const bondStake = totalBondingStake.toString() / DOT_DECIMAL_PLACES
        const stakeRate = totalBondingStake.toString() / totalKSM * 100

        return {theTotalKSM, bondStake, stakeRate, currentEra}
        
        // i think this loop below is giving us some issues
        /* 
        for (let i=0; i<currentValidators.length; i++) {
            const validatorStake = await api.query.staking.erasStakers(currentEra.toString(), currentValidators[i])
            const validatorComissionRate = await api.query.staking.erasValidatorPrefs(currentEra.toString(), currentValidators[i])
            const validatorTotalStake = validatorStake['total'].toString() / DOT_DECIMAL_PLACES

            const currentValidator = currentValidators[i].toString();
            const stake = parseInt(validatorTotalStake);
            const commission = parseInt(validatorComissionRate['commission'].toString())

            if (isNaN(highestAmount)) {
                // If highest_amount is NaN, this must be the
                // first.  Set this validator to highest and lowest everything.
                lowest = highest = currentValidator
                lowestAmount = highestAmount = stake
                lowestCommission = highestCommission = currentValidator
                lowestCommissionAmount = highestCommissionAmount = commission
            } else {
                // Check total stake
        
                if (stake > highestAmount) {
                highest = currentValidator
                highestAmount = stake
              } else if (stake < lowestAmount) {
                lowest = currentValidator
                lowestAmount = stake
                }
        
                // Check commissions
        
                if (commission > highestCommissionAmount) {
                highestCommission = currentValidator
                highestCommissionAmount = commission
              } else if (commission < lowestCommissionAmount) {
                lowestCommission = currentValidator
                lowestCommissionAmount = commission
                }
            }
            //check(currentValidators[i].toString(), parseInt(validatorTotalStake), parseInt(validatorComissionRate['commission'].toString()))

        }

        //console.log()
        //console.log("\nSummary Data:")
        //console.log(`Total KSM: ${totalKSM / DOT_DECIMAL_PLACES}`)
        //console.log(`Bonding Stake: ${totalBondingStake.toString() / DOT_DECIMAL_PLACES} KSM`)
        //console.log(`Staking Rate: ${totalBondingStake.toString() / totalKSM * 100} %`)

        //console.log(`Highest-staked validator: ${highest} : ${highestAmount} KSM`)
        //console.log(`Lowest-staked validator: ${lowest} : ${lowestAmount} KSM`)
        //console.log(`Highest commission validator: ${highestCommission} : ${highestCommissionAmount / 10000000}%`)
        //console.log(`Lowest commission validator: ${lowestCommission} : ${lowestCommissionAmount / 10000000}%`)

        const newTotalKSM = totalKSM / DOT_DECIMAL_PLACES;
        const bondingStake = totalBondingStake.toString() / DOT_DECIMAL_PLACES;
        const stakingRate = totalBondingStake.toString() / totalKSM * 100;
        const highestStakedValidator = { highest, highestAmount};
        const lowestStakedValidator = { lowest, lowestAmount};
        //const highestCommissionValidator = {highestCommission};
        return {currentValidators, totalIssuance, currentEra, totalBondingStake};
        */
    }

}
