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
const { Module } = require('module');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { GitUrl, GitUtils } = require('@adobe/helix-shared');
const DEFAULT_PKG_JSON = require('./default-package.json');

const DEFAULT_CONFIG = path.resolve(__dirname, 'default-config.yaml');

class ConfigUtils {
  /**
   * Returns a new default config
   * @param {String} dir The working directory to use (optional)
   */
  static async createDefaultConfig(dir) {
    const source = await fs.readFile(DEFAULT_CONFIG, 'utf8');
    const origin = new GitUrl(GitUtils.getOrigin(dir) || 'http://localhost/local/default.git');
    return source.replace(/"\$CURRENT_ORIGIN"/g, `"${origin.toString()}"`);
  }

  /**
   * Writes a `package.json` to the specified directory.
   * @param {String} dir The working directory
   */
  static async createDefaultPackageJson(dir) {
    const pkgJson = Object.assign({}, DEFAULT_PKG_JSON);
    pkgJson.name = path.basename(dir);

    const origin = GitUtils.getOrigin(dir);
    if (origin) {
      pkgJson.repository = {
        type: 'git',
        url: origin,
      };
    }
    return fs.writeJson(path.resolve(dir, 'package.json'), pkgJson, { spaces: 2 });
  }

  /**
   * Resolves helix-pipeline and optionally installs it if required.
   *
   * @param dir
   * @param logger
   * @param install
   * @returns {string}
   */
  static async resolveHelixPipeline(logger, dir) {
    console.log(require.main);
    // we need to ensure the project local node_modules are respected during resolve
    const paths = module.paths.concat([path.resolve(dir, 'node_modules')]);
    try {
      const p = require.resolve('@adobe/helix-pipeline', { paths });
      logger.debug(`Helix pipeline resolved to ${p}`);
      return p;
    } catch (e) {
      // ignore
    }

    return;
    // check if dir has package.json
    const pkgJson = path.resolve(dir, 'package.json');
    if (await fs.pathExists(pkgJson)) {
      const json = await fs.readJson(pkgJson);
      if (json.dependencies && json.dependencies['@adobe/helix-pipeline']) {
        logger.error(`No @adobe/helix-pipeline found. Did forget to run ${chalk.grey('npm install')} ?`);
        throw Error();
      }
      logger.error(`No @adobe/helix-pipeline found. Please add it as dependency to your project with ${chalk.grey('npm add @adobe/helix-pipeline')}`);
      throw Error();
    }
  }
}

module.exports = ConfigUtils;
