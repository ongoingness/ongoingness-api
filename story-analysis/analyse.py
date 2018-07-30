import gzip
import gensim
import logging
import os

from gensim.models import KeyedVectors

def read_input(input_file):
    """This method reads the input file which is in gzip format"""

    logging.info("reading file {0}...this may take a while".format(input_file))
    with gzip.open(input_file, 'rb') as f:
        for i, line in enumerate(f):

            if (i % 10000 == 0):
                logging.info("read {0} reviews".format(i))
            # do some pre-processing and return list of words for each review
            # text
            yield gensim.utils.simple_preprocess(line)

if __name__ == '__main__':

    abspath = os.path.dirname(os.path.abspath(__file__))
    wv = KeyedVectors.load(os.path.join(abspath, "./vectors/default"), mmap='r')

    w1 = "dirty"
    print("Most similar to {0}".format(w1), wv.most_similar(positive=w1))

    # look up top 6 words similar to 'polite'
    w1 = ["polite"]
    print(
        "Most similar to {0}".format(w1),
        model.wv.most_similar(
            positive=w1,
            topn=6))

    # look up top 6 words similar to 'france'
    w1 = ["france"]
    print(
        "Most similar to {0}".format(w1),
        model.wv.most_similar(
            positive=w1,
            topn=6))

    # look up top 6 words similar to 'shocked'
    w1 = ["shocked"]
    print(
        "Most similar to {0}".format(w1),
        model.wv.most_similar(
            positive=w1,
            topn=6))

    # look up top 6 words similar to 'shocked'
    w1 = ["beautiful"]
    print(
        "Most similar to {0}".format(w1),
        model.wv.most_similar(
            positive=w1,
            topn=6))

    # get everything related to stuff on the bed
    w1 = ["bed", 'sheet', 'pillow']
    w2 = ['couch']
    print(
        "Most similar to {0}".format(w1),
        model.wv.most_similar(
            positive=w1,
            negative=w2,
            topn=10))

    # similarity between two different words
    print("Similarity between 'dirty' and 'smelly'",
          model.wv.similarity(w1="dirty", w2="smelly"))

    # similarity between two identical words
    print("Similarity between 'dirty' and 'dirty'",
          model.wv.similarity(w1="dirty", w2="dirty"))

    # similarity between two unrelated words
    print("Similarity between 'dirty' and 'clean'",
          model.wv.similarity(w1="dirty", w2="clean"))
