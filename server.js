const axios = require("axios").default;

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey:"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",
});
const openai = new OpenAIApi(configuration);

const runPrompt = async (to, from, msg_body) =>{
    const response = await openai.createCompletion({
        model:"text-davinci-003",
        prompt: msg_body,
        max_tokens: 2048,
        temperature: 1,
    });
    console.log(response.data.choices[0].text);
    //return response.data.choices[0].text;
    sendMessage(to, from, response.data.choices[0].text);
    //return response
};


//------------------------------------------------



// Variables           
const whatsAppToken = "";
const verifyToken = "123";
// Dialogflow

exports.cloudAPI = async (req, res) => {
    // VERIFICATION
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];
    if (mode && token) {
        if (mode === "subscribe" && token === verifyToken) {
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
    
    // RESPONSE
    if (req.body.object) {
        if (
            req.body.entry &&
            req.body.entry[0].changes &&
            req.body.entry[0].changes[0] &&
            req.body.entry[0].changes[0].value.messages &&
            req.body.entry[0].changes[0].value.messages[0]
            ) {
                // Get Variables
                let to = req.body.entry[0].changes[0].value.metadata.phone_number_id;
                let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
                let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
                num = from.slice(0,4) + "9" + from.slice(4);
                console.log(`esse é o to: ${to} 
                esse é o from:${from}
                esse é o msg_body: ${msg_body}
                esse é o num: ${num}
                `);
                
      
// Get Dialogflow Responses
try {
      await runPrompt(to, num, msg_body);
  } catch (e) {
    console.log(e);
    res.sendStatus(403);
  }
  res.sendStatus(200);
}
} else {
// Return a '404 Not Found' if event is not from a WhatsApp API
res.sendStatus(404);
}
};




    
    const sendMessage = async (to, num, resposta) => {
        await axios({
            method: "POST", // Required, HTTP method, a string, e.g. POST, GET
            url:
            "https://graph.facebook.com/v12.0/" +
            to +
            "/messages?access_token=" +
            whatsAppToken,
            data: {
                messaging_product: "whatsapp",
                to: num,
                text: { body: resposta },
            },
            headers: { "Content-Type": "application/json" },
        });
    };

