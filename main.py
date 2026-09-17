import pickle
import numpy as np
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

# --- load pickles once at startup ---
pickles = ["encoder", "scaler", "flavor_categories", "reverse_categories",
           "disp_df", "scaled_df"]

def load_pickle(pickles):
    loaded = {}
    for p in pickles:
        with open(f"{p}.pkl", "rb") as f:
            loaded[p] = pickle.load(f)
    return loaded

loaded = load_pickle(pickles)
ordinal_encoder = loaded["encoder"]
scaler = loaded["scaler"]
flavor_categories = loaded["flavor_categories"]
reverse_categories = loaded["reverse_categories"]
disp_df = loaded["disp_df"]
scaled_df = loaded["scaled_df"]

# precompute tea-side flavor categories once
primary_flavor = [f.split(",") for f in disp_df["flavor_primary"]]
all_categories = [[reverse_categories[p] for p in flavors] for flavors in primary_flavor]


class Preferences(BaseModel):
    caffeine: str          # "low" / "moderate" / "high"
    body: str              # "light" / "light-medium" / "medium" / "medium-full" / "full"
    flavor: list[str]      # e.g. ["floral", "sweet"]
    caffeine_body_weight: float = 0.4
    flavor_weight: float = 0.6


def get_recommendations(prefs: Preferences, top_n: int = 3):
    flavor_input = [f.upper() for f in prefs.flavor]

    # caffeine/body -> vector
    user_encoded = ordinal_encoder.transform([[prefs.caffeine, prefs.body]])
    category_zeros = np.zeros(8)
    user_vector = np.concatenate([user_encoded[0], category_zeros])
    user_scaled = scaler.transform([user_vector])

    # cosine similarity
    cos_sim = cosine_similarity(user_scaled, scaled_df)
    similarities = pd.Series(cos_sim[0], index=scaled_df.index)

    # flavor score
    flavor_scores = np.array(
        [sum(tea.count(c) for c in flavor_input) for tea in all_categories]
    )
    max_score = flavor_scores.max() if flavor_scores.max() > 0 else 1
    flavor_scores_normalized = flavor_scores / max_score

    final_score = (
        prefs.caffeine_body_weight * similarities
        + prefs.flavor_weight * pd.Series(flavor_scores_normalized, index=scaled_df.index)
    )

    top = final_score.sort_values(ascending=False)[:top_n]

    results = []
    for name in top.index:
        row = disp_df.loc[name]
        results.append({
            "name_en": name,
            "name_zh": row["name_zh"],
            "description_brief": row["description_brief"],
            "flavor_primary": row["flavor_primary"],
        })
    return results


@app.post("/api/v1/recommendations")
def recommend(prefs: Preferences):
    recommendations = get_recommendations(prefs)
    return {"preferences": prefs.dict(), "recommendations": recommendations}