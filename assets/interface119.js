import {training121Subjects} from './interface121.js?v=124';
import {training124Options,training124Material} from './interface124.js?v=124';
export function training119Subjects(voice,extras=''){return training121Subjects(voice,extras);}
export function training119Options(options){return training124Options(options);}
export function training119Range(options){return training124Material({...options,step:'range'});}
