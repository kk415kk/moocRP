# moocRP
Research platform for University of California, Berkeley researchers built by Kevin Kao in collaboration with Professor Zachary Pardos.

Built on Node.js server with Sails.js framework for an MVC architecture. Python/Bash scripts and D3 visualizations mixed in.

## Author
Kevin Kao

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
-------- setup.sh [setup script to create directory structure]
---- /datasets
-------- /non_pii
-------- /pii
---- /visualizations
-------- /tmp
-------- /archives
````

## Releases
v0.0.3 - first version with working request/download system, visualization upload system, user management ui

v0.0.2a - alpha version that replaced login system with Berkeley's CAS authentication

v0.0.1a - alpha version with working login/verification system

## License
MIT