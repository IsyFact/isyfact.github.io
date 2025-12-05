[![Links](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/IsyFactTeam/3a204eb8dda02ce05271d355aa4db40a/raw/link_check_percentage.json)](https://github.com/IsyFact/isyfact.github.io/actions/workflows/link_checker.yml)

# IsyFact Online Docs

This repository contains GitHub actions to build and publish the online docs at https://isyfact.github.io via GitHub Pages.

Additionally, this repository contains the Antora playbooks, Antora extensions and a customized UI for the IsyFact online docs.
There are two playbooks:
- `antora-playbook.yml`: For CI/CD-based builds in GitHub Actions.
- `antora-playbook-local.yml`: For [local testing and development](#local-testing-and-development).

## Prerequisites
The documentation is written in [AsciiDoc](https://docs.asciidoctor.org/asciidoc/latest/) and uses [Antora](https://antora.org/) to build a static HTML site for easy browsing.

To build the online docs yourself, you need the following prerequisites:
- **Git LFS**: For repositories that use Git Large File Storage. [Installation Guide](https://git-lfs.com/).
- **Node.js & npm**: For running Antora and managing JavaScript dependencies. You should use a version manager (i.e. [nvm for Windows](https://github.com/coreybutler/nvm-windows) or [nvm for Linux/macOS](https://github.com/nvm-sh/nvm)), or you can install both manually for your OS. Please use at least the latest LTS version.

## Local Testing and Development
The playbook at `antora-playbook-local.yml` provides a local environment to test your feature branches against the online documentation. 
It features all active development branches and the latest release tags of all repositories which contain documentation.

All you have to do is add your feature branches to the playbook, run `npm install`, followed by `npm run build:local`.

> [!TIP]
> Recommendation: Check out this repository side-by-side with the repositories you're working on!

To add your feature branches, simply add a content source like this to `antora-playbook-local.yml`:
```yaml
- url: ../{path-to-your-repo}
  branches: HEAD
  version:
    'feature/(*)': $1 
```

> [!IMPORTANT]
> The build will contain errors at this point, because the template documents aren't built properly. They still require a Maven build which doesn't happen inside Antora. 
> The errors look like this and can be safely ignored for now:
> ```
> ERROR (asciidoctor): target of xref not found: methodik:attachment$vorlage-generated/
>                          IsyFact-Vorlage-Systementwurf.zip
> ERROR (asciidoctor): target of xref not found: methodik:attachment$vorlage-generated/
>                          IsyFact-Vorlage-Systementwurf.pdf
> ERROR (asciidoctor): target of xref not found: methodik:attachment$vorlage-generated/
>                          IsyFact-Vorlage-Systemhandbuch.zip
> ERROR (asciidoctor): target of xref not found: methodik:attachment$vorlage-generated/
>                          IsyFact-Vorlage-Systemhandbuch.pdf
> ```

## Known Bugs & Limitations

### Workaround: Building with Git LFS

Due to limitations in Antora, building the online docs isn't as simple as it should be.
This is due to the usage of Git LFS.
Using the repository URLs in the playbook causes images and binary files to not being part of the build result.
This issue is currently being worked on (see [issue #185](https://gitlab.com/antora/antora/-/issues/185)) and should be resolved in Antora 3.x.

#### Local Testing and Development
The local build uses the [Antora Git Large File Storage (LFS) Extension](https://gitlab.com/opendevise/oss/antora-binary-files-extension-suite/-/tree/main/packages/git-lfs-extension?ref_type=heads) by OpenDevise.
The extension is able to resolve Git LFS objects by using the `git` executable of the environment instead of `isomorphic-git` which is packaged inside Antora.
However, it is currently limited to one branch or commit (tags won't work!) per content source.
This is reflected in the playbook `antora-playbook-local.yml`.

> [!NOTE]
> It is planned to use this approach for the production build as well.

#### Production Build

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

## Setting Up the Dynamic Badge for Link Checker

The Link Checker workflow now calculates the percentage of correct links and generates a dynamic badge. This badge shows the percentage of correct links along with the number of correct and incorrect links.

### Configuring the Badge with Gist

To enable the dynamic badge, follow these steps:

1. **Create a Gist:**
    - Go to [gist.github.com](https://gist.github.com/).
    - Create a new Gist named `link_check_percentage.json` (the name and content can be anything initially).
    - Note the Gist ID, which is the long alphanumeric part of the Gist URL.

2. **Set Up Repository Variables and Secrets:**
    - **GIST_ID (Repository Variable):**  
      Add the Gist ID (e.g., `8f6459c2417de7534f64d98360dde866`) as a variable named `GIST_ID` in the repository settings.

    - **GIST_AUTH (Repository Secret):**  
      Create a personal access token with the `gist` scope. Add this token as a secret in the repository settings with the name `GIST_AUTH`.

3. **Usage in Workflow:**
    - The workflow uses these variables to update the dynamic badge with the percentage of correct links:
      ```yaml
      - name: Update dynamic badge for correct links percentage
        if: ${{ env.GIST_AUTH != '' && env.GIST_ID != '' }}
        env:
          GIST_AUTH: ${{ secrets.GIST_AUTH }}
          GIST_ID: ${{ vars.GIST_ID }}
        uses: schneegans/dynamic-badges-action@v1.7.0
        with:
          auth: ${{ env.GIST_AUTH }}
          gistID: ${{ env.GIST_ID }}
          filename: link_check_percentage.json
          label: "🔗 Links"
          message: "${{ env.CORRECT_LINKS_PERCENTAGE }}% correct (Correct: ${{ env.CORRECT }}, Incorrect: ${{ env.INCORRECT }})"
          valColorRange: ${{ env.CORRECT_LINKS_PERCENTAGE }}
          minColorRange: 0
          maxColorRange: 100
      ```

4. **Add the Badge to README:**
    - Include the badge in your `README.md`:
      ```markdown
      [![Links](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/<your-username>/<gist-ID>/raw/link_check_percentage.json)](https://github.com/IsyFact/isyfact.github.io/actions/workflows/link_checker.yml)
      ```
    - For example:
      ```markdown
      [![Links](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/huy-tran-msg/cd34647bc4a492cb10e296417a0c612c/raw/link_check_percentage.json)](https://github.com/IsyFact/isyfact.github.io/actions/workflows/link_checker.yml)
      ```
      
This setup will display a real-time percentage of correct links in your README, keeping the health of your documentation links visible.