# LivePerson Coding Challenge
## ETS API conversation challenge - Cat Sheiles 3 February 2022

Object of the challenge is to interface with the LivePerson API to initialise a conversation between the Agent and the Customer

**Project flow**:

* Programmatically fetch two Domain URI's
* Obtain a JWT json web token from the API
* Establish a socket connection using the fetched token
* Use the connection to communicate with the Agent
* Close the chat to disconnect the socket


**Positive aspects**:
There are multiple steps of authentication required for this connection. Security conscious.

**Difficulties**:
Ensuring the requests displayed in the specific order to enable the conversation flow generated as expected.


# Build Instructions

* Run `npm install` in the root directory to download and install any needed dependencies.
* Run the application with `node server.js`
* The message will be received on the Agent portal
