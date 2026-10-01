#!/usr/bin/env python3
"""Expand shared partials into the pages, in place.

Each page marks a region like this:

    <!-- #include header current="study" -->
    ...generated, do not hand-edit...
    <!-- /include -->

and this script rewrites what sits between the markers from partials/<name>.html.
Everything outside the markers is yours to edit by hand. Running it twice in a
row produces no change.

Partials may use three placeholders:
    {{key}}                the value of that attribute on the include, or ''
    {{aria:value}}         ' aria-current="page"' when current == value
    {{group:a|b|c}}        ' data-active="true"' when current is one of a, b, c
                           (for a nav item that stands for a group of pages)

No dependencies. Run it after editing anything in partials/:

    python3 build.py            # rewrite the pages
    python3 build.py --check    # exit 1 if a page is out of date (for CI)
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).parent
PARTIALS = ROOT / 'partials'

OPEN = re.compile(
    r'(?P<indent>[ \t]*)<!--\s*#include\s+(?P<name>[\w-]+)(?P<attrs>[^>]*?)-->'
    r'.*?'
    r'[ \t]*<!--\s*/include\s*-->',
    re.S,
)
ATTR = re.compile(r'(\w+)="([^"]*)"')


def render(name, attrs):
    text = (PARTIALS / (name + '.html')).read_text(encoding='utf-8').rstrip('\n')
    current = attrs.get('current')
    text = re.sub(
        r'\{\{aria:([\w-]+)\}\}',
        lambda m: ' aria-current="page"' if current == m.group(1) else '',
        text,
    )
    text = re.sub(
        r'\{\{group:([\w|-]+)\}\}',
        lambda m: ' data-active="true"' if current in m.group(1).split('|') else '',
        text,
    )
    text = re.sub(r'\{\{([\w-]+)\}\}', lambda m: attrs.get(m.group(1), ''), text)
    return text


def expand(source):
    def replace(match):
        indent = match.group('indent')
        name = match.group('name')
        attrs = dict(ATTR.findall(match.group('attrs')))
        body = render(name, attrs)
        lines = [(indent + line if line.strip() else line) for line in body.split('\n')]
        attr_text = ''.join(' %s="%s"' % kv for kv in sorted(attrs.items()))
        return (
            '%s<!-- #include %s%s -->\n%s\n%s<!-- /include -->'
            % (indent, name, attr_text, '\n'.join(lines), indent)
        )

    return OPEN.sub(replace, source)


def main():
    check = '--check' in sys.argv
    stale = []
    for page in sorted(ROOT.glob('*.html')):
        before = page.read_text(encoding='utf-8')
        after = expand(before)
        used = [m.group('name') for m in OPEN.finditer(before)]
        if before == after:
            print('  %-18s %s' % (page.name, ' '.join(used) or 'no includes'))
            continue
        stale.append(page.name)
        if check:
            print('  %-18s OUT OF DATE' % page.name)
        else:
            page.write_text(after, encoding='utf-8')
            print('  %-18s updated: %s' % (page.name, ' '.join(used)))

    if check and stale:
        print('\nstale: %s — run python3 build.py' % ', '.join(stale))
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
