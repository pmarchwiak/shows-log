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

# def tsv_to_json(tsv_path):
#     # Open the TSV file for reading
#     with open(tsv_path, 'r', newline='') as tsvfile:
#         reader = csv.DictReader(tsvfile, delimiter='\t')

#         for row in reader:
#             if 

#         rows = [row for row in reader]

#     # Write the data as JSON to a file
#     with open(json_file, 'w') as jsonfile:
#         json.dump(rows, jsonfile, indent=4)

#     print(f"Conversion complete. JSON file saved as {json_file}.")


sheet_url = 'https://docs.google.com/spreadsheets/d/1XmjKYOYZdxDeAPlJTmINBti4fLIb6kq0iXgdf72kQLc/edit?usp=sharing'

tsv_path = "data/showslog-data-" + datetime.now().strftime("%Y-%m-%d_%H%M%S") + ".tsv"
export_to_tsv(sheet_url, tsv_path)

