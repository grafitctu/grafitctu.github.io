#pragma once
#include <algorithm>
#include <cmath>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <numeric>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>
namespace roz {
using Vector=std::vector<double>;using Matrix=std::vector<Vector>;
inline double dot(const Vector& a,const Vector& b){double s=0;for(std::size_t i=0;i<a.size();++i)s+=a[i]*b[i];return s;}
inline Vector multiply(const Matrix& A,const Vector& x){Vector y;for(const auto& row:A)y.push_back(dot(row,x));return y;}
// BEGIN linear
inline double linear(double x,double m,double b){return m*x+b;}
// END linear
// BEGIN relu
inline double relu(double z){return std::max(0.0,z);}
inline double neuron(double x,double w,double b){return relu(w*x+b);}
// END relu
// BEGIN affine
inline Vector affine_relu(const Matrix& W,const Vector& x,const Vector& b){
    Vector h=multiply(W,x);
    for(std::size_t i=0;i<h.size();++i)h[i]=relu(h[i]+b[i]);
    return h;
}
// END affine
// BEGIN softmax
inline Vector softmax(const Vector& logits,double temperature=1.0){
    if(logits.empty()||!(temperature>0))throw std::invalid_argument("Invalid softmax input.");
    const double largest=*std::max_element(logits.begin(),logits.end());
    if(!std::isfinite(largest))throw std::invalid_argument("At least one position must be unmasked.");
    Vector p;double sum=0;
    for(double x:logits){p.push_back(std::exp((x-largest)/temperature));sum+=p.back();}
    for(auto& x:p)x/=sum;
    return p;
}
// END softmax
inline Vector solve(Matrix A,Vector b){
    const std::size_t n=b.size();for(std::size_t i=0;i<n;++i)A[i].push_back(b[i]);
    for(std::size_t p=0;p<n;++p){std::size_t pivot=p;for(std::size_t r=p+1;r<n;++r)if(std::abs(A[r][p])>std::abs(A[pivot][p]))pivot=r;
        if(std::abs(A[pivot][p])<1e-13)throw std::runtime_error("Singular system; increase regularization.");
        std::swap(A[p],A[pivot]);const double scale=A[p][p];for(std::size_t j=p;j<=n;++j)A[p][j]/=scale;
        for(std::size_t r=0;r<n;++r)if(r!=p){const double factor=A[r][p];for(std::size_t j=p;j<=n;++j)A[r][j]-=factor*A[p][j];}}
    Vector x;for(const auto& row:A)x.push_back(row[n]);return x;
}
struct Car{double hp,mpg;std::string split;};
inline std::vector<Car> load_cars(const std::string& filename){
    std::ifstream input(filename);if(!input)throw std::runtime_error("Cannot open "+filename);std::string line;std::getline(input,line);std::vector<Car> rows;
    while(std::getline(input,line)){if(line.empty())continue;std::stringstream s(line);std::string id,hp,mpg,split;std::getline(s,id,',');std::getline(s,hp,',');std::getline(s,mpg,',');std::getline(s,split,',');rows.push_back({std::stod(hp),std::stod(mpg),split});}return rows;
}
struct Scaling{double mean,sd,ymean;};
inline Scaling training_scaling(const std::vector<Car>& rows){double mean=0,ymean=0,variance=0,n=0;for(const auto& r:rows)if(r.split=="train"){mean+=r.hp;ymean+=r.mpg;++n;}if(n<2)throw std::runtime_error("Need training samples.");mean/=n;ymean/=n;for(const auto& r:rows)if(r.split=="train")variance+=(r.hp-mean)*(r.hp-mean);if(variance==0)throw std::runtime_error("Constant input.");return{mean,std::sqrt(variance/n),ymean};}
struct Basis{Vector knots,beta;double mean,sd;};
inline Vector design(double z,const Vector& knots){Vector a{1,z};for(double t:knots)a.push_back(relu(z-t));return a;}
// BEGIN basis
inline Basis fit_basis(const std::vector<Car>& rows,int k,double ridge){
    const auto scale=training_scaling(rows);Vector z,y;
    for(const auto& r:rows)if(r.split=="train"){z.push_back((r.hp-scale.mean)/scale.sd);y.push_back(r.mpg);}
    const auto bounds=std::minmax_element(z.begin(),z.end());Vector knots;
    for(int j=0;j<k;++j)knots.push_back(*bounds.first+(*bounds.second-*bounds.first)*(j+1)/(k+1));
    const std::size_t d=std::size_t(k+2);Matrix A(d,Vector(d,0));Vector b(d,0);
    for(std::size_t r=0;r<z.size();++r){const auto phi=design(z[r],knots);
        for(std::size_t i=0;i<d;++i){b[i]+=phi[i]*y[r];for(std::size_t j=0;j<d;++j)A[i][j]+=phi[i]*phi[j];}}
    for(std::size_t j=1;j<d;++j)A[j][j]+=ridge; // the intercept is not penalized
    return{knots,solve(A,b),scale.mean,scale.sd};
}
// END basis
inline double predict(const Basis& model,double hp){return dot(model.beta,design((hp-model.mean)/model.sd,model.knots));}
struct Gradient{double loss,dw,db;};
// BEGIN gradient
inline Gradient line_gradient(const std::vector<Car>& rows,double w,double b){
    const auto scale=training_scaling(rows);double loss=0,dw=0,db=0,n=0;
    for(const auto& r:rows)if(r.split=="train"){
        const double z=(r.hp-scale.mean)/scale.sd;
        const double error=w*z+b-(r.mpg-scale.ymean);
        loss+=error*error;dw+=2*error*z;db+=2*error;++n;
    }
    return{loss/n,dw/n,db/n};
}
// END gradient
inline Vector activate(Vector x,const std::string& kind){for(auto& v:x)v=kind=="identity"?v:kind=="tanh"?std::tanh(v):relu(v);return x;}
inline Vector biased(Vector x,const Vector& b){for(std::size_t i=0;i<x.size();++i)x[i]+=b[i];return x;}
struct Network{Vector z1,h1,z2,h2;double y;};
// BEGIN network
inline Network forward(double x,const std::string& activation="relu"){
    const Matrix W1{{-1.4},{-.7},{.4},{.8},{1.2}};
    const Vector b1{-.8,.2,.6,-.4,.3},b2{.1,-.2,.3,-.1,.2},W3{.6,-.4,.8,-.7,.5};
    Matrix W2(5,Vector(5));for(int i=0;i<5;++i)for(int j=0;j<5;++j)W2[i][j]=(((i+1)*7+(j+1)*3)%11-5)/6.0;
    const auto z1=biased(multiply(W1,{x}),b1),h1=activate(z1,activation);
    const auto z2=biased(multiply(W2,h1),b2),h2=activate(z2,activation);
    return{z1,h1,z2,h2,dot(W3,h2)+.1}; // the final layer is affine
}
// END network
struct Attention{Matrix Q,K,V;Vector raw,scores,alpha,context;};
const Matrix Wq{{1.4,.2,-.4},{.4,1.6,.2},{-.6,.4,1.2}},Wk{{1.2,-.2,.8},{.2,1.4,-.4},{.4,.2,1.8}},Wv{{1,0,.2},{-.1,.8,.1},{0,.3,.7}};
const Matrix Wout{{.7,1.3,.4},{-.4,.5,.9},{.2,-.6,1.1},{-.8,.2,.1},{1.2,-.7,-.4}};const Vector bout{1.2,.4,-.2,-.8,-.4};
// BEGIN attention
inline Attention attend(const Matrix& H,std::size_t query,bool causal=true,double temperature=1.0){
    if(query>=H.size())throw std::invalid_argument("Invalid query position.");
    Attention a;for(const auto& h:H){a.Q.push_back(multiply(Wq,h));a.K.push_back(multiply(Wk,h));a.V.push_back(multiply(Wv,h));}
    for(std::size_t j=0;j<H.size();++j){const double score=dot(a.Q[query],a.K[j])/std::sqrt(3.0);a.raw.push_back(score);a.scores.push_back(causal&&j>query?-std::numeric_limits<double>::infinity():score);}
    a.alpha=softmax(a.scores,temperature);a.context=Vector(3,0);
    for(std::size_t j=0;j<H.size();++j)for(std::size_t d=0;d<3;++d)a.context[d]+=a.alpha[j]*a.V[j][d];
    return a;
}
// END attention
inline Matrix example_tokens(){Matrix H{{.2,.1,-.1},{.8,0,.2},{.1,.3,0},{1,-.2,.4},{0,.9,.5},{.2,.1,.3}};for(std::size_t p=0;p<H.size();++p){H[p][0]+=.03*p;H[p][1]+=.02*(p%2);H[p][2]-=.01*p;}return H;}
inline void number(std::ostream& out,double x){if(std::isfinite(x))out<<std::setprecision(17)<<x;else out<<"null";}
inline void vector_json(std::ostream& out,const Vector& x){out<<'[';for(std::size_t i=0;i<x.size();++i){if(i)out<<',';number(out,x[i]);}out<<']';}
inline void matrix_json(std::ostream& out,const Matrix& x){out<<'[';for(std::size_t i=0;i<x.size();++i){if(i)out<<',';vector_json(out,x[i]);}out<<']';}
inline void demo(const std::string& mode,const std::string& csv){
    std::cout<<std::setprecision(17);
    if(mode=="linear"){std::cout<<"{\"prediction\":"<<linear(120,-.12,40)<<"}\n";return;}
    if(mode=="relu"){std::cout<<"{\"z\":"<<-1.2*.8+.6<<",\"activation\":"<<neuron(.8,-1.2,.6)<<"}\n";return;}
    if(mode=="affine"){std::cout<<"{\"h\":";vector_json(std::cout,affine_relu({{1,.5,0},{-.5,1,.2},{.3,-.2,.8}},{1,2,-1},{0,.2,-.1}));std::cout<<"}\n";return;}
    if(mode=="softmax"){std::cout<<"{\"probabilities\":";vector_json(std::cout,softmax({1000,1001,999}));std::cout<<"}\n";return;}
    if(mode=="network"){const auto n=forward(.8);std::cout<<"{\"h1\":";vector_json(std::cout,n.h1);std::cout<<",\"h2\":";vector_json(std::cout,n.h2);std::cout<<",\"y\":"<<n.y<<",\"parameters\":46}\n";return;}
    if(mode=="attention"){const auto a=attend(example_tokens(),5);const auto logits=biased(multiply(Wout,a.context),bout);std::cout<<"{\"Q\":";matrix_json(std::cout,a.Q);std::cout<<",\"K\":";matrix_json(std::cout,a.K);std::cout<<",\"V\":";matrix_json(std::cout,a.V);std::cout<<",\"scores\":";vector_json(std::cout,a.scores);std::cout<<",\"alpha\":";vector_json(std::cout,a.alpha);std::cout<<",\"context\":";vector_json(std::cout,a.context);std::cout<<",\"logits\":";vector_json(std::cout,logits);std::cout<<",\"probabilities\":";vector_json(std::cout,softmax(logits));std::cout<<"}\n";return;}
    const auto rows=load_cars(csv);
    if(mode=="basis"){const auto m=fit_basis(rows,5,.01);Vector p;for(const auto& r:rows)p.push_back(predict(m,r.hp));std::cout<<"{\"knots\":";vector_json(std::cout,m.knots);std::cout<<",\"beta\":";vector_json(std::cout,m.beta);std::cout<<",\"predictions\":";vector_json(std::cout,p);std::cout<<"}\n";return;}
    if(mode=="gradient"){double w=0,b=4;Vector losses;for(int i=0;i<50;++i){const auto g=line_gradient(rows,w,b);losses.push_back(g.loss);w-=.1*g.dw;b-=.1*g.db;}std::cout<<"{\"w\":"<<w<<",\"b\":"<<b<<",\"losses\":";vector_json(std::cout,losses);std::cout<<"}\n";return;}
    throw std::invalid_argument("Choose linear, relu, affine, softmax, network, attention, basis or gradient.");
}
} // namespace roz
