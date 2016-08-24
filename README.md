# Media center app

Aim of the project : build a media center on the top of nodejs for raspberry pi.

## Install
````npm install````

## Run
Run
````forever -v -d -w start app.js````
Or
````NODE_ENV=dev node app.js````

Stop
````forever stopall````

Start mongodb
````mongod --config /usr/local/etc/mongod.conf````

Set your env config in
````env.json````

Launch vlc api (unused for now)
````/Applications/VLC.app/Contents/MacOS/VLC -I http --http-password phabos````
