function setupGravitarOnCommentEmailField() {
    var field = document.getElementById('commentNewEmail');
    field.addEventListener('change', function(event) {
        var value = field.value;
        var avatar = '';
        if (!value) {
            // default empty gravitar image
            avatar = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y&s=96';
        } else if (value.indexOf('@') === 0) {
            avatar = getTwitterAvatar(value);
        } else if (value.indexOf('@') > 0) {
            avatar = getGravitar(value);
        } else {
            avatar = getGitHubAvatar(value);
        }
        var avatarField = document.getElementById('avatarInput');
        avatarField.value = avatar;

        var avatarImage = document.getElementById('avatarImage');
        avatarImage.src = avatar;
    });
}

// https://en.gravatar.com/site/implement/images/
function getGravitar(email) {
    return 'https://www.gravatar.com/avatar/' + md5(email) + "s=96";
}

// https://stackoverflow.com/questions/18381710/building-twitter-profile-image-url-with-twitter-user-id
function getTwitterAvatar(user) {
    return 'https://twitter.com/' + user + '/profile_image?size=original';
}

// https://stackoverflow.com/questions/22932422/get-github-avatar-from-email-or-name
function getGitHubAvatar(user) {
    return 'https://github.com/' + user + '.png';
}

function CommentFormSubmitter() {
    var self = this;
    this.confirmModal = new bootstrap.Modal(document.getElementById('commentFormConfirmModal'), {
        backdrop: 'static',
        Keyboard: false
    });
    this.successToast = new bootstrap.Toast(document.getElementById('commentFormSuccessToast'), {

    });
    this.failureToast = new bootstrap.Toast(document.getElementById('commentFormFailureToast'), {

    });
    this.confirmSubmission = function() {
        // don't do anything until there's some comment text
        if (document.getElementById('commentsNewComment').value) {
            self.confirmModal.show();
        }
    };
    this.submitComment = function() {
        var params = new URLSearchParams();
        params.set('comment-site', document.getElementById('commentNewCommentSite').value);
        params.set('post_id', document.getElementById('commentNewPostId').value);
        params.set('author', document.getElementById('commentNewName').value);
        params.set('avatar', document.getElementById('avatarInput').value);
        params.set('message', document.getElementById('commentsNewComment').value);
        // show the spinner
        var spinner = document.getElementById('submitSpinner');
        spinner.style.display = 'inline-block';
        // disable the close/submit buttons
        var submit = document.getElementById('commentConfirmSubmit');
        submit.disabled = true;
        var close = document.getElementById('commentFormConfirmModalCloseButton');
        close.disabled = true;
        fetch('https://func-dyn4j.azurewebsites.net/api/PostComment', {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params,
            method: 'POST',
        }).then(function(response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            // clear the form fields
            document.getElementById('commentNewName').value = '';
            document.getElementById('commentNewEmail').value = '';
            document.getElementById('avatarInput').value = '';
            document.getElementById('commentsNewComment').value = '';
            // show the success toast
            self.successToast.show();
        }).catch(function(e) {
            // show the failure toast
            self.failureToast.show();
        }).then(function() {
            // clean up state
            spinner.style.display = 'none';
            submit.disabled = false;
            close.disabled = false;
            self.confirmModal.hide();
        });
    };
}

function updateSubmitEnableState() {
    if (document.getElementById('commentsNewComment').value &&
        document.getElementById('commentNewName').value) {
        commentSubmitButton.disabled = false;
    } else {
        commentSubmitButton.disabled = true;
    }
}

addEventListener('load', function() {
    setupGravitarOnCommentEmailField();

    var submitter = new CommentFormSubmitter();

    var commentSubmitButton = document.getElementById('commentNewSubmit');
    commentSubmitButton.addEventListener('click', function() {
        submitter.confirmSubmission();
    });

    var messageField = document.getElementById('commentsNewComment');
    messageField.addEventListener('keyup', updateSubmitEnableState);
    var nameField = document.getElementById('commentNewName');
    messageField.addEventListener('keyup', updateSubmitEnableState);

    var commentConfirmSubmitButton = document.getElementById('commentConfirmSubmit');
    commentConfirmSubmitButton.addEventListener('click', function() {
        submitter.submitComment();
    });
});