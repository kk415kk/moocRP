[Back to README](../README.md)

Installation
================

## Dependencies

**Ubuntu Instructions**

* Install ````git````: ````sudo apt-get install git````
* Install Node.js ~0.10.25, minimum 0.10.x:

    ````
    sudo apt-get install python-software-properties
    sudo apt-add-repository ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs
    ````

* Install npm (Node.js package manager) ~1.3.10:

    Use ````aptitude```` to install npm and downgrade Node.js through the prompt if conflicts occur.
    ````
    sudo apt-get aptitude
    sudo aptitude install npm 
    ````

* Install MySQL server: ````sudo apt-get install mysql-server-5.6````
* Install Sails.js ~0.10.5, minimum 0.10.x: ````sudo npm install -g sails````

## Setup Instructions
First, create a new folder called moocRP_base to clone this repository to:
````
mkdir moocRP_base
cd moocRP_base
git clone git@github.com:kk415kk/moocRP.git
````

After cloning this repository, run the setup script to create the correct directory structure. Enter in the correct MySQL user and password when prompted. This will create the database as well.
````
./bin/setup.sh
````

Once the setup script is run, the file structure setup should be in this format:
````
/moocRP_base
---- /moocRP (web application cloned from Github)
-------- /api
-------- /assets
------------ /scaffolds
------------ /analytics
-------- ...
-------- /logs
-------- /bin
------------ setup.sh [setup script to create directory structure]
---- /datasets
-------- /non_pii
-------- /pii
-------- /extracted
-------- /encrypted
---- /visualizations
-------- /tmp
-------- /archives
````

Then, we need to install all npm package dependencies before launch:
````
sudo npm install
````

To launch the application, simply run:
````
sails lift
````