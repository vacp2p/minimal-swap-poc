# README

A minimal end to end proof of concept of using Swap contracts written by Swarm
and maintained here: https://github.com/ethersphere/swap-swear-and-swindle

All significant code imported from the above repo. Only minor adjustments to
hooking things up and illustrates things in a minimal fashion.

## Running

Ensure you have truffle and Ganache installed. Ganache should be running.

```
# To compile all contracts
truffle compile --all

# To run all migrations
truffle migrate --reset

# To get a truffle console
truffle console

# To run a server
npm run dev
```

## TODOs

x Import contracts and run migrations
x Setup basic UI
- Showcase basic chequebook end to end (deposit, show balance, withdraw)
- Get basic cheque sending working (web3 provider, util code)
- Showcase swap basic operation for two nodes
