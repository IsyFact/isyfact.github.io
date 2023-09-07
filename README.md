# IsyFact Online Docs: Publishing

This repository contains GitHub actions to publish the online docs at https://isyfact.github.io via GitHub Pages.

You don't need to clone this repository for your daily technical writing. 🙂

## Known Bugs & Limitations

### Workaround: Deactivating Git LFS
GitHub Pages' own deploy job doesn't support Git LFS.
Because of this an additional GitHub action is used whenever a new version of the online docs are pushed.
It clones the repository, removes Git LFS and pushes the online docs to the `/docs` folder on the `gh-pages` branch.
