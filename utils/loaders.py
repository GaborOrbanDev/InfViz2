from pathlib import Path
import pandas as pd


COUNTRIES = [
    'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 
    'Azerbaijan', 'Brazil', 'Bulgaria', 'Cameroon', 'Chile', 'China', 'Colombia', 'Croatia', 'Cuba', 
    'Cyprus', 'Czech Republic', 'Ecuador', 'Egypt, Arab Rep.', 'Eritrea', 'Ethiopia', 'France', 
    'Germany', 'Ghana', 'Greece', 'India', 'Indonesia', 'Iran, Islamic Rep.', 'Iraq', 'Ireland', 'Italy', 
    'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Lebanon', 'Malta', 'Mexico', 'Morocco', 'Pakistan', 'Peru', 
    'Philippines', 'Russian Federation', 'Syrian Arab Republic', 'Tunisia', 'Turkey', 'Ukraine'
]


def load_dataframe(path: Path) -> pd.DataFrame:
    """Load the CSV from Exercise 1 and filter to COUNTRIES"""
    if not path.exists():
        raise FileNotFoundError(f"CSV file not found at {path}")
    
    df = pd.read_csv(path)
    df = df[df["Country Name"].isin(COUNTRIES)]
    return df