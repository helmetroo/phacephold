# phacephold

**Realtime visual app based on face folding inspired by Aphex Twin's [promotional images for Syro](https://en.wikipedia.org/wiki/Syro#Release) and live shows that runs in the browser**

* **[Premise](#premise)**
* **[Demo](#demo)**
* **[Requirements](#requirements)**
* **[Developing](#developing)**
  * **[Install](#install)**
  * **[Development](#development)**
  * **[Preview production build](#preview)**
  * **[Building](#building)**

<a name="premise"></a>

# Premise

I got the idea from attending a recent Aphex Twin show and was inspired by the face fold visual. 
I wanted to see what extent I could replicate this visual in realtime.
My initial idea was for the visual to be housed in a desktop app written in C++ and use OpenCV for performance reasons, but I wanted anyone to play with the visual simply by visiting a site, so I switched to a web-based project.

This project used [webpack-starter-basic](https://github.com/lifenautjoe/webpack-starter-basic) as a starting point.
In-browser face detection is handled by [face-api.js](https://github.com/justadudewhohacks/face-api.js).


<a name="demo"></a>

# Demo

Coming soon.


<a name="requirements"></a>

# Requirements

- `node` >= 8.x
- `npm` >= 6.x


<a name="developing"></a>

# Developing

Some steps 

<a name="install"></a>

## Install

Clone the repo.

```bash
git clone https://github.com/helmetroo/phacephold.git 
```

Install required modules.

```bash
npm i
```

<a name="development"></a>

## Development

`webpack-dev-server` is used to serve a development build, and enables you to quickly see changes you make from your editor. To start it, run

```bash
npm run dev
```

<a name="preview"></a>

## Preview

`http-server` is used to serve a production build for preview purposes. 
It also allows you to run the app from other devices on your network, say a mobile device connected to the same wireless router.

### SSL Certificate

To test a production build, you will need to create a root SSL certificate as there is functionality (fetching from your webcam) requiring the build to be served via HTTPS.
A quick way to create one to preview the production build by following [this tutorial](https://medium.freecodecamp.org/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec). You will need `openssl` installed.
By default, `http-server` will look for a certificate file (`server.crt`), and a key file (`server.key`). You can change the filenames that will be searched for in `package.json` under the `preview` script.

### Run preview server

To preview a production build, run

```bash
npm run preview
```

### Build

To make a production build, run

```bash
npm run build
```
