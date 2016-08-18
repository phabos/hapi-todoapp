# App to do test
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
