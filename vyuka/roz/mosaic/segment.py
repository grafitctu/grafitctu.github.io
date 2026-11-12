"""Small, deterministic teaching segmenter. Input: RGB and declared K, never GT."""
import os
for name in ('OMP_NUM_THREADS','OPENBLAS_NUM_THREADS','MKL_NUM_THREADS'):
    os.environ.setdefault(name,'1')
import argparse
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, sobel
from sklearn.cluster import KMeans
from skimage.color import rgb2lab
from threadpoolctl import threadpool_limits

METHODS = [
 dict(id='00_R_pixel',title='R: samotný pixel',kind='r',sigma=0,standardize=False,post=0),
 dict(id='01_R_blur',title='R + Gaussův blur',kind='r',sigma=5,standardize=False,post=0),
 dict(id='02_RGB_blur',title='Tři kanály RGB + blur',kind='rgb',sigma=5,standardize=False,post=0),
 dict(id='03_Lab_blur',title='CIELAB + blur',kind='lab',sigma=5,standardize=False,post=0),
 dict(id='04_Lab_std',title='Lab: lokální průměr a odchylka',kind='stats',sigma=5,standardize=False,post=0),
 dict(id='05_Lab_std_scaled',title='Vyvážení měřítek příznaků',kind='stats',sigma=5,standardize=True,post=0),
 dict(id='06_multiscale',title='Statistiky ve dvou měřítkách',kind='multi',sigma=[3,9],standardize=True,post=0),
 dict(id='07_multiscale_vote',title='Dvě měřítka + hlasování okolí',kind='multi',sigma=[3,9],standardize=True,post=3),
 dict(id='08_gradients',title='Přidání směru změn jasu',kind='gradient',sigma=[3,9],standardize=True,post=0),
 dict(id='09_gradients_vote',title='Směrové příznaky + hlasování',kind='gradient',sigma=[3,9],standardize=True,post=3),
]

def blur(a,sigma):
    # Last axis is the feature/channel axis: never blur across channels.
    return gaussian_filter(a,sigma=(sigma,sigma,0),mode='reflect',truncate=3)

def local_stats(a,sigma):
    mean=blur(a,sigma)
    std=np.sqrt(np.maximum(blur(a*a,sigma)-mean*mean,0))
    return np.concatenate([mean,std],axis=-1)

def features(rgb,method):
    a=np.asarray(rgb,dtype=np.float32)/255
    kind=method['kind'];sigma=method['sigma']
    if kind=='r':return blur(a[:,:,:1],sigma) if sigma else a[:,:,:1]
    if kind=='rgb':return blur(a,sigma)
    lab=rgb2lab(a,illuminant='D65').astype(np.float32)/100
    if kind=='lab':return blur(lab,sigma)
    if kind=='stats':return local_stats(lab,sigma)
    f=np.concatenate([local_stats(lab,s) for s in sigma],axis=-1)
    if kind=='gradient':
        # Local gradient energies distinguish horizontal and vertical texture.
        light=lab[:,:,0]
        dx=sobel(light,axis=1,mode='reflect')/8
        dy=sobel(light,axis=0,mode='reflect')/8
        energy=np.stack([dx*dx,dy*dy],axis=-1)
        f=np.concatenate([f,np.sqrt(blur(energy,5))],axis=-1)
    return f

def segment(rgb,k,method,seed=20261112,sample_size=8192):
    feat=features(rgb,method);height,width,dim=feat.shape
    flat=feat.reshape(-1,dim)
    rng=np.random.default_rng(seed)
    selected=rng.choice(len(flat),min(sample_size,len(flat)),replace=False)
    sample=flat[selected]
    if method['standardize']:
        # Scales are estimated from RGB features of this image, never from GT.
        mean=sample.mean(axis=0);scale=np.maximum(sample.std(axis=0),.01)
        flat=(flat-mean)/scale;sample=flat[selected]
    with threadpool_limits(limits=1):
        model=KMeans(n_clusters=k,init='k-means++',n_init=5,max_iter=100,
                     random_state=seed,algorithm='lloyd').fit(sample)
        labels=model.predict(flat).reshape(height,width)
    if method['post']:
        # Smooth one-hot memberships, not the numeric IDs (IDs have no order).
        votes=np.stack([gaussian_filter((labels==c).astype(np.float32),
                         method['post'],mode='reflect',truncate=3) for c in range(k)])
        labels=np.argmax(votes,axis=0)
    return labels.astype(np.uint8)

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input');parser.add_argument('output');parser.add_argument('--k',type=int,required=True)
    parser.add_argument('--method',choices=[m['id'] for m in METHODS],default='00_R_pixel')
    parser.add_argument('--seed',type=int,default=20261112)
    args=parser.parse_args()
    method=next(m for m in METHODS if m['id']==args.method)
    result=segment(np.asarray(Image.open(args.input).convert('RGB')),args.k,method,args.seed)
    Image.fromarray(result).save(args.output)
