# MobileCaddy Angular Build App

This application is the dev/test environment for the _mobilecaddy-angular_ component library module.

The `mobilecaddy-angular` folder contains all assets for the library, the rest of the app is merely a means to see it in action

Packaging is done (presently) wih [ng-packagr](https://github.com/dherges/ng-packagr), and this repo is closely based upon the [example repo here](https://github.com/dherges/ng-packaged). There are some changes, but this was the main resource.

## Prerequisites

* Node v8.5.0+
* MobileCaddy CLI 2.2+

## Getting Started

There are 2 ways to get started - the best is to use the MobileCaddy CLI, and the other is more manual.

* Clone, or download and unzip, this repo, and `cd` into the dir

* Install dependencies

```
npm install
```

* Run MobileCaddy setup script

```
npm run mobilecaddy setup
```

## Running the app in CodeFlow

```
mobilecaddy serve
```

## To create a new bundle for publishing

* In the root directory

```
npm run packagr
```

This will create a `dist/mobilecaddy-angular` folder.

### To bundle up in a zip for local install

```
cd dist/mobilecaddy-angular
npm pack
```
