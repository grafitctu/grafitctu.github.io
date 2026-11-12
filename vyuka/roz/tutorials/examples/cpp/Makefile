CXX ?= c++
CXXFLAGS ?= -O2 -std=c++17 -Wall -Wextra
PROGRAMS = check_pca pca_dbscan classification_pipeline lesson_snippets
all: $(PROGRAMS)
check_pca: check_pca.cpp recognition.hpp
	$(CXX) $(CXXFLAGS) check_pca.cpp -o $@
pca_dbscan: pca_dbscan.cpp recognition.hpp
	$(CXX) $(CXXFLAGS) pca_dbscan.cpp -o $@
classification_pipeline: classification_pipeline.cpp recognition.hpp svm_model.hpp third_party/libsvm/svm.cpp
	$(CXX) $(CXXFLAGS) classification_pipeline.cpp third_party/libsvm/svm.cpp -o $@
lesson_snippets: lesson_snippets.cpp recognition.hpp svm_model.hpp third_party/libsvm/svm.cpp
	$(CXX) $(CXXFLAGS) lesson_snippets.cpp third_party/libsvm/svm.cpp -o $@
.PHONY: all
