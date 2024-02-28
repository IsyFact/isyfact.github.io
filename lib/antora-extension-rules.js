'use strict'

const {EOL} = require('os');
const ARCHITECTURE_RULE = 'Architektur';
const SECURITY_RULE = 'Sicherheit';

/**
 * Extension for creating the Architecture and Security rule summary pages.
 * Searches for Files 'summaryArchitectureRules.adoc' and 'summarySecurityRules.adoc'.
 * If summary pages are needed, these files have to be present in the Antora component version
 * (e.g. Antora component 'isyfact-standards-doku', version '3.0.0').
 * The nav.adoc for the same module as where the summary pages are found, is searched, too.
 * It has to be present, but the entries for the links to the summary pages are generated.
 * It is possible only to have one of the summaryXYRules.adoc files. Then only the contents for
 * the summaryRules.adoc file found is generated. Additionally, only a link to this one summaryRules file
 * is added to nav.adoc.
 *
 * Architecture rules are identified as those if they are marked with '.icon:university['
 * and the word 'Architektur' in the same line.
 * Security rules are identified as those if they are marked with '.icon:shield['
 * and the word 'Sicherheit' in the same line.
 *
 * The summary pages are generated for an Antora component and version (if the summaryXYRules.adoc files
 * are present for this version). This means, that the component isyfact-standards-doku has different
 * summary pages than isyfact-jsf-doku. And version 3.0.0 of isyfact-standards-doku has different
 * summary pages than version 3.1.0.
 */
module.exports.register = function ({config}) {

    const logger = this.getLogger('antora-extension-rules');

    this
        .on('contentClassified', function () {

            const {contentCatalog} = this.getVariables();

            let excludeFiles = config.excludefiles;

            const FILENAME_SUMMARY_ARCHITECTURE = 'summaryArchitectureRules';
            const FILENAME_SUMMARY_SECURITY = 'summarySecurityRules';

            contentCatalog.getComponents().forEach(({versions}) => {
                versions.forEach(({name: component, version}) => {

                    logger.info('Name and Version of Component: ' + component + ' ' + version);

                    const allPagesPerVersion =
                        getAllPagesPerVersion(contentCatalog, component, version, excludeFiles, logger);

                    let summaryPageArchitecture =
                        allPagesPerVersion.filter((page) => page.stem == FILENAME_SUMMARY_ARCHITECTURE)[0];
                    let summaryPageSecurity =
                        allPagesPerVersion.filter((page) => page.stem == FILENAME_SUMMARY_SECURITY)[0];

                    if (!summaryPageArchitecture && !summaryPageSecurity) {
                        return false;
                    }

                    let rulesFoundArchitecture;
                    let rulesFoundSecurity;
                    if (summaryPageArchitecture) {
                        rulesFoundArchitecture = fillSummaryPage(allPagesPerVersion, summaryPageArchitecture,
                            ARCHITECTURE_RULE, logger);
                    }
                    if (summaryPageSecurity) {
                        rulesFoundSecurity = fillSummaryPage(allPagesPerVersion, summaryPageSecurity,
                            SECURITY_RULE, logger);
                    }

                    createNavFileEntries(contentCatalog, component, version,
                        summaryPageArchitecture, summaryPageSecurity,
                        rulesFoundArchitecture, rulesFoundSecurity, logger);

                }) // end versions
            })  // end components

            logger.info('End summary rule extension');
        })
}

/**
 * Gets all .adoc-Files out of one Antora component version.
 * Exception: Does not collect certain documentation pages because rules therein are only examples and
 * no real rules.
 *
 * @param {ContentCatalog} contentCatalog The content catalog of the Antora environment.
 * @param {String} component Name of Antora component.
 * @param {String} version Version of Antora component.
 * @param {Object} logger Logger of Antora environment.
 *
 * @returns {Array} All AsciiDoc-Files of one Antora component version.
 */
