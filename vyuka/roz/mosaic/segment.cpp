// Teaching segmenter: RGB + known K only. Ground truth is never an input.
#define STB_IMAGE_IMPLEMENTATION
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "third_party/stb_image.h"
#include "third_party/stb_image_write.h"
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <iostream>
#include <limits>
#include <numeric>
#include <random>
#include <stdexcept>
#include <string>
#include <vector>

struct Image {
    int w, h, channels;
    std::vector<float> data;
    Image(int width, int height, int c) : w(width), h(height), channels(c),
        data(size_t(width) * height * c) {}
    float& operator()(int y, int x, int c) { return data[(size_t(y)*w+x)*channels+c]; }
    float operator()(int y, int x, int c) const { return data[(size_t(y)*w+x)*channels+c]; }
};
Image readRGB(const char* path) {
    int w, h, c;
    auto* pixels = stbi_load(path, &w, &h, &c, 3);
    if (!pixels) throw std::runtime_error("Cannot read input image");
    Image rgb(w,h,3);
    for (size_t i=0; i<rgb.data.size(); ++i) rgb.data[i]=pixels[i]/255.0f;
    stbi_image_free(pixels);
    return rgb;
}
Image channel(const Image& a, int c) {
    Image out(a.w,a.h,1);
    for (int y=0;y<a.h;++y) for(int x=0;x<a.w;++x) out(y,x,0)=a(y,x,c);
    return out;
}
Image concat(const std::vector<Image>& parts) {
    int n=0; for(const auto& p:parts) n+=p.channels;
    Image out(parts.at(0).w,parts.at(0).h,n);
    int offset=0;
    for(const auto& p:parts) {
        if(p.w!=out.w || p.h!=out.h) throw std::runtime_error("Feature dimensions differ");
        for(int y=0;y<out.h;++y) for(int x=0;x<out.w;++x)
            for(int c=0;c<p.channels;++c) out(y,x,offset+c)=p(y,x,c);
        offset+=p.channels;
    }
    return out;
}
// Half-sample symmetric extension: ... b a | a b c d | d c ...
int reflect(int i,int n) {
    while(i<0 || i>=n) i=i<0 ? -i-1 : 2*n-i-1;
    return i;
}
Image blur(const Image& a,float sigma) {
    if(sigma<=0) return a;
    const int r=int(3*sigma+0.5f);
    std::vector<float> kernel(2*r+1); float sum=0;
    for(int i=-r;i<=r;++i) sum+=(kernel[i+r]=std::exp(-i*i/(2*sigma*sigma)));
    for(float& v:kernel) v/=sum;
    Image temp(a.w,a.h,a.channels),out(a.w,a.h,a.channels);
    // Two separable spatial passes; channels stay independent.
    for(int y=0;y<a.h;++y) for(int x=0;x<a.w;++x) for(int c=0;c<a.channels;++c) {
        float v=0;
        for(int i=-r;i<=r;++i) v+=kernel[i+r]*a(reflect(y+i,a.h),x,c);
        temp(y,x,c)=v;
    }
    for(int y=0;y<a.h;++y) for(int x=0;x<a.w;++x) for(int c=0;c<a.channels;++c) {
        float v=0;
        for(int i=-r;i<=r;++i) v+=kernel[i+r]*temp(y,reflect(x+i,a.w),c);
        out(y,x,c)=v;
    }
    return out;
}
Image toLab(const Image& rgb) {
    Image lab(rgb.w,rgb.h,3);
    auto linear=[](float v){return v<=0.04045f?v/12.92f:std::pow((v+0.055f)/1.055f,2.4f);};
    auto f=[](float v){return v>0.008856f?std::cbrt(v):7.787f*v+16.0f/116;};
    for(int y=0;y<rgb.h;++y) for(int x=0;x<rgb.w;++x) {
        float r=linear(rgb(y,x,0)),g=linear(rgb(y,x,1)),b=linear(rgb(y,x,2));
        float X=f((.412453f*r+.357580f*g+.180423f*b)/.95047f);
        float Y=f(.212671f*r+.715160f*g+.072169f*b);
        float Z=f((.019334f*r+.119193f*g+.950227f*b)/1.08883f);
        lab(y,x,0)=(116*Y-16)/100; lab(y,x,1)=5*(X-Y); lab(y,x,2)=2*(Y-Z);
    }
    return lab; // D65, L*, a*, b* divided by 100.
}
Image localStats(const Image& a,float sigma) {
    Image mean=blur(a,sigma),square=a;
    for(float& v:square.data) v*=v;
    Image deviation=blur(square,sigma);
    for(size_t i=0;i<a.data.size();++i)
        deviation.data[i]=std::sqrt(std::max(deviation.data[i]-mean.data[i]*mean.data[i],0.0f));
    return concat({mean,deviation});
}
Image gradientEnergy(const Image& light) {
    Image energy(light.w,light.h,2);
    const int smooth[3]={1,2,1},derivative[3]={-1,0,1};
    for(int y=0;y<light.h;++y) for(int x=0;x<light.w;++x) {
        float dx=0,dy=0;
        for(int j=-1;j<=1;++j) for(int i=-1;i<=1;++i) {
            float v=light(reflect(y+j,light.h),reflect(x+i,light.w),0)/8;
            dx+=v*smooth[j+1]*derivative[i+1];dy+=v*derivative[j+1]*smooth[i+1];
        }
        energy(y,x,0)=dx*dx;energy(y,x,1)=dy*dy;
    }
    energy=blur(energy,5);
    for(float& v:energy.data) v=std::sqrt(v);
    return energy;
}
Image features(const Image& rgb,int method) {
    if(method==0) return channel(rgb,0);
    if(method==1) return blur(channel(rgb,0),5);
    if(method==2) return blur(rgb,5);
    Image lab=toLab(rgb);
    if(method==3) return blur(lab,5);
    if(method<=5) return localStats(lab,5);
    Image feat=concat({localStats(lab,3),localStats(lab,9)});
    if(method>=8) feat=concat({feat,gradientEnergy(channel(lab,0))});
    return feat;
}
std::vector<int> samplePixels(int n,int count,std::mt19937& rng) {
    std::vector<int> ids(n);std::iota(ids.begin(),ids.end(),0);
    std::shuffle(ids.begin(),ids.end(),rng);ids.resize(std::min(n,count));return ids;
}
void standardize(Image& f,const std::vector<int>& sample) {
    for(int c=0;c<f.channels;++c) {
        double mean=0,var=0;
        for(int i:sample) mean+=f.data[size_t(i)*f.channels+c];
        mean/=sample.size();
        for(int i:sample) {double v=f.data[size_t(i)*f.channels+c]-mean;var+=v*v;}
        double scale=std::max(std::sqrt(var/sample.size()),0.01);
        for(size_t i=c;i<f.data.size();i+=f.channels) f.data[i]=float((f.data[i]-mean)/scale);
    }
}
float distance2(const float* a,const float* b,int dim) {
    float sum=0;for(int c=0;c<dim;++c) {float d=a[c]-b[c];sum+=d*d;}return sum;
}
std::vector<float> fitKmeans(const Image& f,const std::vector<int>& sample,int k,
                            std::mt19937& rng,int attempts=5,int iterations=100) {
    int dim=f.channels,n=int(sample.size());
    auto point=[&](int i){return &f.data[size_t(sample[i])*dim];};
    std::vector<float> best;double bestCost=std::numeric_limits<double>::infinity();
    for(int attempt=0;attempt<attempts;++attempt) {
        std::vector<float> centers(size_t(k)*dim),nearest(n,std::numeric_limits<float>::infinity());
        int chosen=std::uniform_int_distribution<int>(0,n-1)(rng);
        // k-means++: choose each next centre proportionally to squared distance.
        for(int c=0;c<k;++c) {
            std::copy(point(chosen),point(chosen)+dim,centers.begin()+size_t(c)*dim);
            double total=0;
            for(int i=0;i<n;++i) total+=(nearest[i]=std::min(nearest[i],distance2(point(i),&centers[size_t(c)*dim],dim)));
            double target=std::generate_canonical<double,53>(rng)*total;
            chosen=n-1;for(int i=0;i<n;++i) if((target-=nearest[i])<=0){chosen=i;break;}
        }
        std::vector<int> labels(n,-1),counts(k);
        for(int step=0;step<iterations;++step) {
            std::vector<double> sums(size_t(k)*dim,0);std::fill(counts.begin(),counts.end(),0);
            bool changed=false;
            for(int i=0;i<n;++i) {
                int label=0;float dist=std::numeric_limits<float>::infinity();
                for(int c=0;c<k;++c) {float v=distance2(point(i),&centers[size_t(c)*dim],dim);if(v<dist){dist=v;label=c;}}
                changed|=labels[i]!=label;labels[i]=label;nearest[i]=dist;++counts[label];
                for(int c=0;c<dim;++c) sums[size_t(label)*dim+c]+=point(i)[c];
            }
            for(int j=0;j<k;++j) {
                if(counts[j]) for(int c=0;c<dim;++c) centers[size_t(j)*dim+c]=float(sums[size_t(j)*dim+c]/counts[j]);
                else { // Restart an empty cluster at the most distant sample.
                    int i=int(std::max_element(nearest.begin(),nearest.end())-nearest.begin());
                    std::copy(point(i),point(i)+dim,centers.begin()+size_t(j)*dim);nearest[i]=0;changed=true;
                }
            }
            if(!changed) break;
        }
        double cost=0;
        for(int i=0;i<n;++i) {
            float dist=std::numeric_limits<float>::infinity();
            for(int c=0;c<k;++c) dist=std::min(dist,distance2(point(i),&centers[size_t(c)*dim],dim));
            cost+=dist;
        }
        if(cost<bestCost){bestCost=cost;best=centers;}
    }
    return best;
}
std::vector<uint8_t> predict(const Image& f,const std::vector<float>& centers,int k) {
    std::vector<uint8_t> labels(size_t(f.w)*f.h);
    for(size_t i=0;i<labels.size();++i) {
        float best=std::numeric_limits<float>::infinity();
        for(int c=0;c<k;++c) {
            float d=distance2(&f.data[i*f.channels],&centers[size_t(c)*f.channels],f.channels);
            if(d<best){best=d;labels[i]=uint8_t(c);}
        }
    }
    return labels;
}
std::vector<uint8_t> vote(const std::vector<uint8_t>& labels,int w,int h,int k,float sigma) {
    std::vector<uint8_t> out(labels.size());std::vector<float> best(labels.size(),-1);
    for(int c=0;c<k;++c) {
        Image mask(w,h,1);
        for(size_t i=0;i<labels.size();++i) mask.data[i]=labels[i]==c ? 1.0f : 0.0f;
        Image support=blur(mask,sigma);
        for(size_t i=0;i<labels.size();++i) if(support.data[i]>best[i]){best[i]=support.data[i];out[i]=uint8_t(c);}
    }
    return out;
}
int main(int argc,char** argv) {
    try {
        if(argc<5 || argc>6) {std::cerr<<"Usage: segment input.png output.png K method[0..9] [seed]\n";return 2;}
        int k=std::stoi(argv[3]),method=std::stoi(argv[4]);
        if(k<1||k>256||method<0||method>9) throw std::runtime_error("K must be 1..256; method 0..9");
        std::mt19937 rng(argc==6?uint32_t(std::stoul(argv[5])):20261112u);
        Image rgb=readRGB(argv[1]),feat=features(rgb,method);
        auto sample=samplePixels(rgb.w*rgb.h,8192,rng);
        if(k>int(sample.size())) throw std::runtime_error("K exceeds sample size");
        if(method>=5) standardize(feat,sample);
        auto centers=fitKmeans(feat,sample,k,rng,5,100);
        auto labels=predict(feat,centers,k);
        if(method==7||method==9) labels=vote(labels,rgb.w,rgb.h,k,3);
        if(!stbi_write_png(argv[2],rgb.w,rgb.h,1,labels.data(),rgb.w)) throw std::runtime_error("Cannot write PNG");
        return 0;
    } catch(const std::exception& e) {std::cerr<<e.what()<<'\n';return 1;}
}
