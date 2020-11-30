window.AikiSempai = {
  //BASE_URL: "https://avironbayonnaisaikido.org/aikisempai",
  BASE_URL: "https://briacp.github.io/AikiSempai",
  //BASE_URL: "http://localhost/aikisempai",
  CATALOG_URL: null,
  WEEKLY_URL: null,
};

AikiSempai.CATALOG_URL = AikiSempai.BASE_URL + "/data/aikido_catalogue.json";
AikiSempai.WEEKLY_URL= AikiSempai.BASE_URL + "/data/weekly.json";

window.aikiCatalog = {};
window.weeklyTechnique = [];

// Setup YT player
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.onYouTubeIframeAPIReady = function() {
  AikiSempai.ytPlayer = new YT.Player('video-placeholder', {
    playerHeight: '100%',
    playerWidth: '100%',
    playerVars: {
      controls: 1,
      loop: 0,
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

  if (! aikiCatalog.catalogue) {
    $.getJSON(AikiSempai.CATALOG_URL, function (data) {
      window.aikiCatalog = data;
    });
  }

  if (window.weeklyTechnique.length == 0) {
    $.getJSON(AikiSempai.WEEKLY_URL, function (data) {
      window.weeklyTechnique = data;
    });
  }

  // Each page calls its own initialization controller.
  if (AikiSempai.controllers.hasOwnProperty(page.id)) {
    AikiSempai.controllers[page.id](page);
  }

});

