import numpy as np
import sys
import os
from datetime import datetime, timedelta

try:
    import pyarrow.parquet as pq
    import pyarrow as pa
except ImportError:
    raise ImportError("pyarrow is required for real_world_test. Install with: pip install pyarrow")

try:
    import pandas as pd
except ImportError:
    raise ImportError("pandas is required for real_world_test. Install with: pip install pandas")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

class MinMax:
    def __init__(self, data):
        data_array = np.asarray(data, dtype=np.float64)
        self.min_val = float(np.min(data_array))
        self.max_val = float(np.max(data_array))
        self.range_val = self.max_val - self.min_val
        if self.range_val == 0:
            self.range_val = 1.0
    
    def __call__(self, x):
        x_array = np.asarray(x, dtype=np.float64)
        return (x_array - self.min_val) / self.range_val
    
    def denormalize(self, x):
        x_array = np.asarray(x, dtype=np.float64)
        return x_array * self.range_val + self.min_val

def denormalize(x, scaler):
    if isinstance(x, np.ndarray):
        if x.ndim == 0:
            return float(scaler.denormalize(float(x)))
        else:
            return scaler.denormalize(x)
    else:
        return float(scaler.denormalize(float(x)))

def preprocessing_forecasts(path_ecmwf, path_noaa, path_elia, q):
    forecasters_dict = {"ecmwf": [], "noaa": []}
    true_values = []
    forecast_elia = []
    
    df_ecmwf = pq.read_table(path_ecmwf).to_pandas()
    df_ecmwf = df_ecmwf.dropna()
    if "__index_level_0__" in df_ecmwf.columns:
        df_ecmwf = df_ecmwf.rename(columns={"__index_level_0__": "datetime"})
    
    first_date = pd.to_datetime(df_ecmwf["datetime"].iloc[0]).date()
    last_date = pd.to_datetime(df_ecmwf["datetime"].iloc[-1]).date() - timedelta(days=1)
    column_name = f"q{int(q * 100)}"
    scaler_ecmwf = MinMax(df_ecmwf[column_name])
    
    current_date = first_date
    while current_date <= last_date:
        start_time = pd.Timestamp(current_date) + timedelta(hours=22)
        end_time = pd.Timestamp(current_date) + timedelta(days=1, hours=21, minutes=45)
        
        mask = (df_ecmwf["datetime"] >= start_time) & (df_ecmwf["datetime"] <= end_time)
        daily_data = df_ecmwf[mask][column_name].values.astype(np.float64)
        daily_data = scaler_ecmwf(daily_data)
        forecasters_dict["ecmwf"].append(daily_data)
        
        current_date += timedelta(days=1)
    
    df_noaa = pq.read_table(path_noaa).to_pandas()
    df_noaa = df_noaa.dropna()
    if "__index_level_0__" in df_noaa.columns:
        df_noaa = df_noaa.rename(columns={"__index_level_0__": "datetime"})
    
    first_date = pd.to_datetime(df_noaa["datetime"].iloc[0]).date()
    last_date = pd.to_datetime(df_noaa["datetime"].iloc[-1]).date() - timedelta(days=1)
    column_name = f"q{int(q * 100)}"
    scaler_noaa = MinMax(df_noaa[column_name])
    
    current_date = first_date
    while current_date <= last_date:
        start_time = pd.Timestamp(current_date) + timedelta(hours=22)
        end_time = pd.Timestamp(current_date) + timedelta(days=1, hours=21, minutes=45)
        
        mask = (df_noaa["datetime"] >= start_time) & (df_noaa["datetime"] <= end_time)
        daily_data = df_noaa[mask][column_name].values.astype(np.float64)
        daily_data = scaler_noaa(daily_data)
        forecasters_dict["noaa"].append(daily_data)
        
        current_date += timedelta(days=1)
    
    df_ecmwf = pq.read_table(path_ecmwf).to_pandas()
    df_ecmwf = df_ecmwf.dropna()
    if "__index_level_0__" in df_ecmwf.columns:
        df_ecmwf = df_ecmwf.rename(columns={"__index_level_0__": "datetime"})
    
    first_date = pd.to_datetime(df_ecmwf["datetime"].iloc[0]).date()
    last_date = pd.to_datetime(df_ecmwf["datetime"].iloc[-1]).date() - timedelta(days=1)
    scaler_target = MinMax(df_ecmwf["measured"])
    
    current_date = first_date
    while current_date <= last_date:
        start_time = pd.Timestamp(current_date) + timedelta(hours=22)
        end_time = pd.Timestamp(current_date) + timedelta(days=1, hours=21, minutes=45)
        
        mask = (df_ecmwf["datetime"] >= start_time) & (df_ecmwf["datetime"] <= end_time)
        daily_data = df_ecmwf[mask]["measured"].values.astype(np.float64)
        daily_data = scaler_target(daily_data)
        true_values.append(daily_data)
        
        current_date += timedelta(days=1)
    
    df_elia = pd.read_csv(path_elia)
    df_elia = df_elia.dropna()
    df_elia["datetime"] = pd.to_datetime(df_elia["datetime"].str.replace(r"\+00:00$", "", regex=True), format="%Y-%m-%dT%H:%M:%S")
    df_elia = df_elia.sort_values("datetime")
    
    if q == 0.5:
        column_name = "dayaheadforecast"
    elif q == 0.1:
        column_name = "dayaheadconfidence10"
    elif q == 0.9:
        column_name = "dayaheadconfidence90"
    else:
        raise ValueError(f"Unsupported quantile: {q}")
    
    scaler_elia = MinMax(df_elia[column_name])
    
    first_date_elia = pd.to_datetime(df_ecmwf["datetime"].iloc[0]).date()
    last_date_elia = pd.to_datetime(df_ecmwf["datetime"].iloc[-1]).date() - timedelta(days=1)
    current_date = first_date_elia
    while current_date <= last_date_elia:
        start_time = pd.Timestamp(current_date) + timedelta(hours=22)
        end_time = pd.Timestamp(current_date) + timedelta(days=1, hours=21, minutes=45)
        
        mask = (df_elia["datetime"] >= start_time) & (df_elia["datetime"] <= end_time)
        daily_data = df_elia[mask][column_name].values.astype(np.float64)
        daily_data = scaler_elia(daily_data)
        forecast_elia.append(daily_data)
        
        current_date += timedelta(days=1)
    
    return true_values, forecasters_dict, forecast_elia, scaler_ecmwf, scaler_noaa, scaler_target, scaler_elia

