//public/javascripts/global.js

$(document).ready(function(){
    $('#post blockquote small').on('click', 'a.deletepost', deletePost);
   
});
function deletePost(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this message?');

    // Check and make sure the user confirmed
    if (confirmation === true) {
        // If they did, do our delete
        console.log($(this).attr('rel'));
        $.ajax({
            type: 'DELETE',
            url: '/u/' + $(this).attr('user') + '/delete/' + $(this).attr('rel')

        }).done(function (res) {

            // Check for a successful response and redirect to user's page
            if (res.redirectTo && res.msg == 'success') {
                window.location = res.redirectTo;
            }
            else {
                alert('error: ' + res.msg);
            }

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};