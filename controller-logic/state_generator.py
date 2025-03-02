import pandas as pd
import numpy as np
import random as rd
import matplotlib.pyplot as plt
from sklearn import svm
import pickle

#  This is the SVM model that is responsible for classifying temperature out of 5.
#  It is already trained. No need further training steps.

class TempModel:
    def __init__(self):
        self.temperature = None
        with open("test_model.pkl", "rb") as f:
            self.model = pickle.load(f)
        print("Temperature model is loaded.")


    def get_state(self, temp):
        prediction = np.array([[temp]])
        result = self.model.predict(prediction)[0]
        print(result)
        return result