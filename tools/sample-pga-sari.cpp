// cl /EHsc /O2 /std:c++17 /I[path to rgl-epfl/brdf-loader] sample-pga-sari.cpp
// Arguments: RGL RGB .bsdf, output raw float32 RGB table.
#include <fstream>
#define POWITACQ_IMPLEMENTATION
#include "powitacq_rgb.h"
using namespace powitacq_rgb;
Vector3f direction(int t,int p) {
    double theta=t*(89.5/15)*0.0174532925199433, phi=p*(360./36)*0.0174532925199433;
    return Vector3f(sin(theta)*cos(phi),sin(theta)*sin(phi),cos(theta));
}
int main(int argc,char**argv) {
    if(argc!=3)return 2;
    BRDF brdf(argv[1]); std::ofstream out(argv[2],std::ios::binary);
    for(int i=0;i<16;i++)for(int a=0;a<36;a++)for(int o=0;o<16;o++)for(int b=0;b<36;b++){
        auto wi=direction(i,a),wo=direction(o,b), f=brdf.eval(wi,wo);
        for(int k=0;k<3;k++){float x=f[k]/wo.z();out.write(reinterpret_cast<char*>(&x),4);}
    }
    return !out;
}
