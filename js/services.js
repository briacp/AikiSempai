/***********************************************************************************
 * App Services. This contains the logic of the application organised in modules/objects. *
 ***********************************************************************************/

myApp.services = {

    video: {
        play: function(videoId, title) {
            var youtube = myApp.ytPlayer;

            $("#modal-yt").show();

            console.log("Loading video [" + videoId + "]");

            youtube.loadVideoById(videoId);
        },
        close: function() {
            myApp.ytPlayer.stopVideo();
            $("#modal-yt").hide();
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
