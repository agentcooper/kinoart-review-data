# Kinoart review data

Kinoart ("Искусство Кино") is a Russian movie review magazine, it is available online at https://kinoart.ru. Because they write in the Russian, all movie titles are referenced in Russian as well. This can be inconvenient for any data science needs.

File [`./data/output.csv`](https://github.com/agentcooper/kinoart-review-data/blob/main/data/output.csv) matches the supposed Russian title from the Kinoart review with the English movie title on [TMDB](https://www.themoviedb.org). It can be useful for further data analysis.

## How to run

With [Node](https://nodejs.org/en/):

```bash
# Updates ./data/output.csv
./bin/update.js
```

## Notes

- The script caches all network requests using local files.
- The supposed Russian title of the movie is being guessed from the photo caption and the review title.

## Further use

I did this to check which of my watched movies have a review from the Kinoart magazine.

To match a [CSV export from Letterboxd](https://letterboxd.com/settings/data/) against the review data, you can use the [xsv](https://github.com/BurntSushi/xsv) tool:

```bash
% xsv join Name ~/Downloads/letterboxd-evilagentcooper-2021-12-23-20-10-utc/watched.csv Title ./data/output.csv | xsv select 'Name,Review URL'
Name,Review URL
Pulp Fiction,http://kinoart.ru/reviews/mesto-kriminalnogo-chtiva-kventina-tarantino-v-kinematografe-1990-h
Mad Max: Fury Road,http://kinoart.ru/reviews/bezumnyy-maks-doroga-yarosti-pyat-let-nazad-vyshel-film-kotoryy-podvel-nas-k-vratam-valgally
Interstellar,http://kinoart.ru/reviews/nulevaya-gravitatsiya-anton-dolin-o-filme-interstellar-kristofera-nolana
The Shining,http://kinoart.ru/reviews/ded-s-batey-stsepilis-po-pyani-doktor-son-po-stivenu-kingu-za-i-protiv
...
```

There is also `./bin/letterboxd-recent.js`.
