# Little Lock

A small password generator that runs entirely in your browser. It has no
dependencies, account, or server component.

## Use it

Open `index.html` in a modern browser. Choose a length and the character types
you want, then select **Generate password**. Use the copy button to copy the
result.

If clipboard access is restricted when opening the file directly, run a local
web server from this folder instead:

```sh
python -m http.server 8000
```

Then visit <http://localhost:8000>.

## A note on privacy and strength

Passwords are created locally with the browser's cryptographically secure
random number generator. They are not sent to a server or saved by the app.
The strength label is an estimate based on the selected character pool and
password length; it does not check whether a password has appeared in a breach
or meets a particular website's rules. Use a different password for each
account, and avoid sharing or screenshotting the generated value.
