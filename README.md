NOTE: ARCHIVED - This old repository presented patterns for working with what Stellar "basic" contracts at the time. However Stellar is now introducing Soroban contracts which are much more advanced smart contracts. Archiving this first because no activity but second to avoid confusion with the new contracts.  

# stellar-contracts
[![Build Status](https://travis-ci.org/chatch/stellar-contracts.svg?branch=master)](https://travis-ci.org/chatch/stellar-contracts)

https://stellar-contracts.herokuapp.com

This site presents smart contract patterns for the [Stellar Network](https://stellar.org). See [this post](https://www.stellar.org/blog/multisig-and-simple-contracts-stellar/) for some background on contracts on Stellar.

Each contract can be deployed to the Stellar Network using the contract forms. You'll receive a JSON receipt with details of transactions, accounts created, etc.

Contract forms are React components that are reusable in other sites (i will add an example setup for this).  This means you could easily drop one of these into your React or Angular (via ngReact) wallet to provide one of the contract setups to your users.

## Get started
```
npm install
npm start
```
