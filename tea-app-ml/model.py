import pickle
import json
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

#load pickle files
pickles = ["encoder", "scaler", "flavor_categories", "reverse_categories", 
           "disp_df", "scaled_df"] 
def load_pickle(pickles):
    """This function read and load pickle files. 
    Pickle files are stored in the list named 'pickles'."""
    loaded = {}
    for p in pickles:
        with open(f"{p}.pkl", "rb") as f:
            loaded[p] = pickle.load(f)
    return loaded 

#activate arguments
loaded = load_pickle(pickles)
ordinal_encoder = loaded["encoder"]
scaler = loaded["scaler"]
flavor_categories = loaded["flavor_categories"]
reverse_categories = loaded["reverse_categories"]
disp_df = loaded["disp_df"]
scaled_df = loaded["scaled_df"]

#sample questions
caffeine_input = input("How much caffeine do you want? (low,moderate,high): ")
body_input = input("What type of tea do you want? (light,light-medium,medium,medium-full,full): ")
flavor_input =input("Tell me your favorite flavors. You can select up to three flavors.(Floral,Fruity,Sweet,Vegetal,Nutty/Grain,Roasted/Smoky,Earty/Woody,Mouthfeel)").split(",")
flavor_input = [f.upper() for f in flavor_input]

#encode caffeine input and body input
user_encoded = ordinal_encoder.transform([[caffeine_input, body_input]])

#prepare for cosine similarity
category_zeros = np.zeros(8)
user_vector = np.concatenate([user_encoded[0], category_zeros])
user_scaled = scaler.transform([user_vector])

#simirality
cos_sim = cosine_similarity(user_scaled, scaled_df)
similarities = pd.Series(cos_sim[0], index=scaled_df.index)
top3 = similarities.sort_values(ascending=False)[0:3]

#flavor layer
primary_flavor = [f.split(",") for f in disp_df["flavor_primary"]]
all_categories = [[reverse_categories[p] for p in flavors] for flavors in primary_flavor]
flavor_scores = [sum(tea.count(c) for c in flavor_input) for tea in all_categories]
flavor_scores = np.array(flavor_scores)

#simple versiton(add 1 not to get 0 flavor score is 0)
#final_score = similarities * (1 + flavor_scores)
#print(final_score)

# what if try weighted average
# normalize flavor_scores
flavor_scores_normalized = flavor_scores / flavor_scores.max()

# calculate weighted average(weight: caffeine/body 0.4, flavor 0.6)
final_score = 0.4 * similarities + 0.6 * flavor_scores_normalized

# get top three
top3_final = final_score.sort_values(ascending=False)[0:3]
print(top3_final)

# TODO(次回続き):
# 3. 最終的に、上位3件のname_en, description_brief, flavor_primaryを
#    JSON形式で出力する処理(ステップ6の最後の部分)がまだ