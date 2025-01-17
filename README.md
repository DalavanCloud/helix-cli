# Helix Command Line Interface (`hlx`)

## Status

[![codecov](https://img.shields.io/codecov/c/github/adobe/helix-cli.svg)](https://codecov.io/gh/adobe/helix-cli)
[![CircleCI](https://img.shields.io/circleci/project/github/adobe/helix-cli/master.svg)](https://circleci.com/gh/adobe/helix-cli/tree/master)
[![GitHub license](https://img.shields.io/github/license/adobe/helix-cli.svg)](https://github.com/adobe/helix-cli/blob/master/LICENSE.txt)
[![GitHub issues](https://img.shields.io/github/issues/adobe/helix-cli.svg)](https://github.com/adobe/helix-cli/issues)
[![Greenkeeper badge](https://badges.greenkeeper.io/adobe/helix-cli.svg)](https://greenkeeper.io/)
[![LGTM Code Quality Grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/adobe/helix-cli.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/adobe/helix-cli)

The Helix Command Line Interface allows web developers to create, develop, and deploy digital experiences using Project Helix

## Installation

Install `hlx` as a global command. You need Node 8 or newer.

```bash
$ npm install -g @adobe/helix-cli
```

Alternatively, you can install the latest binary version of `hlx` (not requiring Node) via `curl`
:
```bash
$ curl -sL http://www.project-helix.io/cli.sh | sh
```

## Quick Start

```
$ hlx --help
hlx <command>

Commands:
  hlx demo <name> [dir]  Create example helix project.
  hlx up [files...]      Run a Helix development server
  hlx build [files..]    Compile the template functions and build package
  hlx package            Create Adobe I/O runtime packages
  hlx deploy             Deploy packaged functions to Adobe I/O runtime
  hlx perf               Test performance
  hlx publish            Activate strains in the Fastly CDN and publish the site
  hlx clean              Remove generated files and caches.
  hlx completion         generate bash completion script

Options:
  --version    Show version number                                     [boolean]
  --log-file   Log file (use "-" for stdout)              [array] [default: "-"]
  --log-level  Log level
        [string] [choices: "silly", "debug", "verbose", "info", "warn", "error"]
                                                               [default: "info"]
  --help       Show help                                               [boolean]

for more information, find our manual at https://github.com/adobe/helix-cli
```

## Setting up a project

```
$ hlx demo <my-cool-project>
```

## Starting development

```
$ cd <my-cool-project>
$ hlx up
```

Just change contents in your project directory and reload `http://localhost:3000` to see the results.

## (Optional) Build artifacts

```
# In <my-cool-project>
$ hlx build
```

## (Optional) Deploy to Adobe I/O Runtime

### Automatic Deployment

By default, Helix will set up automated deployment that deploys whenever a new commit has been pushed to your GitHub code repository. In order to do so, you need a [CircleCI](https://circleci.com) account and generate a [personal API Token](https://circleci.com/account/api).

```
# In <my-cool-project>
$ hlx deploy \
  --circleci-auth <personal-api-token> \
  --wsk-namespace <your-namespace> \
  --wsk-auth <your-key> \
  --fastly-auth <key> \
  --fastly-namespace <serviceid>
```

As always, you can keep all parameters in `HLX_CIRCLECI_AUTH`, `HLX_WSK_AUTH`, and `HLX_FASTLY_AUTH` environment variables if you don't want them in your `.bash_history`.

### One-Shot Deployment

Alternatively, you can also perform a one-shot deployment like this:

```
# In <my-cool-project>
$ hlx deploy --wsk-namespace <your-namespace> --wsk-auth <your-key>
[==================================================] analyzing 0.0s
[==================================================] packaging 0.0s
✅  packaging completed  
[==================================================] deploying 0.0s
✅  deployment completed
```

Instead of passing `--wsk-auth` as a command line option, you can also set the `HLX_WSK_AUTH` environment variable.

## (Optional) Publish your Site

```
# In <my-cool-project>
$ hlx publish --fastly-auth <key> --fastly-namespace <serviceid>
Publishing [========================================----------]  4.1s
✅  All strains have been published and version 89 is now online.
```

### Passing Request Parameters

Every request parameter is a potential cache-buster and given that modern web application practices liberally append request parameters for tracking purposes or to manage state for client-side applications, **Helix filters out all request parameters by default**.

This means, the client side of your application will still be able to access request parameters, but your server(less)-side scripts and templates will not see any parameters.

If you need to pass request parameters, you can whitelist the parameters you need using the `strain.params` configuration. The value of `params` is an array of whitelisted parameter names.

```yaml
strains:
  default:
    code: https://github.com/adobe/project-helix.io.git#master
    content: https://github.com/adobe/project-helix.io.git#master
    static: https://github.com/adobe/project-helix.io.git/htdocs#master
    params:
      - foo
      - bar
```

In the example above, the parameters `foo` and `bar` have been enabled. A request made to `https://www.example.com/index.html?foo=here&bar=there&baz=everywhere` will enable your application to read the `foo` and `bar` parameters. The `baz` parameter and all other parameters will be filtered out.

Every allowed parameter value will affect the caching of your site in the CDN.

#### Helix-Internal Request Parameters

All request parameters starting with `hlx_` will be passed through to the action, so that they can be used for Helix-internal purposes.

### Directory Index

The default behavior for directory indexes is to load `index.html` when requesting a path ending with `/`,
so that `/foo/bar/` becomes `/foo/bar/index.html`. This setting can be overwritten in `helix-config.yaml`
by adding an `index` property:

```yaml
strains:
  default:
    code: https://github.com/adobe/project-helix.io.git#master
    content: https://github.com/adobe/project-helix.io.git#master
    static: https://github.com/adobe/project-helix.io.git/htdocs#master
    directoryIndex: README.html
```

### Static Content Handling

Static content is delivered from the `htdocs` directory of the _code_ repository of the Helix project:

```yaml
strains:
  default:
    code: https://github.com/adobe/project-helix.io.git#master
    content: https://github.com/adobe/project-helix.io.git#master
    static: https://github.com/adobe/project-helix.io.git/htdocs#master
```

The same core configuration options (`repo`, `ref`, `root`, and `owner`) are supported for `static` as for `content`. 

After your next deployment with `hlx publish`, all static content will be served out of the 
directory `htdocs`. None of this will be visible in the URL, so that no visitor will ever see 
_htdocs_ in the URL. `https://example.com/favico.ico` would be served from `$REPO/htdocs/favico.ico`.

## Matching Strains to URLs

You can define a `url` for each `strain`. This property will make sure that only requests made
to this base URL will be mapped to the following URL, enabling patterns like having a production
instance on `www.*` and a development instance on `dev.*`.

An example configuration could look like this:

```yaml
strains:
  default:
    code: https://github.com/adobe/project-helix.io.git#master
    content: https://github.com/adobe/project-helix.io.git#master
    static: https://github.com/adobe/project-helix.io.git/htdocs#master
    url: https://www.primordialsoup.life

  develop:
    code: https://github.com/adobe/project-helix.io.git#dev
    content: https://github.com/adobe/project-helix.io.git#master
    static: https://github.com/adobe/project-helix.io.git/htdocs#master
    url: https://dev.primordialsoup.life/develop/
```

## Mixing old and new Content

Helix can run old and new versions of the same site side by side, and even intermixed. This allows you to gradually upgrade to using Helix. 

If you want to serve content from another origin server, just add the property `origin` to any strain. `code`, `content`, `directoryIndex`, and most other properties will then be ignored, as all content for that strain will be retrieved from the URL specified in `origin`.

You are still able to set strain `conditions` or assign traffic to a strain based on the `url` property. 

```yaml
strains:
  default:
    code: https://github.com/adobe/project-helix.io.git#master
    content: https://github.com/adobe/project-helix.io.git#master
    static: https://github.com/adobe/project-helix.io.git/htdocs#master
  oldcontent:
    origin: https://www.adobe.io
    url: https://www.primordialsoup.life/content/
  proxy:
    origin: https://www.adobe.io
    condition: req.http.host == "proxy.primordialsoup.life"
```

In the example above, there are three strains: `default` serves content from `www.primordialsoup.life` using Helix. But all URLs that start with `https://www.primordialsoup.life/content/` will be served from `www.adobe.io`. This means an image that is referenced as `/content/example.png` will be served from the Adobe I/O website.

Finally, on `proxy.primordialsoup.life`, all content of the old site is being served. This allows you to easily switch back to an old configuration.


## (Recommended) Performance Testing

You can (and should) test the performance of your deployed site by running `hlx perf`.

The default test will test the entry page of every strain (using the `url`) property, if defined. Additional known URLs can be configured for each strain using the key `urls` (expects an array of URLs).

The default test will run from a mid-range mobile phone (Motorola Moto G4), using a regular 3G connection from London, UK. It makes sure that the Lighthouse Accessibility Score and the Lighthouse Performance Score of your site is at least 80.

You can set custom performance budgets and change the performance condition for each strain using the `perf` property. If a strain has no `perf` measurement configured, the `perf` configuration of the default strain will be used.

An example performance configuration might look like this:

```yaml
strains:
  default:
    code: https://github.com/adobe/project-helix.io.git#master
    content: https://github.com/adobe/project-helix.io.git#master
    static: https://github.com/adobe/project-helix.io.git/htdocs#master
    url: https://www.primordialsoup.life
    urls:
      - https://www.primordialsoup.life/README.html
    perf:
      device: iPhone8
      connection: good3G
      location: Sydney
      visually_complete_85: 1500
      lighthouse-best-practices-score: 80
```

If the site does not meet all performance criteria you have defined, `hlx perf` will exit with a non-null exit code (the exit code equals the number of failed tests). This allows you to use `hlx perf` as a gating condition in a CI/CD workflow.

### Testing Environment

* Possible `device` values are:
  * `MotorolaMotoG4`
  * `iPhone5`
  * `iPhone6`
  * `iPhone6Plus`
  * `iPhone7`
  * `iPhone8`
  * `Nexus5X`
  * `Nexus6P`
  * `GalaxyS5`
  * `iPad`
  * `iPadPro`
* Possible `connection` values are: 
  * `regular2G`
  * `good2G`
  * `slow3G`
  * `regular3G`
  * `good3G`
  * `emergingMarkets`
  * `regular4G`
  * `LTE`
  * `dsl`
  * `wifi`
  * `cable`
* Possible `location` values are:
  * `NorthVirginia`
  * `Frankfurt`
  * `Sydney`
  * `Ohio`
  * `California`
  * `Oregon`
  * `Canada`
  * `Ireland`
  * `Tokyo`
  * `Seoul`
  * `Singapore`
  * `Mumbai`
  * `SaoPaulo`
  * `London`

### Performance Metrics

You can set performance budgets against following scores (more is better) and metrics (less is better):

* `speed_index`: Speed Index
* `visually_complete`: Visually Complete
* `visually_complete_85`: 85% Visually Complete
* `lighthouse-seo-score`: Lighthouse SEO Score
* `lighthouse-best-practices-score`: Lighthouse Best Practices Score
* `lighthouse-accessibility-score`: Lighthouse Accessibility Score
* `lighthouse-performance-score`: Lighthouse Performance Score
* `lighthouse-pwa-score`: Lighthouse Progressive Web App Score
* `js-parse-compile`: JS Parse & Compile
* `time-to-first-byte`: Time to First Byte
* `first-contentful-paint`: First Contentful Paint
* `first-meaningful-paint`: First Meaningful Paint
* `firstRender`: First Paint
* `dom-size`: DOM Element Count
* `estimated-input-latency`: Estimated input latency
* `consistently-interactive`: Time to Interactive
* `first-interactive`: First CPU Idle
* `html_body_size_in_bytes`: Total HTML size in bytes
* `html_size_in_bytes`: Total HTML transferred
* `page_wait_timing`: Response time
* `page_size_in_bytes`: Total Page transferred
* `page_body_size_in_bytes`: Total Page size in bytes
* `asset_count`: Number of requests
* `onload`: onLoad
* `oncontentload`: onContentLoad

#### Structured (JUnit) Performance Reporting

By calling `hlx perf` with the option `--junit <file>`, the performance test 
results will be reported in JUnit-format, which makes it possible to integrate
performance result reporting with the CI system performing an automated deployment.

For `hlx demo full`, a full CI configuration is created that will run a performance
test after a completed deployment, report the per-metric results and mark the build
as failed in case metrics are not met.

# Developing Helix CLI

## Testing

You can use `npm run check` to run the tests and check whether your code adheres
to the helix-cli coding style.
