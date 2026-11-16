"""Usage: python pack-pga-cloth.py sari.f32 dark-specular-fabric.binary MERL-Copyright.txt output.js"""
import sys, base64
from pathlib import Path
import numpy as np
sari, merl, notice, out = map(Path, sys.argv[1:])
a = np.fromfile(sari, '<f4').reshape(16,36,16,36,3)
with merl.open('rb') as f:
    assert tuple(np.fromfile(f,'<i4',3)) == (90,90,180)
    samples = np.fromfile(f,'<f8').reshape(3,90,90,180)
t,p = np.deg2rad(np.linspace(0,89.5,16)),np.arange(36)*np.pi/18
i,o,b = np.meshgrid(t,t,p,indexing='ij')
ix,iz,ox,oy,oz=np.sin(i),np.cos(i),np.sin(o)*np.cos(b),np.sin(o)*np.sin(b),np.cos(o)
ph=np.arctan2(oy,ix+ox)
th=np.arctan2(np.hypot(ix+ox,oy),iz+oz)
x,y=ix*np.cos(ph),-ix*np.sin(ph)
td=np.arccos(np.clip(x*np.sin(th)+iz*np.cos(th),-1,1))
pd=np.arctan2(y,x*np.cos(th)-iz*np.sin(th))%np.pi
m=samples[:,np.minimum(89,(np.sqrt(th/(np.pi/2))*90).astype(int)),np.minimum(89,(td*180/np.pi).astype(int)),np.minimum(179,(pd*180/np.pi).astype(int))].transpose(1,2,3,0)*np.array([1,1.15,1.66])/1500
def encode(v):
    q=np.rint(np.log1p(1000*np.maximum(0,v))*20)
    assert np.isfinite(q).all() and q.max()<256
    return base64.b64encode(q.astype('uint8').tobytes()).decode()
out.write_text('/*\n'+notice.read_text()+'\n*/\nconst clothData=["'+encode(a)+'","'+encode(m)+'"];\n',encoding='utf-8')
