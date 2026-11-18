// hls.js ships types for its full build only; the light build (no subtitles,
// DRM or alternate audio, which hosts' clips never have) has the same API.
declare module 'hls.js/light' {
  import Hls from 'hls.js';
  export default Hls;
}
