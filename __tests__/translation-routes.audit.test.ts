import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';

const APP_ROOT = path.resolve(__dirname, '..');
const NAVIGATOR_FILES = [
  path.join(APP_ROOT, 'src/navigations/RootStackNavigation.tsx'),
  path.join(APP_ROOT, 'src/navigations/BottomTabBar.tsx'),
];
const EXTRA_AUDIT_FILES = [
  path.join(APP_ROOT, 'src/components/subscriptionModal/SubscriptionModal.tsx'),
];

const JSX_ATTR_NAMES = new Set(['placeholder', 'title', 'label', 'accessibilityLabel']);
const USER_VISIBLE_SETTERS = new Set(['setError', 'setErrorText', 'setEventsError', 'showInfoPopup']);

function parseFile(filePath: string) {
  return parse(fs.readFileSync(filePath, 'utf8'), {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function isSuspiciousText(value: string) {
  const normalized = normalizeText(value);
  if (!normalized) return false;
  if (normalized === 'SpotMe') return false;
  if (!/[A-Za-z]/.test(normalized)) return false;
  if (/^https?:\/\//i.test(normalized)) return false;
  if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(normalized)) return false;
  if (/^[A-Z0-9_]+$/.test(normalized)) return false;
  if (/^[#/0-9.,:%€$+\-–— ]+$/.test(normalized)) return false;
  return true;
}

function isInsideTranslationCall(pathRef: NodePath<t.Node>) {
  return Boolean(
    pathRef.findParent((parent) => {
      if (!parent.isCallExpression()) return false;
      const callee = parent.node.callee;
      return (
        (t.isIdentifier(callee) && callee.name === 't') ||
        (t.isMemberExpression(callee) &&
          t.isIdentifier(callee.property) &&
          callee.property.name === 't')
      );
    }),
  );
}

function resolveAuditedFiles() {
  const audited = new Set<string>(EXTRA_AUDIT_FILES);

  for (const navFile of NAVIGATOR_FILES) {
    const ast = parseFile(navFile);
    traverse(ast, {
      ImportDeclaration(importPath) {
        const source = importPath.node.source.value;
        if (
          typeof source === 'string' &&
          (source.startsWith('../screens/') || source.startsWith('../components/'))
        ) {
          const resolved = path.resolve(path.dirname(navFile), source);
          const withExtension = path.extname(resolved) ? resolved : `${resolved}.tsx`;
          if (fs.existsSync(withExtension)) {
            audited.add(withExtension);
          }
        }
      },
    });
  }

  return [...audited].sort();
}

describe('routed screen translations', () => {
  test('navigator-reachable UI does not contain raw user-facing strings', () => {
    const violations: string[] = [];

    for (const filePath of resolveAuditedFiles()) {
      const ast = parseFile(filePath);

      traverse(ast, {
        JSXText(textPath) {
          const value = normalizeText(textPath.node.value);
          if (!isSuspiciousText(value)) return;
          violations.push(`${path.relative(APP_ROOT, filePath)}:${textPath.node.loc?.start.line} JSXText "${value}"`);
        },

        JSXAttribute(attrPath) {
          if (!t.isJSXIdentifier(attrPath.node.name)) return;
          if (!JSX_ATTR_NAMES.has(attrPath.node.name.name)) return;
          if (!t.isStringLiteral(attrPath.node.value)) return;
          const value = normalizeText(attrPath.node.value.value);
          if (!isSuspiciousText(value)) return;
          violations.push(
            `${path.relative(APP_ROOT, filePath)}:${attrPath.node.loc?.start.line} JSXAttribute ${attrPath.node.name.name}="${value}"`,
          );
        },

        JSXExpressionContainer(exprPath) {
          const expr = exprPath.node.expression;
          if (!t.isStringLiteral(expr)) return;
          const value = normalizeText(expr.value);
          if (!isSuspiciousText(value)) return;
          violations.push(`${path.relative(APP_ROOT, filePath)}:${expr.loc?.start.line} JSXString "${value}"`);
        },

        CallExpression(callPath) {
          const callee = callPath.node.callee;
          const args = callPath.node.arguments;

          const isAlert =
            t.isMemberExpression(callee) &&
            t.isIdentifier(callee.object) &&
            callee.object.name === 'Alert' &&
            t.isIdentifier(callee.property) &&
            callee.property.name === 'alert';
          const isSetter = t.isIdentifier(callee) && USER_VISIBLE_SETTERS.has(callee.name);

          if (!isAlert && !isSetter) return;

          args.forEach((arg) => {
            if (!t.isStringLiteral(arg)) return;
            const value = normalizeText(arg.value);
            if (!isSuspiciousText(value)) return;
            if (isInsideTranslationCall(callPath)) return;
            violations.push(`${path.relative(APP_ROOT, filePath)}:${arg.loc?.start.line} CallString "${value}"`);
          });
        },
      });
    }

    expect(violations).toEqual([]);
  });
});