function getAllPagesPerVersion(contentCatalog, component, version, excludeFiles, logger) {

    let allPagesPerVersion = [];

    allPagesPerVersion = contentCatalog
        .findBy({component, version, family: 'page'})
        .filter((page) => page.out && page.mediaType === 'text/asciidoc'
            && !(excludeFiles.includes(page.stem)))
        .reduce((collector, page) => {
            return collector.concat(page)
        }, []);
    logger.info('No. Asciidoc-Files: ' + allPagesPerVersion.length);

    return allPagesPerVersion;
}

/**
 * Extract all rules of type Architecture or Security for all pages
 * of one Antora component version and append the rules found
 * to the Architecture or Security Rules Summary Page.
 *
 * @param {Array} allPagesPerVersion All .adoc-Files of an Antora component version.
 * @param {File} summaryPage Summary Page for Architecture or Security rules.
 * @param {String} ruleType Architecture or Security rules.
 * @param {Object} logger Logger of Antora environment.
 *
 * @returns {Boolean} True if rules have been appended to summary page.
 */
function fillSummaryPage(allPagesPerVersion, summaryPage, ruleType, logger){
    let rulesFound;

    let contentsString = createRuleSummaryContent(allPagesPerVersion, ruleType, logger);
    if(contentsString.length > 1){
        rulesFound = true;
    }
    summaryPage.contents = Buffer.concat([summaryPage.contents, Buffer.from(contentsString)]);

    return rulesFound;
}

/**
 * Extract all rules of type Architecture or Security for all pages
 * of one Antora component version.
 *
 * @param {Array} allPagesPerVersion All .adoc-Files of an Antora component version.
 * @param {String} ruleType Architecture or Security rules.
 * @param {Object} logger Logger of Antora environment.
 *
 * @returns {String} Rules of type Architecture or Security found in all pages of an Antora component version.
 * Empty string if no rule found.
 */
function createRuleSummaryContent(allPagesPerVersion, ruleType, logger){
    let numberRules = 0;
    let rules;
    let rulesString = '';

    allPagesPerVersion.forEach((page) => {
            rules = extractRules(page.contents.toString(), ruleType);
            if (rules) {
                logger.debug('Rules found in File: ' + page.src.path);
                numberRules += rules.length;
                for (var i = 0; i < rules.length; i++) {
                    rulesString += rules[i] + EOL;
                }
            }
        }
    );
    logger.info('No. rules ' + ruleType + ': ' + numberRules);

    return rulesString;
}

/**
 * Searches the contents of a .adoc-Page for
 * Architecture or Security rules.
 *
 * @param {String} contents Contents of a .adoc-File.
 * @param {String} ruleType Architecture- or Security-Rules.
 *
 * @returns {Array} Rules found in contents.
 */
function extractRules(contents, ruleType) {

    const ICON_ARCHITECTURE = ".icon:university\\[.*";
    const ICON_SECURITY = ".icon:shield\\[.*";
    const RULES_PATTERN = ".*" + EOL + "\\*{4}" + EOL + "(.|" + EOL + ")+?\\*{4}" + EOL;

    let rulePattern = new RegExp("");

    if(ARCHITECTURE_RULE == ruleType){
        rulePattern = new RegExp(ICON_ARCHITECTURE + ruleType + RULES_PATTERN, 'g');
    }
    if(SECURITY_RULE == ruleType){
        rulePattern = new RegExp(ICON_SECURITY + ruleType + RULES_PATTERN, 'g');
    }

    return contents.match(rulePattern);
}

/**
 * Creates entries for the component navigation to access the summary pages.
 * No action, if no rules are found for the Antora component and version.
 *
 * @param {ContentCatalog} contentCatalog The content catalog of the Antora environment.
 * @param {String} component Name of Antora component.
 * @param {String} version Version of Antora component.
 * @param {File} summaryPageArchitecture Summary Page for Architecture rules.
 * @param {File} summaryPageSecurity Summary Page for Security rules.
 * @param {Boolean} rulesFoundArchitecture True if Architecture rules are found.
 * @param {Boolean} rulesFoundSecurity True if Security rules are found.
 * @param {Object} logger Logger of Antora environment.
 *
 */
