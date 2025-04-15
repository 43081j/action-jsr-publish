import {getBooleanInput, getInput} from '@actions/core';

export interface Inputs {
  readonly version: string;
  readonly packageJsonFile: string;
  readonly usePackageJsonVersion: boolean;
  readonly dryRun: boolean;
}

export const getInputs = (): Inputs => ({
  version: getInput('version'),
  packageJsonFile: getInput('package_json_file'),
  usePackageJsonVersion: getBooleanInput('use_package_json_version'),
  dryRun: getBooleanInput('dry_run')
});
