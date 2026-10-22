"""PCA / DBSCAN companion using exactly the web lab's saved synthetic points.

Examples:
  python examples/pca_dbscan.py --angle 35
  python examples/pca_dbscan.py --dataset classes --angle 90
  python examples/pca_dbscan.py --y-scale 8 --standardize
These are descriptive demonstrations, not a classification benchmark.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.decomposition import PCA


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dataset',choices=['cloud','isotropic','outlier','classes'],default='cloud')
    parser.add_argument('--angle',type=float,default=0.0)
    parser.add_argument('--y-scale',type=float,default=1.0)
    parser.add_argument('--standardize',action='store_true')
    parser.add_argument('--epsilon',type=float,default=.18)
    parser.add_argument('--min-samples',type=int,default=6)
    args=parser.parse_args()
    if not np.isfinite(args.angle) or not np.isfinite(args.y_scale) or args.y_scale<=0:
        parser.error('Use a finite angle and a finite positive scale.')
    data=json.loads((Path(__file__).parent/'datasets.json').read_text(encoding='utf-8'))
    points=np.array(data[args.dataset]['points'],dtype=float)
    points[:,1]*=args.y_scale
    if args.standardize:
        sigma=points.std(axis=0,ddof=1)
        points=(points-points.mean(axis=0))/np.where(sigma>0,sigma,1)
    mean=points.mean(axis=0)
    centered=points-mean
    angle=np.deg2rad(args.angle)
    direction=np.array([np.cos(angle),np.sin(angle)])
    scores=centered@direction
    variance=scores.var(ddof=1)
    covariance=np.cov(points,rowvar=False,ddof=1)
    pca=PCA(n_components=2,svd_solver='full').fit(points)
    reconstructed=mean+np.outer(scores,direction)
    dbscan=DBSCAN(eps=args.epsilon,min_samples=args.min_samples).fit(data['moons']['points'])
    cluster_count=len(set(dbscan.labels_)-{-1})
    report={
        'dataset':args.dataset,'samples':len(points),'angle_degrees':args.angle,
        'sample_variance':float(variance),
        'u_C_u':float(direction@covariance@direction),
        'retained_fraction':float(variance/np.trace(covariance)) if np.trace(covariance)>0 else None,
        'reconstruction_mse':float(np.mean(np.sum((points-reconstructed)**2,axis=1))),
        'covariance':covariance.tolist(),'pca_variances':pca.explained_variance_.tolist(),
        'dbscan':{'epsilon':args.epsilon,'min_samples_including_self':args.min_samples,
                  'clusters':cluster_count,'noise':int((dbscan.labels_==-1).sum())},
        'scope':'Descriptive synthetic examples. No classification accuracy is measured.'}
    assert np.isclose(variance,direction@covariance@direction)
    print(json.dumps(report,indent=2,ensure_ascii=False))


if __name__=='__main__':
    main()
