# Generate Templates Action

This Composite Action is designed to automate the generation of documentation templates using Maven.
It is optimized for high-performance CI/CD pipelines by utilizing intelligent caching to minimize build times.

## Overview

The action executes a `mvn package` command within a specific Maven module.
Source files for template generation are placed within project `IsyFact/isyfact-standards` in the doc-module, which is `isyfact-standards-doc` by default.
To avoid redundant and time-consuming Maven executions, it implements a **smart caching strategy**.

A rebuild is only triggered if:
1. The `pom.xml` of the doc-module has changed.
2. Files in any of following directories have been modified:
    - `vorlage-systementwurf`
    - `vorlage-systemhandbuch`
    - `vorlage-systemspezifikation`

This ensures that changes to other parts of the documentation (e.g., standard `.adoc` files) do not trigger a full template regeneration, saving significant time in the build process.

**NOTE:** By convention, files used for template generation (.adoc, images etc.) are placed in directories named `vorlage-<template name>`.

## Inputs

| Parameter | Description | Required | Default |
| :--- | :--- | :---: | :--- |
| `version_build_dir` | The directory of the version build (e.g., `isyfact-standards-5.0.2` or `develop`). | **Yes** | - |
| `doc_module_name` | The name of the Maven document module. | No | `isyfact-standards-doc` |
| `cache_sub_path` | The sub-path within the module where templates are generated. | No | `src/docs/antora/modules/methodik/attachments/vorlage-generated` |
| `disable_cache` | Disables caching entirely (useful for testing or ensuring a clean build). | No | `false` |

## Usage

### Standard Workflow Integration
To use this action in a standard workflow (e.g., during a release or a scheduled build), include it as a step in your job:

```yaml
- name: Generate Templates (Version 5.0.2)
  uses: ./.github/actions/generate-templates
  with:
    version_build_dir: isyfact-standards-5.0.2
```