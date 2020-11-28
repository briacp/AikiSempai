// jshint esversion:6
/***********************************************************************
 * App Controllers. These controllers will be called on page initialization. *
 ***********************************************************************/

AikiSempai.controllers = {
    homePage: function (page) {
        // Set button functionality to open/close the menu.
        page.querySelector('[component="button/menu"]').onclick = function () {
            document.querySelector('#splitter').left.toggle();
        };

        Array.prototype.forEach.call(page.querySelectorAll('[pagelink]'), function (element) {
            element.onclick = function () {
                var content = document.getElementById('content');
                content.load($(this).attr('pagelink'));
            };
        });

    },

    aboutPage: function (page) {
        // Set button functionality to open/close the menu.
        page.querySelector('[component="button/menu"]').onclick = function () {
            document.querySelector('#splitter').left.toggle();
        };

        if (aikiCatalog.catalogue) {
            var videos = aikiCatalog.catalogue
                .filter( i => i.youtube )
                .map( i => i.youtube )
                .filter( (value, index, self) => self.indexOf(value) === index ).length;
            $(document.querySelector('#catalog-info')).text( aikiCatalog.catalogue.length + " techniques référencées - " + videos + " vidéos");
        }
    },

    weeklyPage: function (page) {
        //AikiSempai.services.utils.setupMenu(page);

        // Set button functionality to open/close the menu.
        page.querySelector('[component="button/menu"]').onclick = function () {
            document.querySelector('#splitter').left.toggle();
        };

        if (!weeklyTechnique) {
            return;
        }

        // from https://stackoverflow.com/a/34323944
        var date = new Date();
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        // January 4 is always in week 1.
        var week1 = new Date(date.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        var weekNo =1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
        var year = date.getFullYear();

        //console.log("Week: " + weekNo + ", Year: " + date.getFullYear());

        var thisWeek = weeklyTechnique.find( it => it.year == year && it.week == weekNo );
        
        var tech;
        if (thisWeek && thisWeek.technique) {
            tech = thisWeek.technique;
        } else {
            // or random?
            tech = weeklyTechnique[0].technique;
        }

        var parts = tech.split('-');

        var fixName = AikiSempai.services.utils.fixName;
        $(document.querySelector('#weekly-waza')).text(fixName(parts[0]));
        $(document.querySelector('#weekly-attaque')).text(fixName(parts[1]));
        $(document.querySelector('#weekly-technique')).text(fixName(parts[2]));
        if (parts[3]) {
            $(document.querySelector('#weekly-extra')).text(fixName(parts[3]));
        } else {
            $(document.querySelector('#weekly-extra')).hide();
        }

        var found = aikiCatalog.catalogue.find(it => it.id == tech);
        if (found && found.youtube) {
            $(document.querySelector('#play-weekly')).click(function(ev) {
                AikiSempai.services.video.play(found.youtube);
            });
        } else {
            $(document.querySelector('#play-weekly')).hide();
        }

    },

    searchPage: function (page) {
        page.querySelector('[component="button/menu"]').onclick = function () {
            document.querySelector('#splitter').left.toggle();
        };

        $(document.querySelector("#search-results-title")).hide();

        var checkIncludeKyu = function () {
            var kyu = $('#choose-kyu').val();
            $('#include-kyus').prop('disabled', function (i, v) { return !kyu; });
        };
        checkIncludeKyu();
        page.querySelector('#choose-kyu').onchange = checkIncludeKyu;

        var infiniteList = page.querySelector('#search-results-list');

        var fixName = AikiSempai.services.utils.fixName;

        var createListItem = function (c) {
            if (!c) {
                if (!aikiCatalog.catalogue) {
                    return ons.createElement('<ons-list-item><div class="noresults">⚠️ Catalogue des techniques introuvable</div></ons-list-item>');
                } else {
                    return ons.createElement('<ons-list-item><div class="noresults">🤷 Aucun résultats</div></ons-list-item>');
                }
            }

            var hasVideo = c.youtube;

            var title = [fixName(c.attaque), fixName(c.technique), fixName(c.extra)]
                .filter( i=> i )
                .join(' <span class="separator">/</span> ');

            var subtitle = fixName(c.waza) + (c.kyu ? ' - ' + c.kyu + (c.kyu == 1 ? 'er' : 'e') + ' kyu' : '');

            return ons.createElement([
                '<ons-list-item', (hasVideo ? ' tappable onclick="AikiSempai.services.video.play(\'' + c.youtube + '\')"' : ''), '>',
                '<div class="left">',
                '<img class="list-item__thumbnail" src="img/list_icon/' + c.technique + '.png">',
                '</div>',
                '<div class="center">',
                '<span class="list-item__title">', title, '</span>',
                '<span class="list-item__subtitle">', subtitle, '</span>',
                '</div>',
                '<div class="right">',
                (c.important ? '<span class="notification" title="Technique importante">!</span>' : ''),
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

            updateSearchTitle(matches);

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

            // TODO handle soto_kaiten_nage / uchi_kaiten_nage / kaiten_nage as 1 technique

            lastSearch = 'switches';

            //console.log("searchSwitches", waza, attaque, technique, kyu, withVideo, lowerKyus);

            var matches = [];
            if (aikiCatalog.catalogue) {
                matches = aikiCatalog.catalogue
                    .filter(it => !withVideo || (it.youtube && withVideo))
                    .filter(it =>
                        // Pas de Kyu choisi
                        !kyu ||
                        // Kyu choisi, mais la technique n'en precise pas
                        !(kyu && it.kyu != null) ||
                        // Se limiter au Kyu choisi
                        (!lowerKyus && it.kyu && kyu == it.kyu) ||
                        // Inclure les Kyus inférieurs
                        (lowerKyus && it.kyu != null && kyu <= it.kyu)
                    )
                    .filter(it =>
                        (!waza || it.waza == waza) &&
                        (!technique || it.technique == technique) &&
                        (!attaque || it.attaque == attaque)
                    );
            }
            //matches.forEach(it => console.log(it.name));

            updateSearchTitle(matches);

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

        var updateSearchTitle = function(matches) {
            searchResultsTitle = $(document.querySelector("#search-results-title"));
            var size = matches.length;
            searchResultsTitle.text( size == 0 ? "Aucune technique trouvée" : size > 1 ? size + " techniques" : "Une technique" );
            searchResultsTitle.show();
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
