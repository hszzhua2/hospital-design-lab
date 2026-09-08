'use client';
import type {ImgHTMLAttributes,SyntheticEvent} from 'react';
import {publicUrl} from '@/lib/public-url';
export const fallbackImage=publicUrl('/plan-image-not-included.svg');
export function svgImageFallback(e:SyntheticEvent<SVGImageElement>){if(e.currentTarget.getAttribute('href')!==fallbackImage)e.currentTarget.setAttribute('href',fallbackImage);}
export function SourceImage(props:ImgHTMLAttributes<HTMLImageElement>){return <img {...props} src={typeof props.src==='string'?publicUrl(props.src):props.src} onError={e=>{if(e.currentTarget.getAttribute('src')!==fallbackImage)e.currentTarget.setAttribute('src',fallbackImage)}}/>;}
