import symbolSdk from 'symbol-sdk';
import { TextEncoder } from 'util';
import axios from 'axios';
import {getLogger} from './logger.js';

const logger = getLogger();

export async function writeBlockchain(type, value) {

  const NODE = process.env.BLOCKCHAIN_NODE
  const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY
  const MEASURE_RECIPIENT = process.env.BLOCKCHAIN_MEASURE_RECIPIENT
  const SPREAD_RECIPIENT = process.env.BLOCKCHAIN_SPREAD_RECIPIENT

  const node = axios.create({
    baseURL: NODE,
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' }
  })

  const network = symbolSdk.symbol.Network.TESTNET;
  const deadline = network.fromDatetime(new Date(Date.now() + 7200000)).timestamp;

  const facade = new symbolSdk.facade.SymbolFacade(network.name);

  const privateKey = new symbolSdk.PrivateKey(PRIVATE_KEY);
  const keyPair = new facade.constructor.KeyPair(privateKey);

  const textEncoder = new TextEncoder();
  const message = new Uint8Array([0x00, ...textEncoder.encode(value)]);

  const transaction = facade.transactionFactory.create({
    type: 'transfer_transaction_v1',
    signerPublicKey: keyPair.publicKey.toString(),
    fee: 30000n,
    deadline,
    recipientAddress: recipientAddress(type),
    message
  });

  const signature = facade.signTransaction(keyPair, transaction);
  const jsonPayload = facade.transactionFactory.constructor.attachSignature(transaction, signature);
  const hash = facade.hashTransaction(transaction).toString();
  logger.info(`Transaction hash: ${hash}`);

  await node.put("/transactions", jsonPayload).then((res) => res.data);



  function recipientAddress(type) {
    if (type === 'measure') {
      return MEASURE_RECIPIENT
    }

    if (type === 'spread') {
      return SPREAD_RECIPIENT
    }

    throw new Error('Invalid type')
  }
}

