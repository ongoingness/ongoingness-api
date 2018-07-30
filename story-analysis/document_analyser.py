import gzip
import gensim
import logging
import os
from gensim.models.doc2vec import Doc2Vec, TaggedDocument

logging.basicConfig(
    format='%(asctime)s : %(levelname)s : %(message)s',
    level=logging.INFO)


def show_file_contents(input_file):
    """
    Show the first line of the file
    :param input_file:
    :return: void
    """
    with gzip.open(input_file, 'rb') as f:
        for i, line in enumerate(f):
            print(line)
            break


def read_input(input_file):
    """
    This method reads the input file which is in gzip format
    :param input_file:
    :return:
    """

    logging.info("reading file {0}...this may take a while".format(input_file))
    with gzip.open(input_file, 'rb') as f:
        for i, line in enumerate(f):

            if i % 10000 == 0:
                logging.info("read {0} reviews".format(i))
            # do some pre-processing and return list of words for each review
            # text
            yield gensim.utils.simple_preprocess(line)


# Get the file, 250,000 amazon reviews
abspath = os.path.dirname(os.path.abspath(__file__))
# data_file = os.path.join(abspath, "./reviews_data.txt.gz")

# Read in documents
# rdocuments = list(read_input(data_file))
# logging.info("Done reading data file")

# Convert to tagged documents for model
# documents = [TaggedDocument(doc, [i]) for i, doc in enumerate(rdocuments)]
# model = Doc2Vec(documents, dm=0, alpha=0.025, vector_size=20, min_alpha=0.025, min_count=0)

# Train over documents
# model.train(documents, total_examples=model.corpus_count, epochs=10)

# model.save(os.path.join(abspath, "./docvec.model"))
model = Doc2Vec.load(os.path.join(abspath, "./docvec.model"))

sentence = 'Today was a good day, I went to the shop to buy ingredients for dinner. I then cooked a family meal with ' \
           'the ingredients.'.split()
vector1 = model.infer_vector(sentence)

sentence2 = 'We would often eat together, sometimes we would all sit round the table and enjoy a meal Mum had cooked ' \
            'for us.'.split()
vector2 = model.infer_vector(sentence2)

control = 'Dad was mad for running. He would always get up as early as possible'.split()
print(model.docvecs.similarity_unseen_docs(doc_words1=sentence, doc_words2=sentence2, model=model))
print(model.docvecs.similarity_unseen_docs(doc_words1=sentence, doc_words2=control, model=model))
