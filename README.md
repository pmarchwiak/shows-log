# SHOWS LIST

I've been keeping a list of shows I've attended in a spreadsheet for a long time.

This is a little statically generated website based on that data.

## commands
Start a dev server:
```
npm run-script dev
```

Run the google sheet download script:
```
python scripts/gsheet-to-tsv.py
```

Run the TSV conversion script:
```
node scripts/convert-tsv.js data_file.tsv
```

Run static export:
```
npm run-script build
```

Deploy the static directory:
```
netlify deploy --dir out --prod
```

## TODO
- fix static export
- clean up css
- improved show page layout
- have image gallery fit page better
- stats page
- video: embed youtube, show video icon
- audio: embed bandcamp


=====

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
