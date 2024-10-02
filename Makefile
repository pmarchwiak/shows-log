dev:
	npm run-script dev

test:
	npm test

download:
	.venv/bin/python3 scripts/gsheet-to-tsv.py

convert:
	node scripts/convert-tsv.js "$(shell ls -rt data/*tsv | tail -n 1)"

build:
	npm run-script build

deploy:
	netlify deploy --dir out --prod