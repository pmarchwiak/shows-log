dev:
	npm run-script dev

test:
	npm test

download:
	.venv/bin/python3 scripts/gsheet-to-tsv.py

convert:
	node scripts/convert-tsv.js "$(shell ls -rt data/*tsv | tail -n 1)"

thumbs:
	uv run scripts/generate-thumbs.py

build: thumbs
	npm run-script build

deploy:
	npx netlify deploy --dir out --prod