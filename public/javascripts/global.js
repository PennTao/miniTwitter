//public/javascripts/global.js

$(document).ready(function(){
    $('#post h2 small').on('click', 'a.deletepost', deletePost);
   
});
function deletePost(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this message?');

    // Check and make sure the user confirmed
    if (confirmation === true) {
        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/u/'+ $(this).attr('user')+'/delete/' + $(this).attr('rel')
        }).done(function (res) {

            // Check for a successful (blank) response
            if (res.msg === '') {
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