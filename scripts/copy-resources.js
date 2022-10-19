'use strict';
const fs = require('fs');
const fsExtra = require('fs-extra');
const ignoredTypes= ['ts'];

const fileFilter = (src, dest) => {
   
  if (fs.lstatSync(src).isDirectory()) {
    console.log(`copyResources: Copying directory [${src}] to [${dest}]`); 
    return true;
  }

  if (ignoredTypes.indexOf(src.split('.').pop().toLowerCase()) == -1) {
    // not found and should copy
    console.log(`copyResources: Copying file [${src}] to [${dest}]`); 
    return true;
  }

  // default - do not copy
  console.log(`copyResources: Skipping [${src}] and [${dest}]`);
  return false
}

const copyResources = async (startDir) => {

  console.log('*********************************************************');
	console.log('*       COPYING OTHER FILES TO DIST AREA.               *');
	console.log('* GOAL: ALLOW PACKAGING OF RAW .JS FILES AND RESOURCES. *');
	console.log('*********************************************************');

  console.log(`copyResources: Starting at [${startDir}]`); 
  console.log(`copyResources: ignoredTypes=[${ignoredTypes}]`);

	fsExtra.copySync(startDir, 'bin/'.concat(startDir), { 'filter': fileFilter });
	//await fsExtra.copy(startDir, 'bin/'.concat(startDir), { 'filter': fileFilter });
  const msg = `Done with [${startDir}]`;
  console.log(`copyResources: ${msg}`); 
  return msg;  
}

module.exports = { copyResources }

// execute with command line param or default id not provided
if (require.main === module) {
  copyResources(process.argv[2] || './src')
}