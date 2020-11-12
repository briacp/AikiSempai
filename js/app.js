window.myApp = {
  //CATALOG_URL: "https://avironbayonnaisaikido.org/aikisempai/data/aikido_catalogue.json"
  //CATALOG_URL: "http://localhost/aikisempai/data/aikido_catalogue.json"
  CATALOG_URL: "https://briacp.github.io/AikiSempai/data/aikido_catalogue.json"
};

window.aikiCatalog = {};

// Setup YT player
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.onYouTubeIframeAPIReady = function() {
  myApp.ytPlayer = new YT.Player('video-placeholder', {
    playerHeight: '100%',
    playerWidth: '100%',
    playerVars: {
      controls: 1,
      loop: 1,
      modestbranding: 1,
      rel: 0  // limit the suggestions to the current channel
    },
    events: {
      //onReady: initialize
    }
  });
};

document.addEventListener('init', function (event) {
  var page = event.target;

  $.getJSON(myApp.CATALOG_URL, function (data) {
    window.aikiCatalog = data;
  });

  // Each page calls its own initialization controller.
  if (myApp.controllers.hasOwnProperty(page.id)) {
    myApp.controllers[page.id](page);
  }

});

