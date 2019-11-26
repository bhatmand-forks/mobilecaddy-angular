# MobileCaddy Angular Build App

This application is the dev/test environment for the _mobilecaddy-angular_ component library module.

The `mobilecaddy-angular` folder contains all assets for the library, the rest of the code under the `./src` directory is the _Dev_ app, which is a means to see it the _mobilecaddy-angular_ module in action during development.

Packaging is done (presently) wih [ng-packagr](https://github.com/dherges/ng-packagr), and this repo is closely based upon the [example repo here](https://github.com/dherges/ng-packaged). There are some changes, but this was the main resource.

## Prerequisites

- Node v10.15.3+
- MobileCaddy CLI 2.2+

## Getting Started

There are 2 ways to get started - the best is to use the MobileCaddy CLI, and the other is more manual.

- Clone, or download and unzip, this repo, and `cd` into the dir

- Install dependencies

```
npm install
```

- Run MobileCaddy setup script

```
npm run mobilecaddy setup
```

## Running the app in CodeFlow

```
mobilecaddy serve
```

## Adding a new Component to mobileaddy-angular

All contents to be published along with the _mobilecaddy-angular_ module exist within the `./mobilecaddy-angular/src` directory.

You should be able to create new components, Ionic3 pages, providers, etc, within the `src` dir as with any Ionic 3 application, though to then expose these they should be listed within the `~./mobilecaddy-angular/lib.modules.ts` and also the `~./mobilecaddy-angular/public_api.ts`.

### Using components within the _Dev_ app

During dev the assets within the `./mobilecaddy-angular` dir can be used by the _Dev_ app. The only thing to note is that the references to the components etc should be done with relative paths; for example

```
import { MobileCaddySyncService } from '../../../mobilecaddy-angular/src/providers/mobilecaddy-sync-service/mobilecaddy
```

## To create a new bundle for publishing

- In the root directory

```
npm run packagr
```

This will create a `dist/mobilecaddy-angular` folder.

### To bundle up in a zip for local install

```
cd dist/mobilecaddy-angular
npm pack
```

To use this in a local project you can set the _package.json_ to look something like this;

```
"mobilecaddy-angular": "file:../mc-angular-tmp/dist/mobilecaddy-angular/mobilecaddy-angular-0.0.1.tgz",
```
