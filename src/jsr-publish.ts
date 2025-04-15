import {setFailed, startGroup, endGroup} from '@actions/core';
import {type Inputs} from './inputs.js';
import {env} from 'node:process';
import {x} from 'tinyexec';
import {readFileSync} from 'node:fs';
import path from 'node:path';

interface PackageJson {
  version?: string;
}

async function readPackageJson(
  root: string,
  filePath: string
): Promise<PackageJson | null> {
  try {
    const contents = readFileSync(path.join(root, filePath), 'utf-8');
    return JSON.parse(contents);
  } catch {
    return null;
  }
}

async function runJsrPublish(inputs: Inputs): Promise<number | undefined> {
  const args: string[] = ['publish'];

  if (inputs.dryRun) {
    args.push('--dry-run');
  }

  const {GITHUB_WORKSPACE} = env;

  if (!GITHUB_WORKSPACE) {
    throw new Error(`No workspace was found.
Please ensure you run actions/checkout before this action. Otherwise, please
specify the version in the action configuration.`);
  }

  if (inputs.usePackageJsonVersion) {
    const packageJson = await readPackageJson(
      GITHUB_WORKSPACE,
      inputs.packageJsonFile
    );

    if (packageJson === null) {
      throw new Error(`No package.json was found.
Please ensure one exists when usePackageJsonVersion is set to true, or set
the packageJsonFile option to the correct path.`);
    }

    if (!packageJson.version || typeof packageJson.version !== 'string') {
      throw new Error(`package.json had no version. In order to use the
usePackageJsonVersion option, the package.json must have a version property.`);
    }

    args.push(`--set-version=${packageJson.version}`);
  }

  const result = await x('jsr', args, {
    throwOnError: false,
    nodeOptions: {
      stdio: ['pipe', 'inherit', 'inherit'],
      cwd: GITHUB_WORKSPACE
    }
  });

  return result.exitCode;
}

export async function jsrPublish(inputs: Inputs): Promise<void> {
  startGroup('Publishing to JSR...');
  const status = await runJsrPublish(inputs);
  endGroup();
  if (status) {
    setFailed(`Something went wrong, publish exited with code ${status}`);
  }
}
