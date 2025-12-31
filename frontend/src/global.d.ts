declare module '*module.scss' {
  interface IClassNames {
    [className: string]: string;
  }
  const styles: IClassNames;
  export = styles;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.mp3';
declare module '*.mp4';
declare module '*.webm';
declare module '*.ogg';
declare module '*.mov';

declare module '*.svg' {
  import React from 'react';
  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_BASE_URL: string;
  }
}
