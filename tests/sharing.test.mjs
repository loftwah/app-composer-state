import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const meta=key=>[...html.matchAll(/<meta\s+[^>]*>/g)].filter(([tag])=>new RegExp(`(?:name|property)="${key.replaceAll(':','\\:')}"`).test(tag)).map(([tag])=>tag.match(/content="([^"]*)"/)?.[1]);
test('public sharing uses the app identity and one complete large-image card',()=>{
 const title=html.match(/<title>([^<]+)<\/title>/)?.[1];
 assert.match(title,/Carry \/ forward/);
 for(const key of ['og:title','twitter:title'])assert.deepEqual(meta(key),[title]);
 const description=meta('description')[0];assert.match(description,/fictional/);assert(description.length<=200);
 for(const key of ['og:description','twitter:description'])assert.deepEqual(meta(key),[description]);
 assert.deepEqual(meta('twitter:card'),['summary_large_image']);
 const image='https://ai.loftwah.com/brand/carryforward-share-v3.jpg';
 for(const key of ['og:image','og:image:secure_url','twitter:image'])assert.deepEqual(meta(key),[image]);
 assert.deepEqual(meta('og:image:type'),['image/jpeg']);assert.deepEqual(meta('og:image:width'),['1200']);assert.deepEqual(meta('og:image:height'),['630']);
 assert.deepEqual(meta('og:url'),['https://ai.loftwah.com/']);assert.match(html,/<link rel="canonical" href="https:\/\/ai\.loftwah\.com\/"/);
 assert.match(meta('twitter:image:alt')[0],/Carry \/ forward/);assert.match(meta('og:image:alt')[0],/Carry \/ forward/);
 assert(!html.includes('share-ai-v1.jpg'));
 const jpeg=readFileSync(new URL('../public/brand/carryforward-share-v3.jpg',import.meta.url));
 assert.equal(jpeg.readUInt16BE(0),0xffd8);assert(jpeg.length<1024*1024);
 let dimensions;
 for(let offset=2;offset<jpeg.length;){assert.equal(jpeg[offset],0xff);const marker=jpeg[offset+1],length=jpeg.readUInt16BE(offset+2);if([0xc0,0xc1,0xc2].includes(marker)){dimensions={height:jpeg.readUInt16BE(offset+5),width:jpeg.readUInt16BE(offset+7)};break;}offset+=length+2;}
 assert.deepEqual(dimensions,{width:1200,height:630});
 assert(readFileSync(new URL('../public/robots.txt',import.meta.url),'utf8').includes('Sitemap: https://ai.loftwah.com/sitemap.xml'));
 assert(readFileSync(new URL('../public/sitemap.xml',import.meta.url),'utf8').includes('<loc>https://ai.loftwah.com/</loc>'));
});
