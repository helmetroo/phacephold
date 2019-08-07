# phacephold

**Realtime/static face folding visual app inspired by Aphex Twin's [promotional images for Syro](https://en.wikipedia.org/wiki/Syro#Release) and live shows**

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

I've been intrigued with Aphex Twin's face fold gimmick since the promotional material for Syro came out. The realtime idea came to me shortly after attending an Aphex Twin show in NYC and reflecting back on the use of live generated visuals throughout the show. I then thought... why not try to implement that face fold gimmick myself to see if I could do it?

My initial idea was for the visual to be housed in a desktop app written in C++ and OpenCV for performance reasons, but I wanted anyone to play with the visual simply by visiting a site, so I immediately switched to a web-based project.

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

`@commonshost/server` is used to serve a production build for preview purposes via a HTTP2 server.
It also allows you to run the app from other devices on your network, say a mobile device connected to the same wireless router.

### Run preview server

To make a production build and run the preview server, run

```bash
npm run preview
```

To just run the preview server, run

```bash
npm run preview-server
```

## Build

To make a production build, run

```bash
npm run build
```
