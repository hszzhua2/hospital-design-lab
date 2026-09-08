// 200 mm navigation grid. No corner cutting; no unverified route smoothing.
export class MinHeap {
  constructor(){this.items=[];}
  push(index,score){const a=this.items;let i=a.length;a.push([index,score]);while(i){const p=(i-1)>>1;if(a[p][1]<=score)break;a[i]=a[p];i=p;}a[i]=[index,score];}
  pop(){const a=this.items,top=a[0],last=a.pop();if(a.length){let i=0;while(true){let c=i*2+1;if(c>=a.length)break;if(c+1<a.length&&a[c+1][1]<a[c][1])c++;if(a[c][1]>=last[1])break;a[i]=a[c];i=c;}a[i]=last;}return top;}
  get length(){return this.items.length;}
}
export function decodeField(field){
  const bytes=Uint8Array.from(atob(field.data),c=>c.charCodeAt(0));const d=new DataView(bytes.buffer);const out=new Uint16Array(bytes.length/2);for(let i=0;i<out.length;i++)out[i]=d.getUint16(i*2,true);return out;
}
export class Navigator {
  constructor(data){this.data=data;this.grid=data.grid;this.field=decodeField(data.fields.clearancePublic);this.cache=new Map();this.radius=300;}
  setRadius(r){if(this.radius!==r){this.radius=r;this.cache.clear();}}
  point(index){return [(index%this.grid.width+.5)*this.grid.step+this.grid.origin[0],(Math.floor(index/this.grid.width)+.5)*this.grid.step+this.grid.origin[1]];}
  valid(i){return i>=0&&i<this.field.length&&this.field[i]>0&&this.field[i]>=this.radius;}
  tree(start){
    if(this.cache.has(start))return this.cache.get(start);
    const {width:w,height:h,step}=this.grid, n=w*h;
    const dist=new Float64Array(n);dist.fill(Infinity);const parent=new Int32Array(n);parent.fill(-1);
    if(!this.valid(start))return {dist,parent};
    const heap=new MinHeap();dist[start]=0;heap.push(start,0);
    while(heap.length){const [a,cost]=heap.pop();if(cost>dist[a]+1e-7)continue;const ax=a%w,ay=(a/w)|0;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        if(!dx&&!dy)continue;const x=ax+dx,y=ay+dy;if(x<0||x>=w||y<0||y>=h)continue;const b=y*w+x;
        if(!this.valid(b))continue;if(dx&&dy&&(!this.valid(a+dx)||!this.valid(a+dy*w)))continue;
        const d=cost+step*(dx&&dy?Math.SQRT2:1);if(d+1e-7<dist[b]){dist[b]=d;parent[b]=a;heap.push(b,d);}
      }
    }
    const result={dist,parent};this.cache.set(start,result);return result;
  }
  route(from,to){
    const a=from.gridIndex,b=to.gridIndex,tree=this.tree(a);if(!this.valid(a)||!this.valid(b)||!Number.isFinite(tree.dist[b]))return null;
    const indices=[];let c=b,guard=0;while(c>=0&&guard++<=this.field.length){indices.push(c);if(c===a)break;c=tree.parent[c];}
    if(indices[indices.length-1]!==a)return null;indices.reverse();let minClear=Infinity;for(const i of indices)minClear=Math.min(minClear,this.field[i]);
    // Compress only exactly collinear points: all route segments keep their validated grid trace.
    const compact=[];for(const i of indices){const q=this.point(i);while(compact.length>=2){const p=compact[compact.length-1],o=compact[compact.length-2];if((p[0]-o[0])*(q[1]-p[1])!==(p[1]-o[1])*(q[0]-p[0]))break;compact.pop();}compact.push(q);}
    return {from:from.id,to:to.id,distanceM:tree.dist[b]/1000,directM:Math.hypot(from.x-to.x,from.y-to.y)/1000,minRadiusMm:minClear,points:compact,indices,radiusMm:this.radius};
  }
  distances(from,pois){const t=this.tree(from.gridIndex);return pois.map(p=>this.valid(p.gridIndex)&&Number.isFinite(t.dist[p.gridIndex])?t.dist[p.gridIndex]/1000:null);}
}
