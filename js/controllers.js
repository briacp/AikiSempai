// jshint esversion:6
/***********************************************************************
 * App Controllers. These controllers will be called on page initialization. *
 ***********************************************************************/

myApp.controllers = {
    homePage: function (page) {
        // Set button functionality to open/close the menu.
        page.querySelector('[component="button/menu"]').onclick = function () {
            document.querySelector('#splitter').left.toggle();
        };

        // Change tabbar animation depending on platform.
        //page.querySelector('#tabbar').setAttribute('animation', ons.platform.isAndroid() ? 'slide' : 'none');
    },

    searchPage: function (page) {
        page.querySelector('[component="button/menu"]').onclick = function () {
            document.querySelector('#splitter').left.toggle();
        };

        var checkIncludeKyu = function () {
            var kyu = $('#choose-kyu').val();
            $('#include-kyus').prop('disabled', function (i, v) { return !kyu; });
        };
        checkIncludeKyu();
        page.querySelector('#choose-kyu').onchange = checkIncludeKyu;

        var infiniteList = page.querySelector('#search-results-list');

        var fixName = function (s) {
            if (!s) {
                return '';
            }
            s = s.replace(/_/g, ' ').replace(/ai\s*hanmi/, 'ai-hanmi');
            return s.charAt(0).toUpperCase() + s.slice(1);
        };

        var createListItem = function (c) {
            if (!c) {
                if (!aikiCatalog.catalogue) {
                    return ons.createElement('<ons-list-item><div class="noresults">⚠️ Catalogue des techniques introuvable</div></ons-list-item>');
                } else {
                    return ons.createElement('<ons-list-item><div class="noresults">🤷 Aucun résultats</div></ons-list-item>');
                }
            }

            var hasVideo = c.youtube;

            var title = [fixName(c.attaque), fixName(c.technique), fixName(c.extra)].join(' ');
            var subtitle = fixName(c.waza) + (c.kyu[0] ? ' - ' + c.kyu[0] + (c.kyu[0] == 1 ? 'er' : 'e') + ' kyu' : '');

            return ons.createElement([
                '<ons-list-item', (hasVideo ? ' tappable onclick="myApp.services.video.play(\'' + c.youtube + '\')"' : ''), '>',
                '<div class="left">',
                '<img class="list-item__thumbnail" src="img/list_icon/' + c.technique + '.png">',
                '</div>',
                '<div class="center">',
                '<span class="list-item__title">', title, '</span>',
                '<span class="list-item__subtitle">', subtitle, '</span>',
                '</div>',
                '<div class="right">',
                (c.important ? '<span class="notification">!</span>' : ''),
                (hasVideo ?
                    '<ons-icon icon="md-play" class="list-item__icon"></ons-icon>' :
                    ''
                ),
                '</div>',
                '</ons-list-item>'
            ].join(''));
        };

        var lastSearch = 'fullText';

        var scrollToResults = function () {
            document.getElementById("search-results").scrollIntoView({
                behavior: 'smooth'
            });
        };

        var searchFullText = function () {
            var search = $("#search-text").val().toLowerCase();
            var withVideo = document.querySelector('#search-video-only').checked;

            lastSearch = 'fullText';

            //console.log("searchFullText", search, withVideo);

            var matches = [];
            if (aikiCatalog.catalogue) {

                matches = aikiCatalog.catalogue
                    .filter(it => !withVideo || (it.youtube && withVideo))
                    .filter(it => it.titre.toLowerCase().includes(search));
            }

            infiniteList.delegate = {
                createItemContent: function (i) {
                    return createListItem(matches[i]);
                },
                countItems: function () {
                    return matches.length || 1;
                }
            };

            infiniteList.refresh();
            scrollToResults();
        };

        var searchSwitches = function () {
            var waza = $('#choose-waza').val() || null;
            var attaque = $('#choose-attaque').val() || null;
            var technique = $('#choose-technique').val() || null;
            var kyu = $('#choose-kyu').val() || null;
            var withVideo = document.querySelector('#search-video-only').checked;
            var lowerKyus = document.querySelector('#include-kyus').checked;

            lastSearch = 'switches';

            console.log("searchSwitches", waza, attaque, technique, kyu, withVideo, lowerKyus);

            var matches = [];
            if (aikiCatalog.catalogue) {
                matches = aikiCatalog.catalogue
                    .filter(it => !withVideo || (it.youtube && withVideo))
                    .filter(it =>
                        // Pas de Kyu choisi
                        !kyu ||
                        // Kyu choisi, mais la technique n'en precise pas
                        !(kyu && it.kyu[0] != null) ||
                        // Se limiter au Kyu choisi
                        (!lowerKyus && it.kyu[0] && kyu == it.kyu[0]) ||
                        // Inclure les Kyus inférieurs
                        (lowerKyus && it.kyu[0] != null && kyu <= it.kyu[0])
                    )
                    .filter(it =>
                        (!waza || it.waza == waza) &&
                        (!technique || it.technique == technique) &&
                        (!attaque || it.attaque == attaque)
                    );
            }
            //matches.forEach(it => console.log(it.name));

            infiniteList.delegate = {
                createItemContent: function (i) {
                    return createListItem(matches[i]);
                },
                countItems: function () {
                    return matches.length || 1;
                }
            };

            infiniteList.refresh();
            scrollToResults();
        };

        page.querySelector('#search-text').onchange = searchFullText;
        Array.prototype.forEach.call(page.querySelectorAll('select'), function (element) {
            element.onchange = searchSwitches;
        });

        page.querySelector('#search-video-only').onchange = function () {
            if (lastSearch == 'switches') {
                searchSwitches();
            } else {
                searchFullText();
            }
        };

        page.querySelector('#include-kyus').onchange = function () {
            if (lastSearch == 'switches') {
                searchSwitches();
            } else {
                searchFullText();
            }
        };

    },

    prepaKyuPage: function (page) {
        page.querySelector('[component="button/menu"]').onclick = function () {
            document.querySelector('#splitter').left.toggle();
        };
    },

    ////////////////////////
    // Menu Page Controller //
    ////////////////////////
    menuPage: function (page) {

        // Set button functionality to push 'new_task.html' page.
        Array.prototype.forEach.call(page.querySelectorAll('[pagelink]'), function (element) {
            element.onclick = function () {
                var content = document.getElementById('content');
                var menu = document.getElementById('menu');
                content.load($(this).attr('pagelink')).then(document.querySelector('#splitter').left.toggle());
            };

            if (element.show) {
                // Fix ons-fab in Safari.
                element.show();
            }
        });

        // Change splitter animation depending on platform.
        document.querySelector('#splitter').left.setAttribute('animation', ons.platform.isAndroid() ? 'overlay' : 'reveal');
    }

};
