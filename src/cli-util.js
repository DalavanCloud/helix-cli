/*
 * Copyright 2018 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const readline = require('readline');
const chalk = require('chalk');
const packagejson = require('../package.json');

function getVersion() {
  return packagejson.version;
}

const spinnerFrames = process.platform === 'win32'
  ? ['-', '\\', '|', '/']
  : ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

const createSpinner = (msg) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on('SIGINT', () => {
    // ensure we quit after ctrl+c and show cursor again
    process.stdout.write('\u001b[?25h');
    process.exit(-1);
  });

  return {
    i: 0,
    running: false,
    s: process.stdout,
    written: false,

    run() {
      if (this.running) {
        if (msg) {
          this.s.write(`${chalk.cyan(spinnerFrames[this.i])} ${msg}`);
          this.s.cursorTo(0);
        } else {
          this.s.write(chalk.cyan(spinnerFrames[this.i]));
          this.s.moveCursor(-1);
        }
        this.written = true;
        this.i = (this.i + 1) % spinnerFrames.length;
        setTimeout(this.run.bind(this), 100);
      }
    },

    start() {
      if (!this.s.moveCursor) {
        return this;
      }
      this.s.write('\u001b[?25l');
      this.running = true;
      this.run();
      return this;
    },

    stop() {
      this.s.write('\u001b[?25h');
      this.running = false;
      if (this.written) {
        this.s.clearLine(1);
      }
      rl.close();
      return this;
    },
  };
};

async function prompt(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

module.exports = {
  getVersion,
  createSpinner,
  prompt,
};