function createNavFileEntries(contentCatalog, component, version,
                              summaryPageArchitecture, summaryPageSecurity,
                              rulesFoundArchitecture, rulesFoundSecurity, logger){

    if(!rulesFoundArchitecture && !rulesFoundSecurity){
        return;
    }

    let navFile =
        getNavFile(contentCatalog, component, version, summaryPageArchitecture, summaryPageSecurity, logger);

    addLinksForSummaryRules(navFile, rulesFoundArchitecture, rulesFoundSecurity,
        summaryPageArchitecture, summaryPageSecurity, logger);

    return;
}

/**
 * Looks for the nav.adoc for the same module as for the summary pages.
 * summaryPageArchitecture and summaryPageSecurity are not both null
 * and have the same nav.adoc and module.
 * It is assumed that nav.adoc is present for this module.
 *
 * @param {ContentCatalog} contentCatalog The content catalog of the Antora environment.
 * @param {String} component Name of Antora component.
 * @param {String} version Version of Antora component.
 * @param {File} summaryPageArchitecture Summary Page for Architecture rules.
 * @param {File} summaryPageSecurity Summary Page for Security rules.
 * @param {Object} logger Logger of Antora environment.
 *
 * @returns {File} nav.adoc which is found.
 */
function getNavFile(contentCatalog, component, version,
                    summaryPageArchitecture, summaryPageSecurity, logger) {

    let moduleSummaryPages;

    if (summaryPageArchitecture) {
        moduleSummaryPages = summaryPageArchitecture.src.module;
    } else {
        moduleSummaryPages = summaryPageSecurity.src.module;
    }

    let navFile = contentCatalog
        .findBy({component, version, family: 'nav'})
        .filter((navFile) => moduleSummaryPages == navFile.src.module)[0];
    logger.info('Name nav.adoc: ' + navFile.src.path);

    return navFile;
}

/**
 * Adds links in nav.adoc for summary rule pages, if rules are found.
 * SummaryRulePages for 'Architektur' and 'IT-Sicherheit'.
 *
 * @param {File} navFile nav.adoc for summary rule pages.
 * @param {Boolean} rulesFoundArchitecture True if Architecture rules are found.
 * @param {Boolean} rulesFoundSecurity True if Security rules are found.
 * @param {File} summaryPageArchitecture Summary Page for Architecture rules.
 * @param {File} summaryPageSecurity Summary Page for Security rules.
 * @param {Object} logger Logger of Antora environment.
 *
 */
function addLinksForSummaryRules(navFile, rulesFoundArchitecture, rulesFoundSecurity,
                                 summaryPageArchitecture, summaryPageSecurity, logger) {

    const VORGABEN = Buffer.from("** Vorgaben" + EOL);
    const LINKTEXT_ARCHITECTURE = "Architektur";
    const LINKTEXT_SECURITY  = "IT-Sicherheit";

    navFile.contents = Buffer.concat([navFile.contents, VORGABEN]);

    if(rulesFoundArchitecture){
        addLinkForSummaryRules(navFile, summaryPageArchitecture, LINKTEXT_ARCHITECTURE, logger);
    }

    if(rulesFoundSecurity){
        addLinkForSummaryRules(navFile, summaryPageSecurity, LINKTEXT_SECURITY, logger);
    }

    return;
}

/**
 * Adds link in nav.adoc for one summary rule page.
 *
 * @param {File} navFile nav.adoc for summary rule pages.
 * @param {File} summaryPage Summary Page.
 * @param {String} linkText Linktext for summary rule page.
 * @param {Object} logger Logger of Antora environment.
 *
 */
function addLinkForSummaryRules(navFile, summaryPage, linkText, logger){

    let linkToSummary =
        Buffer.from("*** xref:" + summaryPage.src.relative + "[" + linkText + "]" + EOL);
    navFile.contents = Buffer.concat([navFile.contents, linkToSummary]);
    logger.info('Link to summary of rules: ' + linkToSummary);

    return;
}
