# moocRP
Research platform for University of California, Berkeley researchers built by Kevin Kao in collaboration with Professor Zachary Pardos.

Built on Node.js server with Sails.js framework for an MVC architecture. Python/Bash scripts and D3 visualizations mixed in.

## Author
Kevin Kao

## Dependencies
* Node.js ~0.10.25
* npm ~1.4.23
* Sails.js 0.10.1

## Setup Instructions
After cloning this repository, the file structure setup should be in this format:

````
/baseFolder
---- /moocRP (web application cloned from Github)
-------- /api
-------- /assets
------------ /scaffolds
---------------- d3_scaffold.ejs
---------------- [other_scaffolds]
------------ /visualizations
---------------- /scaffolded
-------------------- /d3
-------------------- /[other types]
-------- ...
-------- /logs
-------- /bin
------------ setup.sh [setup script to create directory structure]
---- /datasets
-------- /non_pii
-------- /pii
---- /visualizations
-------- /tmp
-------- /archives
````

Run the setup.sh script from the moocRP folder:
````
sudo sh bin/setup.sh
````

Then, we need to install all npm package dependencies:
````
sudo npm install
````

To launch the application, simply run:
````
sails lift
````

To run the application in production continuously, we use the ````forever```` package:
````
forever start app.js
````

## Releases
v0.0.3 - first version with working request/download system, visualization upload system, user management ui

v0.0.2a - alpha version that replaced login system with Berkeley's CAS authentication

v0.0.1a - alpha version with working login/verification system

## Bugs

## Roadmap

## License
MIT