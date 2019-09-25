import {runTests} from 'vscode-test';
import {resolveRoot} from '../src/utils/utils';

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = resolveRoot();

    // The path to test runner
    // Passed to --extensionTestsPath
    // const extensionTestsPath = path.resolve(__dirname, './suite/index');

    // test workspace
    const testWorkspace = resolveRoot('test/test-workspace');

    // Download VS Code, unzip it and run the integration test
    await runTests({
      version: '1.38.1',
      extensionDevelopmentPath,
      extensionTestsPath: '',
      launchArgs: [
        testWorkspace,
        '--disable-extensions'
      ]
    });
  } catch (err) {
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main();
