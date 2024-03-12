# IsyFact Online Docs

## Publishing
This repository contains GitHub actions to build and publish the online docs at https://isyfact.github.io via GitHub Pages.

You don't need to clone this repository for your daily technical writing. 🙂

## Antora playbook and customization

Additionally, this repository contains the Antora playbook, Antora extensions and a customized UI for the IsyFact online docs.

## Prerequisites
The documentation is written in [AsciiDoc](https://docs.asciidoctor.org/asciidoc/latest/) and uses [Antora](https://antora.org/) to build a static HTML site for easy browsing.

To build the online docs, you need the following prerequisites.

**node.js & npm**: You should use a version manager (i.e. [nvm for Windows](https://github.com/coreybutler/nvm-windows) or [nvm for Linux/macOS](https://github.com/nvm-sh/nvm)), or you can install both manually for your OS.
Please use at least the latest LTS version.

## Known Bugs & Limitations

### Workaround: Building with Git LFS
Due to limitations in Antora, building the online docs isn't as simple as it should be.
This is due to the usage of Git LFS.
Using the repository URLs in the playbook causes images and binary files to not being part of the build result.
This issue is currently being worked on (see [issue #185](https://gitlab.com/antora/antora/-/issues/185)) and should be resolved in Antora 3.x.

In order to build the online docs, you need to clone all content sources yourself in a way that supports Git LFS.
Also, you need to change the content sources in the playbook.
Your build script should look similar to this:

```shell
git clone -b <branch> https://github.com/IsyFact/isy-documentation.git
# ...

npm install
npm run build
```

Similarly, your playbook has to include the local content sources instead of the remote ones:

```yaml
content:
  sources:
    - url: ./isy-documentation
      branches: HEAD # branch already selected in the build script
      start_path: src/docs/antora
    # ...
```

### Workaround: Building behind a company firewall
If you are behind a company firewall, you may need to set additional root CAs to make secure connections work.

Setting additional root CAs can be done [by setting the environment variable `NODE_EXTRA_CA_CERTS`](https://nodejs.org/api/cli.html#node_extra_ca_certsfile), e.g. in your IDE.