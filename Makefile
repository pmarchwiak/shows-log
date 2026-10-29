dev:
	npm run-script dev -- -p 4000

test:
	npm test

download:
	.venv/bin/python3 scripts/gsheet-to-tsv.py

convert:
	node scripts/convert-tsv.js "$(shell ls -rt data/*tsv | tail -n 1)"

thumbs:
	uv run scripts/generate-thumbs.py

# journals are rendered into the pages at build time; don't publish the raw files
build: thumbs
	npm run-script build
	find out -name '*.md' -delete
	find out -name .osxphotos_export.db -delete

deploy:
	npx netlify deploy --dir out --prod

# Content backup to Cloudflare R2. BACKUP_SRC is public/content after the folder migration.
BACKUP_SRC ?= public/content
BACKUP_REMOTE ?= r2:showslog-content
RCLONE_FLAGS = --exclude .DS_Store --fast-list

backup:
	rclone sync $(BACKUP_SRC) $(BACKUP_REMOTE) $(RCLONE_FLAGS) --track-renames --progress

backup-check:
	rclone check $(BACKUP_SRC) $(BACKUP_REMOTE) $(RCLONE_FLAGS)

restore:
	rclone copy $(BACKUP_REMOTE) $(BACKUP_SRC) $(RCLONE_FLAGS) --progress
