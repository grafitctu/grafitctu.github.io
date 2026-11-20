#include "lab.hpp"
int main(int argc,char** argv){try{roz::demo(argc>1?argv[1]:"attention",argc>2?argv[2]:"data/auto-mpg-50.csv");return 0;}catch(const std::exception& e){std::cerr<<e.what()<<'\n';return 1;}}
