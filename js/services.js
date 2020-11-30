/***********************************************************************************
 * App Services. This contains the logic of the application organised in modules/objects. *
 ***********************************************************************************/

AikiSempai.services = {

    video: {
        play: function(videoId, title) {
            var youtube = AikiSempai.ytPlayer;

            $("#modal-yt").show();

            console.log("Loading video [" + videoId + "]");

            youtube.loadVideoById(videoId);
        },
        close: function() {
            AikiSempai.ytPlayer.stopVideo();
            $("#modal-yt").hide();
        }
    },

    utils: {
        fixName: function (s) {
            if (!s) {
                return '';
            }

            s = s.replace(/_/g, ' ');

            return s.charAt(0).toUpperCase() + s.slice(1);
        },
        splitterSetup: function(page) {
            // Set button functionality to open/close the menu.
            page.querySelector('[component="button/menu"]').onclick = function () {
                document.querySelector('#splitter').left.toggle();
            };
        }
    },

    //////////////////////
    // Animation Service //
    /////////////////////
    animators: {

        // Swipe animation for task completion.
        swipe: function (listItem, callback) {
            var animation = (listItem.parentElement.id === 'pending-list') ? 'animation-swipe-right' : 'animation-swipe-left';
            listItem.classList.add('hide-children');
            listItem.classList.add(animation);

            setTimeout(function () {
                listItem.classList.remove(animation);
                listItem.classList.remove('hide-children');
                callback();
            }, 950);
        },

        // Remove animation for task deletion.
        remove: function (listItem, callback) {
            listItem.classList.add('animation-remove');
            listItem.classList.add('hide-children');

            setTimeout(function () {
                callback();
            }, 750);
        }
    },

};
