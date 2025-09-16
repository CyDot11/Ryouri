import "./device/media-label-notation.js";

import "../fonts/lexend.scss";
import "../fonts/source-serif-4.scss";
//import '../fonts/campton.scss'
import "../styles/root.scss";
import "../styles/basic/basic.scss";

import "./jq/jq-easings.js";
import "./jq/jq-extend.js";
import "./jq/jq-vhover.js";

// Test page styling
import "../styles/test.scss";

//import './register-links.js'
//import scrollTo from './scroll/scroll-to.js'
import ISVG from "./isvg.js";
import responsiveInfo from "../components/responsive-info/responsive-info.js";
import SlideNavigation from "../components/menu/slide-navigation.js";
import IsvgIconBox from "../components/isvg-icon-box/isvg-icon-box.js";
//import SlideBox from '../components/slide-box/slide-box.js'
import ParallaxFX from "../components/parallax-fx/parallax-fx.js";
//import Overlay from '../components/overlay/overlay.js'
//import SelectionGroup from '../components/button/selection-group.js'
//import Indicators from '../components/button/indicators/indicators.js'
import Playlist from "../components/player/playlist.js";
import Projector from "../components/player/projector/projector.js";

import json_1 from "../components/player/playlists/playlist-1.json";
import json_2 from "../components/player/playlists/playlist-2.json";

import { _to, _math, _url, _wait } from "./utils.js";

// ---------------------------------------

responsiveInfo.show();

// Testing ----------------------------------------------

//_wait(10).then(() => console.log('waited'))

// Playlist -------------------

const plUrls = [
  { url: "images/player/set-1/img-1.jpg", data: "data" },
  "images/player/set-1/img-2.jpg",
  "img-3.jpg",
];
const plObj = {
  commonPath: "images/player/set-1/",
  labelDefinition: "none",
  items: plUrls,
};

const playlist_1 = new Playlist(json_1);
const playlist_2 = new Playlist(json_2);

/*
playlist_1.initialRequest
.then(() => {
    console.log('Playlist initialRequest')
})


playlist_1.preload(0)
.then(e => {
    console.log('Load request', e)
})
.catch(e => {
    console.log('Load reject', e)
})

setTimeout(() => {
    //console.log('Stack', playlist_1.stack, playlist_1.status(0))
}, 3000)
*/
// Projector -------------------------

const projectorOptions = {
  // Layout
  mutedArea: 0.33,
  autoResize: true,
  //aspectRatio: 'auto', // 'auto' or ratio (number) 1 = square, <1 = portrait, >1 = landscape , default = 16/9
  cover: true,

  // Player
  mode: "fade", // 'fade', 'slide', 'slide-vertical'
  autoplay: false, // true or false
  direction: 1, // 1 (right, forward), -1 (left, backward)

  // User Interface
  indicators: "#Indicators-1", // 'none' or false, 'append', 'after' or container element
  directionalPointer: true,
  tap: true,
  tapFX: true,
  swipe: true,
  keys: true,

  // Playlist
  //src: playlist_1, // 'json/url' or object {commonPath:'', labelDefinition:'', items:[]}
  //path: '', // path for relative urls in playlist
  //mediaLabel: 'none' // 'none', 'number', 'fraction', 'dots', 'text' or 'custom'
};

const projector = Projector("#Player-1", projectorOptions);

projector.playlist = playlist_1;
projector.indicators.style = "pipes";

_wait(6).then(() => {
  projector.playlist = playlist_2;
  ((projector.indicators.style = "bullets"), (projector.mode = "slide"));
});

// SlideBox -------------------

//const mainNavi = new SlideBox('#Main-Navigation', {callback: onMainNavi, hidden:false})

// scrollTo ------------------------

//function onScrollTo (e) {console.log('onScrollTo', e)}

//const $registered = scrollTo.register(null, {/*callback: onScrollTo*/})
//console.log('$registered', $registered)

//setTimeout(() => {scrollTo('#Responsive-Grid-Section', null, onScrollTo)}, 3000)

// Build in scrollTo ---------------

//setTimeout(() => {window.scrollTo({top:0, behavior:'smooth'})}, 5000)

// Selection-Group --------------------------

//const group = new SelectionGroup('#Main-Navigation div')
//console.log('SG', group)

// Overlay --------------------------

//const overlay = Overlay('body', {callback:onClickOverlay})
//overlay.show()

// SlideNavigation -----------------------

function onMainNavi(e) {
  console.log("onMainNavi", e);
}

const naviIcon = IsvgIconBox("#Main-Navi-Icon");

const naviOpts = {
  hidden: true,
  button: "#Main-Navi-Icon",
  callback: onMainNavi,
  overlay: true,

  /*
    targets: [
        {text: 'Start', to: '#Header-Section', offset: 24},
        {text: 'Paragraph', to: '#Text-Section'}
    ]
    */
};
const slideNavi = SlideNavigation("#Main-Navigation", naviOpts);

// ParallaxFX -----------------------

let pfx;
const pfxOpts = {
  factor: 0.33,
  align: 0,
  justify: 0,
  cover: true,
};

_wait(1).then(() => {
  pfx = ParallaxFX("#PFX-Target", pfxOpts);
});

// ISVG -----------------------------

function onISVG(e) {
  //console.log('onISVG', e, isvg)
  responsiveInfo.initButtons();
}

const isvg = new ISVG("img.isvg", onISVG);
