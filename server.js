const axios = require('axios')
const WebSocketClient = require('websocket').client;

let accountNum = "9875774";

function httprequest(callback){
    let idpURI = "";
    let asyncMessageURI = "";
    let jwtToken = "";

    axios.get(`http://api.liveperson.net/api/account/${accountNum}/service/idp/baseURI.json?version=1.0`)
    .then(res => {
        console.log(`statusCode: ${res.status}`)
        console.log(res.data.baseURI)
        idpURI = res.data.baseURI;

        if(idpURI == undefined)
        {
            console.log("IDP URI is undefined");
        }

        axios.get(`http://api.liveperson.net/api/account/${accountNum}/service/asyncMessagingEnt/baseURI.json?version=1.0`)
            .then(res => {
            console.log(`statusCode: ${res.status}`)
            console.log(res.data.baseURI)
            asyncMessageURI = res.data.baseURI;

            if(asyncMessageURI == undefined)
            {
                console.log("asyncMessageURI is undefined");
            }
                axios.post(`https://${idpURI}/api/account/${accountNum}/signup`)
                    .then(res => {
                    console.log(`statusCode: ${res.status}`)
                    console.log(res.data.jwt)
                    jwtToken = res.data.jwt;

                    if(jwtToken == undefined)
                    {
                        console.log("jwtToken is undefined");
                    }

                    callback(idpURI, asyncMessageURI, jwtToken);
                })
                .catch(error => {
                    console.error(error)
                })     
            })
            .catch(error => {
                console.error(error)
            })     
    })
    .catch(error => {
        console.error(error)
    })
}

function next(idpURI, asyncMessageURI, jwtToken){
    var client = new WebSocketClient();

    client.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
    });

    client.on('connect', function(connection) {
        console.log("connected")
        let conversationId = ''

        connection.on('message', function(msg){
            let data = JSON.parse(msg.utf8Data);
            console.log(data);

            if(data.reqId == "0"){
                connection.sendUTF(JSON.stringify({"kind":"req","id":1,"type":"cm.ConsumerRequestConversation"}));

            }else if(data.reqId == "1"){
                conversationId = data.body.conversationId
                connection.sendUTF(JSON.stringify(
                    {
                        "kind": "req",
                        "id": "2",
                        "type": "ms.PublishEvent",
                        "body": {
                        "dialogId": conversationId,
                        "event": {
                        "type": "ContentEvent",
                        "contentType": "text/plain",
                        "message": "My first message"
                        }
                        }
                        }
                ))
            }else if(data.reqId == "2")
            {
                connection.sendUTF(JSON.stringify(
                    {
                        "kind": "req",
                        "id": "3",
                        "type": "cm.UpdateConversationField",
                        "body": {
                        "conversationId": conversationId,
                        "conversationField": [{
                        "field": "ConversationStateField",
                        "conversationState": "CLOSE"
                        }]
                        }
                        }
                ))
            }

        })

       connection.sendUTF(JSON.stringify(
        {
            "kind": "req",
            "id": "0",
            "type": "InitConnection",
            "headers": [{
            "type": ".ams.headers.ClientProperties",
            "deviceFamily": "DESKTOP",
            "os": "WINDOWS"
            }, {
            "type": ".ams.headers.ConsumerAuthentication",
            "jwt": jwtToken
            }]
            }
       ))
    });


    console.log(`wss://${asyncMessageURI}/ws_api/account/${accountNum}/messaging/consumer?v=3`)
    client.connect(`wss://${asyncMessageURI}/ws_api/account/${accountNum}/messaging/consumer?v=3`, '', headers=`Authorization:jwt ${jwtToken}`);
}

httprequest(next);