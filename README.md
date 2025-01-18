# Idle Quest

## Overview

This repo two main components:

- `./` a nestjs backend for the api
- `./contracts` the smart contracts

## Smart contracts

#### Requirements

1. **Smart Contract**:
   - Create a contract on Base Sepolia testnet to:
     - Manage quest points (store and query points for wallet addresses).
     - Grant points to a wallet address securely.

The development environment for the smart contracts uses:

- `hardhat`: development environment for developing testing and deploying the smart contracts
- `openzeppelin`: contracts library.

The smart contract can be found in `./contracts/contracts/IdleQuest.sol`.
It is a simple contract which keeps state as a mapping between addresses and quest points. It provides two methods:

- `function get(address _addr) public view  returns (uint256)`: a public view function that can be called by anyone to retrieve the current quest points for an address
- `function set(address _addr, uint256 _points) public onlyOwner`: a function to update the points of an address that can only be called by the owner of the contract enforced using the openzeppelin Access API.

#### Local development and testing instructions

```bash
# switch the contracts folder
cd contracts

# install the dependencies
yarn

# compile the smart contract
yarn compile

# test the smart contracts
yarn test

# test the deployment of the smart contract
yarn deploy
```

To run a local development node to test against the backend server:

```bash
# in a terminal start a hardhat node (still will start a local node with pre funded accounts)
yarn hardhat:node

# in another terminal deploy the contract to the local node
yarn deploy:local
```

#### Deploying to base sepolia

To deploy to base sepolia we first need to setup hardhat with some required configuration variables:

```bash

# set infura api key
yarn hardhat vars set INFURA_API_KEY

# set the private key used to deploy the contract on base sepolia
yarn hardhat vars set BASE_SEPOLIA_PRIVATE_KEY
```

Once this is done we can deploy the contract to base sepolia with:

```bash
yarn deploy:sepolia
```

## Backend Service

#### Requirements

2. **Backend Service**:
   - Implement an API with an endpoint that:
     - Accepts a wallet address and a secret.
     - Validates the secret.
     - Grants points to the specified wallet by calling the smart contract once.

### Overview

The backend is built using:

- Node v22
- Nestjs v10
- ethers v6

And uses the following environment variables:

- `PRIVATE_KEY`: the private key for the owner of the contract. Only the owner of the contract is able to update quest points
- `RPC_URL`: the rpc url to connect to the blockchain network
- `CONTRACT_ADDRESS`: the address of the contract to call
- `JWT_SECRET`: The secret used by the backend to sign the jwt bearer tokens

It contains 4 main modules located under `./src`:

- `auth`: Handles user authentication
- `web3`: Handles all interactions with the blockchain
- `db`: Handles all interactions with the database (for simplicity it only uses a simple in memory storage)
- `points`: Provides the endpoints to both read and update quest points

#### Running a local development server

Make sure to have a local hardhat node running with the contract deployed as explained above in the smar contracts section and run:

```bash
yarn start
```

This will expose the server on `http://localhost:3000`

#### Running the backend tests

Again with a local hardhat node running with the contract deployed:

```bash
# run tests
yarn test

# run e2e tests
yarn test:e2e
```

#### Authentication module

I wasn't exactly sure what to do here, the requirements specify that it should accept a wallet address and a secret and validate the secret.

I decided to built the typical authentication flow for web3 apps, similar to the way that OpenSea and Craft World works when signing in with a wallet.

It makes use of the `nestjs/auth` and `nestjs/jwt` authentication framework and works as follows:

1. The user application makes a GET request to `/auth/:address`
2. The backend generates an new authentication challenge message with a nonce and stores it in the database.
3. The user application then requests the user wallet to sign the message.
4. The user application sends the signature and the nonce to the backend by making a POST request to `/auth`
5. The backend uses the nonce to fetch the authentication challenge from the database. It checks that the nonce and the address are correct and it then validates the signature
6. If the signature is correct the backend returns a bearer token that the user application can now use to make authenticated requests to the backend. This bearer token is a JWT token can contains the address of the authenticated user (besides the normal fields like expiry time).

#### Points API module

The points api exposes an endpoint to both get the points for an address and to add points for an address:

- The user application can get the points for an address by making a GET request to `/points/:address`. This is a public endpoint
- The user application can make an authenticated POST request to `/points` with the number of quest points to add. The backend will then get the authenticated user address from the JWT bearer token set on the request and make an on chain call to update the quest points for that address.

