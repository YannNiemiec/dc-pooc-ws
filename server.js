const express = require('express')
const app = express()
const port = 3000

//On initialise notre utilitaire node pour communiquer avec le capteur 
//(capteur = sensor en anglais)
const sonde = require('ds18b20');
//Identifiant de notre capteur, remplacez les X par ce que vous avez eu précédemment.
const sondeId = '28-01131a3eb0d1';

//Initialisation de l'utilitaire Onoff pour gérer
//les GPIOs du raspberry
const Gpio = require('onoff').Gpio;
//Initialisation de notre GPIO 17 pour recevoir un signal
//Contrairement à nos LEDs avec lesquelles on envoyait un signal
var sensor = new Gpio(17, 'in', 'both');

//Fonction pour quitter le script
function exit() {
	sensor.unexport();
	process.exit();
}

//Création et configuration d'un server dse websockets
const websocket = require('ws');
const wss = new websocket.Server({ port: 3030 });
var clients = [];
wss.on('connection', function connection(ws) {
	clients.push(ws);
	ws.on('message', function incoming(message) {
		console.log('received: %s', message);
	});
});
//fonction pour envoyer du texte à tous les clients
function sendText(text) {
	for(index in clients) {
		clients[index].send(text);
	}
}

//Configuration de la console pour lire le clavier
const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
	//On détecte le Ctrl-C pour stopper le serveur.
	if (key.ctrl && key.name === 'c') {
		process.exit();
	} else {
		//On envoie directement la touche reçue au client.
		sendText(str);
	}
});

//Ici on "surveille" le GPIOs 17 (correspondant au capteur)
//Dès qu'il y a du mouvement cette partie du code sera exécuté.
sensor.watch(function (err, value) {
	if(err) exit();
	//Si le capteur détecte du mouvement 
	//On affiche 'Mouvement détecté'
	if(value == 1) {
		sendText('Mouvement détecté !<br>');
	} else {
		sendText('Fin du mouvement.<br>');
	}
});

setInterval(function() {
	//code à executer toutes les x secondes
	var temperature = sonde.temperatureSync(sondeId);
	sendText(temperature + '<br>');
}, 5000);

//OS est un utilitaire node qui va nous servir à afficher le nom de notre raspberry
const os = require("os");
//MustacheExpress est notre moteur de template
const mustacheExpress = require('mustache-express');

//Configuration du moteur de template
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

//Ici on dit au serveur de servir les fichiers statiques depuis le dossier /public
app.use(express.static('public'))

//On retrouve le même comportement que notre serveur précédent
app.get('/', (request, response) => {
	//Ici on indique que nous voulons transformer notre fichier index.mustache en HTML
	response.render('index');
});

app.listen(port, (err) => {
	if (err) {
		return console.log('Erreur du serveur : ', err)
  	}
	//On utilise l'utilitaire OS pour récupérer le nom de notre raspberry.
	console.log('Le serveur écoute sur le port '+port+'\nRendez vous sur http://'+os.hostname()+'.local:'+port);
	console.log('Tappez votre texte ici, il sera envoyé sur votre page web instantanément.');
});
