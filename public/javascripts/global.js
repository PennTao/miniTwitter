//public/javascripts/global.js

$(document).ready(function(){
    $('#post h2 p').on('click', 'small.deletepost', deleteUser);
   
});
function deleteUser(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {
        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/delete/' + $(this).attr('rel')
        }).done(function (response) {

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};