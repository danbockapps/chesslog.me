We need an import PGN feature. A PGN file is a text file with one or more chess games. People use software like Chessbase or Lichess Studies to manage collections of games, and they can export PGN files from there.

One thing that makes this tricky is that a user will want to keep their chesslog.me collection in sync with their Chessbase collection. So consider this sequence of actions: they export a 40-game PGN from Chessbase and import it into our app. Then later, they add a game to their Chessbase collection. They export it, now 41 games, and import it into our app. We need to not duplicate the first 40 games. I am thinking we have a UI that shows each game with a checkbox, and we compare the fields of the PGN with what was imported before, and if the tags and moves match, then we put it in a collapsible "Duplicates detected" section with checkboxes unchecked by default. New games have checkboxes checked by default.

In manual collections, the user should have an "import pgn" button.

Lichess also provides an API that can download a PGN from a study. There should be a new type of collection that refreshes from the study rather than refreshing from the user's games played on Lichess. It shouldn't auto-refresh when the user opens the page, though, since refreshing has that manual step where the user has to select which games from the PGN file to import.
