/*
 * Copyright 2014 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

/// <reference path='../../lib/tslint.d.ts' />

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING_PREFIX = "variable '";
    public static FAILURE_STRING_POSTFIX = "' used before declaration";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        console.log(sourceFile.filename);
        var documentRegistry = ts.createDocumentRegistry();
        var languageServiceHost = Lint.createLanguageServiceHost("/Users/aramaswamy/dev/tslint/test/files/rules/nousebeforedeclare.test.ts2", sourceFile.getFullText());
        var languageService = ts.createLanguageService(languageServiceHost, documentRegistry);

        return this.applyWithWalker(new NoUseBeforeDeclareWalker(sourceFile, this.getOptions(), languageService));
    }
}

class NoUseBeforeDeclareWalker extends Lint.RuleWalker {
    private languageService: ts.LanguageService;

    constructor(sourceFile: ts.SourceFile, options: Lint.IOptions, languageService: ts.LanguageService) {
        super(sourceFile, options);
        this.languageService = languageService;
    }

    public visitImportDeclaration(node: ts.ImportDeclaration): void {
        node.getChildren().forEach((child) => {
            if (child.kind === ts.SyntaxKind.Identifier) {
                this.validateUsageForVariable(child.getText(), child.getStart());
            }
        });

        super.visitImportDeclaration(node);
    }

    public visitVariableDeclaration(node: ts.VariableDeclaration): void {
        this.validateUsageForVariable(node.name.text, node.getStart());

        super.visitVariableDeclaration(node);
    }

    private validateUsageForVariable(name: string, position: number) {
        var references = this.languageService.getReferencesAtPosition("/Users/aramaswamy/dev/tslint/test/files/rules/nousebeforedeclare.test.ts2", position);
        if (references) {
            references.forEach((reference) => {
                var referencePosition = reference.textSpan.start();
                if (referencePosition < position) {
                    var failureString = Rule.FAILURE_STRING_PREFIX + name + Rule.FAILURE_STRING_POSTFIX;
                    var failure = this.createFailure(referencePosition, name.length, failureString);
                    this.addFailure(failure);
                }
            });
        }
    }
}
