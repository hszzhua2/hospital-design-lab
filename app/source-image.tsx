'use client';
import type {ImgHTMLAttributes,SyntheticEvent} from 'react';
export const fallbackImage='/plan-image-not-included.svg';
export function svgImageFallback(e:SyntheticEvent<SVGImageElement>){if(e.currentTarget.getAttribute('href')!==fallbackImage)e.currentTarget.setAttribute('href',fallbackImage);}
export function SourceImage(props:ImgHTMLAttributes<HTMLImageElement>){return <img {...props} onError={e=>{if(!e.currentTarget.src.endsWith(fallbackImage))e.currentTarget.src=fallbackImage}}/>;}
