$(function () {
    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;
  
    //Remplacez ici l'adresse IP par celle de votre raspberry ou par son nom
    var connection = new WebSocket('ws:narcos.local:3030');
  
    //Appelé lorsque la websocket se connecte correctement
    connection.onopen = function () {
        $('#status').text('Connecté');
    };

    //Appelé lorsque la websocket se ferme (quand on termine le serveur par exemple)
    connection.onclose = function () {
        $('#status').text('Déconnecté');
    };
  
    //Appelé si une erreur survient
    connection.onerror = function (error) {
        $('#status').text('Erreur');
        $('#content').append('Une erreur est survenue');
    };
  

    //Appelé lorsque le serveur envoie un message
    connection.onmessage = function (message) {
        $('#status').text('Connecté');
        //Ici on transforme la touche 'entrée' en tag HTML <br /> pour créer un retour à la ligne
        $('#content').append(message.data.replace(/\r/g, "<br />"));
    };
  });
