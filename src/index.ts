import {setFailed} from '@actions/core';
import {getInputs} from './inputs.js';
import {jsrPublish} from './jsr-publish.js';

async function main() {
  const inputs = getInputs();
  await jsrPublish(inputs);
}

main().catch((error) => {
  console.error(error);
  setFailed(error);
});
