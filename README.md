# FinalProject

## Installation:
Clone the repository in the local pc. 

Install supporting packages for the application
```bash
# go inside the implementation directory
cd implementation

# install packages
npm install
```

Now, go inside both front-end and back-end repository and install the packages.
```bash
# go inside the front-end directory, from implementation
cd front-end

# install packages
npm install
```
```bash
# go inside the back-end directory, from implementation
cd back-end

# install packages
npm install
```


Finally, create .env file in both front-end and back-end
The content for the front-end .env file is as follows:
```bash
# React port
REACT_APP_API_URL=http://localhost:3000
DISABLE_ESLINT_PLUGIN=true
```
The content for the back-end .env file is as follows:

```bash
# Database
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASS=
DB_AUTH_SOURCE=

# Express
HTTP_PORT=3000

# SessionStore
SESSION_DB_NAME=
SESSION_SECRET=

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

```

## Running the application:

To run the program, we will go to both back-end and front-end folder and run the command 

```bash
# go inside the front-end directory, from implementation
cd front-end

# starts the front-end
npm start
```
```bash
# go inside the back-end directory, from implementation
cd back-end

# starts the back-end
npm start
```


You might encounter a port problems. We set-up the backend and front-end to run on the same port.
Type ‘Y’ on your keyboard and hit enter.

You will be given a url similar to this 
```
http://localhost:3001
```

Copy the url and paste it in your browser to load up the program.
