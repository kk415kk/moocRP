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

## Visualization Upload Format
Note that all visualizations must use the field "<%= dataset %>" where they would normally pass in a text version of the dataset. There must be a "main.html" file inside the base of the uploaded archive that already has links to relevant scripts and additional files built into it.

## Current Release
v0.0.3

## Changelog
v0.0.3 - First version with working request/download system, visualization upload system, user management ui

v0.0.2a - Alpha version that replaced login system with Berkeley's CAS authentication

v0.0.1a - Alpha version with working login/verification system

## Completed Features
* SSL integration
* Node.js CAS client (login system)
* Secure dataset request and download system
* Visualization upload and approval system
* Administration controls
* UI theme

## Bugs

## Roadmap
* Add "Reports" messaging system for managing bug handling/error messages
* Integrate JIRA ticketing system for open source release and collaboration
* Add support for hooking datasets to the visualization upload system
* Strip out CAS client to package into npm package
* Add profile updates for users
* Add support for sharing research papers
* Add support for running pre-processing scripts on datasets before visualizing (i.e. machine learning code)
* Create setup.sh to create directory structure
* Investigate and implement automatic code review security
* Begin populating Github wiki for instructions on use
* Perform penetration testing and security checks
* Scale/stress testing + test suites need to be developed
* Add features to star/"bookmark" visualizations
* Implement alternative login system for non-CAS institutions

## License
MIT