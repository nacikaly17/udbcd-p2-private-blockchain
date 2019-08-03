## Project 2: Building Your Own Private Blockchain  ##
#### Udacity Blockchain Developer Nanodegree Program  ####
This project is connected to the _Blockchain Developer Nanodegree Program_ course by **Udacity**.
For this project, we’ll need to validate the blockchain dataset by converting the current validation functions with chain array to LevelDB

### Environment ###
This program requires **node.js** and **npm** program envirenment 

### Install ###
All project files are delivered as a zip file 
```
    project-2.zip
```
After unzip this file you will get a folder project-2 with following files:
* project-2
    * Block.js
    * SimpleChain.js
    * SimpleChain.test.js
    * ValidateChain.test.js
    * package.json
    * README.md

Change to the folder, where you have unzipped  **project-2.zip**
and run following command:
```
    npm install
```
It installs required JavaScript libraries.

### Run the application ###,10);
```
    node SimpleChain.test.js  
    node ValidateChain.test.js  
```
### Functionality ###
First run of this program , creates 3 blocks. 
Then each call creates 2 additional block ( max = 10 ).
Here are the list of main functionality of this program
  - Requirement 1 : Create test blocks within the LevelDB chain.
  - Requirement 2 : Test the methods implemented.


