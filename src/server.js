import 'dotenv/config';
import express from 'express';
import api from './api';

const app = express();
const polkadotApi = new api();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res) => {
    // return res.send({ response: polkadotApi.test() });
    return res.sendFile('./index.html', {root: __dirname});
});

app.get('/styles.css', (req, res) => {
    return res.sendFile('./styles.css', {root: __dirname});
});

app.get('/scripts.js', (req, res) => {
    return res.sendFile('./scripts.js', {root: __dirname});
});

app.get('/anime.min.js', (req, res) => {
    return res.sendFile('./anime.min.js', {root: __dirname});
});


app.get('/getParachains', (req, res) => {
    polkadotApi.getParachains().then((response) => {
        return res.send({ response: response });
    }).catch((e) => {
        return res.send(e);
    });
});

app.get('/getParachainIDs', (req, res) => {
    polkadotApi.getParachainIDs().then((response) => {
        return res.send({ response: response });
    }).catch((e) => {
        return res.send(e);
    });
});

app.get('/loadAPI', (req, res) => {
    polkadotApi.loadAPI().then((response) => {
        return res.send({ response: response });
    }).catch((e) => {
        return res.send(e);
    });
});

app.get('/subscribeToEvents', (req, res) => {
    polkadotApi.subscribeNewHeads().then((response) => {
        return res.send({ response: response });
    }).catch((e) => {
        return res.send(e);
    });
});

app.get('/latestEvents', (req, res) => {
    return res.send({ response: polkadotApi.latestHead() });
});

app.get('/subscribeToChains', (req, res) => {
    polkadotApi.subscribeParachainHeads().then((response) => {
        return res.send({ response: response });
    }).catch((e) => {
        return res.send(e);
    });
});

app.get('/latestParachainHeads', (req, res) => {
    return res.send({ response: polkadotApi.getParachainHeads() });
});

// added
app.get('/getProposedParachains', (req, res) => {
    polkadotApi.getProposedParachains().then((response) => {
        return res.send({ response: response });
    }).catch((e) => {
        return res.send(e);
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Polkadot API Server listening on port ${process.env.PORT}!`);
});
