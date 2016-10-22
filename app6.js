//LUIS - Our own built model

var restify = require('restify');
var builder = require('botbuilder');


var connector = new builder.ChatConnector();

var bot = new builder.UniversalBot(connector);

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
server.post('/api/messages', connector.listen());


// Create LUIS recognizer that points at our model and add it as the root '/' dialog 
var model = 'https://api.projectoxford.ai/luis/v1/application?id=d6e993f5-038d-42b5-be10-19f115c3cee9&subscription-key=816c738a23314c97bd3cd34f14c1f62f';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

dialog.matches('Greeting', [
    function (session) {
        session.send("Hi there!");
    }
]);


dialog.matches('BuyProduct', [

    function (session, args, next) {     
        session.dialogData.product = "";
        session.send("You want to buy a product");
        if (builder.EntityRecognizer.findEntity(args.entities, 'ItemType')) {
            //   session.send("Setting Product");
            session.dialogData.product = builder.EntityRecognizer.findEntity(args.entities, 'Product').entity;
        }

        if (!session.dialogData.product) {
            builder.Prompts.choice(session, "Please select a product", ["Shirt", "Trouser", "Coat", "Tie"]);
        }
        else {
            next();
        }
       
    },
    function (session, results) {

        if (results.response) {
            session.dialogData.location = results.response.entity;
        }
       else {
            session.send("Ok");
        }
    },


]);


dialog.onDefault(builder.DialogAction.send("ok. I'm sorry. I didn't understand."));