#### Web3 module

The web3 module provides a service for all blockchain related calls. In this case it provides methods to call the smart contract to both read and update the quest points. It also provides other utility methods like validating addresses.

#### DB module

The DB module provides a service for database related operations. Currently it is only used to store the authentication challenges so that it can later retrieve it when the user tries to login to check if the correct nonce was used. As it stands it is just storing the data in memory but it should be replaced with a database like postgres

## Deployment

For the deployment I used AWS ECS on Fargate and AWS copilot.
I used AWS copilot to generate the manifest files for a service called `idle-quest` for several different environments (test, staging, production).

### Instructions to deploy

First make sure to have a `.env` file locally with the environment variables set for the base sepolia network. You can use the `.env.development` file as an example. Once this is done deploying the service is just a matter of calling:

```
copilot deploy --name idle-quest --env production
```

## End to End flow

In this section is an end to end flow for the entire system using curl. Its the same flow as tested in `./test/app.e2e-spec.ts`

1. Start the hardhat development node

```bash
# switch to contracts folder
cd contracts

# start local development node
yarn hardhat:node

# compile the contract
yarn compile

# deploy the contract
yarn deploy:local
```

2. Start the backend service

```bash
# in the root of the project run
yarn start
```

The backend will now start service requests on `http://localhost:3000`

3. Create a test account

```typescript
import { ethers } from 'ethers';

const signer = ethers.Wallet.createRandom();
signer.address;
// '0x8259ffE425fAE8D89218f02A2d11bb9148254A8e'
```

4. Request an authentication challenge:

```bash
curl http://localhost:3000/auth/0x8259ffE425fAE8D89218f02A2d11bb9148254A8e

{"address":"0x8259ffE425fAE8D89218f02A2d11bb9148254A8e","nonce":"3475a3cc-c4f2-4dcc-a9e3-8a258b5d2537","message":"Welcome to IdleQuest.\n\naddress: 0x8259ffE425fAE8D89218f02A2d11bb9148254A8e\n\nnonce: 3475a3cc-c4f2-4dcc-a9e3-8a258b5d2537"}
```

5. Sign the message

```typescript
const message =
  'Welcome to IdleQuest.\n\naddress: 0x8259ffE425fAE8D89218f02A2d11bb9148254A8e\n\nnonce: 3475a3cc-c4f2-4dcc-a9e3-8a258b5d2537';

await signer.signMessage(message);
//'0xc3c552e476cd06cbc9f17bf634bbf8d70cceb1dd6f9decd51c640fdcd2a60aeb38d3f5504fd5cb69532177ef26949277904462c2db027711ae7d53d023abbc811c'
```

6. Login with the signed message

```bash
curl -X POST -H "Content-Type: application/json" -d '{"address": "0x8259ffE425fAE8D89218f02A2d11bb9148254A8e", "nonce": "3475a3cc-c4f2-4dcc-a9e3-8a258b5d2537", "signature": "0xc3c552e476cd06cbc9f17bf634bbf8d70cceb1dd6f9decd51c640fdcd2a60aeb38d3f5504fd5cb69532177ef26949277904462c2db027711ae7d53d023abbc811c"}' http://localhost:3000/auth

{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiMHg4MjU5ZmZFNDI1ZkFFOEQ4OTIxOGYwMkEyZDExYmI5MTQ4MjU0QThlIiwiaWF0IjoxNzM3MjE5NzU3LCJleHAiOjE3Mzc4MjQ1NTd9.JRWazbSXhRlT9z9sQsLhM5g_JQk2KnUhKRZDf5dNnKo"}
```

7. Make an authenticated request to update the quest points

```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiMHg4MjU5ZmZFNDI1ZkFFOEQ4OTIxOGYwMkEyZDExYmI5MTQ4MjU0QThlIiwiaWF0IjoxNzM3MjE5NzU3LCJleHAiOjE3Mzc4MjQ1NTd9.JRWazbSXhRlT9z9sQsLhM5g_JQk2KnUhKRZDf5dNnKo" -d '{"points": "10"}' http://localhost:3000/points

{"address":"0x8259ffE425fAE8D89218f02A2d11bb9148254A8e","points":"10"}
```
