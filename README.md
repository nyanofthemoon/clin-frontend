# CLIN Frontend

### Available Scripts

* `pnpm start` launches the app in development mode at [http://localhost:3000](http://localhost:3000)
* `pnpm test` launches the test runner in the interactive watch mode
* `pnpm run serve` serves the static assets from the `build` directory
* `pnpm run build` builds the app into the `build` directory
  * compatible with [these browsers](https://browserl.ist/?q=last+3+version%2C+not+op_mini+all%2C+not+%3C+1%25).<br>
  * bundles React in production mode and optimizes the build for the best performance:
    * [Code Splitting](https://facebook.github.io/create-react-app/docs/code-splitting)
    * [Analyzing the Bundle Size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)
    * [Progressive Web App](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)
    * [Advanced Configurations](https://facebook.github.io/create-react-app/docs/advanced-configuration)
    * [Troubleshooting Failures to Minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

### Development Set-up

#### Directly On Your Machine

Install [Redux Devtools Chrome Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
Install Node.js LTS 10.14.1 using [nvm](https://github.com/creationix/nvm/blob/master/README.md) and run
```
cp -p .env.development .env
npm install -g pnpm
pnpm install
pnpm start
```

#### With Docker

Run:

```
cp env.docker.development .env
docker-compose -f docker-compose-docker-local.yml up -d
```

To stop, run:

```
docker-compose -f docker-compose-docker-local.yml down
```

Additionally, if you edited your **/etc/hosts** file to point the **dev.chusj-clin-dev.org** domain to your local, you can edit the following entries in the **.env** file:

```
REACT_APP_AUTH_SERVICE_URL=https://localhost:3000/auth
REACT_APP_PATIENT_SERVICE_URL=https://localhost:4000/patient
REACT_APP_VARIANT_SERVICE_URL=https://localhost:5001/variant
REACT_APP_META_SERVICE_URL=https://localhost:7000/meta
```

To:

```
REACT_APP_AUTH_SERVICE_URL=https://dev.chusj-clin-dev.org:3000/auth
REACT_APP_PATIENT_SERVICE_URL=https://dev.chusj-clin-dev.org:4000/patient
REACT_APP_VARIANT_SERVICE_URL=https://dev.chusj-clin-dev.org:5001/variant
REACT_APP_META_SERVICE_URL=https://dev.chusj-clin-dev.org:7000/meta
```

This may give you a more reliable behavior in some environments.


### Production Set-up

##### Manual Mode

Install Node.js LTS 10.14.1 using [nvm](https://github.com/creationix/nvm/blob/master/README.md) and run
```
cp -p .env.production .env
npm install -g pnpm
pnpm install
pnpm build
pnpm serve
```

##### Docker Mode

`cp -p docker.env .env`

```
#Obtain certificate from letsencrypt
#Copy certificate to sshvolume
##ssh to manager box
#Install sshfs
sudo apt-get install sshfs
##copy certbot to sshvolume and configure
sudo cp -r certbot /home/ubuntu/sshvolume
sudo chown -R ubuntu:root certbot
sudo chmod  -R 0771 certbot
# Create the proxy network to connect all necessary services together
docker network create -d overlay --attachable proxy
# Install on all box sshfs docker volume pluggin
docker plugin install vieux/sshfs DEBUG=1 sshkey.source=/home/ubuntu/.ssh/
# (Optional) Tot test the sshvolume with vieux/sshfs (does not work on macosx)
# Create the volumen sshvolume on all box
docker volume create -d vieux/sshfs -o sshcmd=ubuntu@10.10.0.19:/home/ubuntu/sshvolume/certbot/conf -o allow_other sshvolume
# To Test (does not work on docker for macosx)
docker run -it -v sshvolume:/sshvolume busybox ls /sshvolume
```

###### Local Environment

`
copy docker.env .env
docker-compose up --build`

```Edit docker-compose to comment sshfs docker volume and uncomment local volume```

###### Pushing Changes to Qa/Prod

```
copy docker.env .env
docker-compose build 
docker push localhost:5000/clin-frontend-nginx:latest

docker tag localhost:5000/clin-frontend-nginx:latest localhost:5000/clin-frontend-nginx:1.1.2

docker push localhost:5000/clin-frontend-nginx:1.1.2

docker stack deploy -c docker-compose.yml qaFront
docker service update qaFront_nginx --image localhost:5000/clin-frontend-nginx:1.1.2

```
#### Update a service to another version i.e. (1.1)

```
copy docker.env .env

nano .env -- fix environment
docker-compose build
docker tag localhost:5000/clin-frontend-nginx:latest localhost:5000/clin-frontend-nginx:1.1.2
docker push localhost:5000/clin-frontend-nginx:1.1
docker service update qaFront_nginx --image localhost:5000/clin-frontend-nginx:1.1.2

```
To scale the service up or down...
```
docker service scale qa-frontend_nginx=3
or
use portainer (port 9000)
```