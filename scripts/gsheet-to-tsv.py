import csv
from datetime import datetime
import gspread
import json

gc = gspread.oauth()

def export_to_tsv(sheet_url, output_file):
    sheet = gc.open_by_url(sheet_url).sheet1

    rows = sheet.get_all_values()

    with open(output_file, 'w', newline='') as tsvfile:
        writer = csv.writer(tsvfile, delimiter='\t')
        writer.writerows(rows)

    print(f"Wrote tsv to {output_file} successfully!")

sheet_url = 'https://docs.google.com/spreadsheets/d/1XmjKYOYZdxDeAPlJTmINBti4fLIb6kq0iXgdf72kQLc/edit?usp=sharing'

tsv_path = "data/showslog-data-" + datetime.now().strftime("%Y-%m-%d_%H%M%S") + ".tsv"
export_to_tsv(sheet_url, tsv_path)

