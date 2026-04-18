"use client";

import { useEffect, useRef } from "react";
import { EditorState, Prec } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { sql, PostgreSQL } from "@codemirror/lang-sql";
import {
  HighlightStyle,
  bracketMatching,
  defaultHighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { tags as t } from "@lezer/highlight";

// Brand-palette highlight style.
// Dusk surface (#3E5570) + Pale Oak / cream text (#F5F1E5 base),
// warm accents that echo the markdown code blocks used in lesson theory.
const sqlearnHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.modifier], color: "#EAD4C0", fontWeight: "600" },
  { tag: [t.controlKeyword, t.operatorKeyword], color: "#EAD4C0", fontWeight: "600" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#F3C9A6" },
  { tag: [t.string, t.special(t.string)], color: "#D8B7C4" },
  { tag: t.number, color: "#D6C59A" },
  { tag: t.bool, color: "#D6C59A", fontStyle: "italic" },
  { tag: t.null, color: "#D6C59A", fontStyle: "italic" },
  { tag: [t.lineComment, t.blockComment], color: "#94A3B8", fontStyle: "italic" },
  { tag: [t.operator, t.punctuation], color: "#C0CBD9" },
  { tag: [t.paren, t.brace, t.bracket, t.squareBracket], color: "#C0CBD9" },
  { tag: [t.variableName, t.name], color: "#F5F1E5" },
  { tag: [t.typeName, t.className], color: "#EFC99E" },
  { tag: t.atom, color: "#D8B7C4" },
  { tag: t.meta, color: "#A6B2C3" },
]);

const sqlearnTheme = EditorView.theme(
  {
    "&": {
      color: "#F5F1E5",
      backgroundColor: "transparent",
      fontSize: "0.9375rem",
      height: "100%",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, monospace",
      lineHeight: "1.7",
      padding: "0.75rem 0",
    },
    ".cm-content": {
      caretColor: "#EAD4C0",
      padding: "0 1.1rem",
    },
    "&.cm-focused": { outline: "none" },
    "&.cm-focused .cm-cursor": { borderLeftColor: "#EAD4C0" },
    "&.cm-focused .cm-selectionBackground, ::selection, .cm-selectionBackground": {
      backgroundColor: "rgba(234, 212, 192, 0.18)",
    },
    ".cm-gutters": {
      backgroundColor: "transparent",
      borderRight: "none",
      color: "rgba(245, 241, 229, 0.35)",
      paddingRight: "0.25rem",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      padding: "0 0.65rem 0 0.85rem",
      fontVariantNumeric: "tabular-nums",
      fontSize: "0.75rem",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: "rgba(234, 212, 192, 0.9)",
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(245, 241, 229, 0.04)",
    },
    ".cm-matchingBracket, .cm-nonmatchingBracket": {
      backgroundColor: "rgba(234, 212, 192, 0.14)",
      outline: "none",
    },
    ".cm-tooltip": {
      background: "#2C3E55",
      color: "#F5F1E5",
      border: "1px solid rgba(245,241,229,0.1)",
      borderRadius: "8px",
      boxShadow: "0 10px 28px -12px rgba(0,0,0,0.4)",
      overflow: "hidden",
    },
    ".cm-tooltip.cm-tooltip-autocomplete > ul": {
      fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, monospace",
      fontSize: "0.8125rem",
      maxHeight: "18rem",
    },
    ".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
      padding: "0.35rem 0.75rem",
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
      background: "rgba(234, 212, 192, 0.18)",
      color: "#F5F1E5",
    },
    ".cm-completionLabel": { color: "#F5F1E5" },
    ".cm-completionMatchedText": {
      color: "#EAD4C0",
      textDecoration: "none",
      fontWeight: "600",
    },
    ".cm-completionDetail": {
      color: "rgba(245,241,229,0.55)",
      fontStyle: "normal",
      marginLeft: "0.75rem",
    },
    ".cm-placeholder": {
      color: "rgba(245,241,229,0.4)",
      fontStyle: "italic",
    },
  },
  { dark: true },
);

function baseExtensions() {
  return [
    lineNumbers(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    history(),
    drawSelection(),
    dropCursor(),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    rectangularSelection(),
    crosshairCursor(),
    autocompletion({
      activateOnTyping: true,
      closeOnBlur: true,
      icons: false,
    }),
    sql({ dialect: PostgreSQL, upperCaseKeywords: true }),
    syntaxHighlighting(sqlearnHighlight),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    sqlearnTheme,
    EditorView.lineWrapping,
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...historyKeymap,
      ...completionKeymap,
      indentWithTab,
    ]),
  ];
}

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  placeholder?: string;
  ariaLabel?: string;
}

export function SqlEditor({
  value,
  onChange,
  onRun,
  placeholder,
  ariaLabel = "SQL editor",
}: SqlEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);

  // Keep callbacks current without re-creating the editor state.
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  useEffect(() => {
    if (!hostRef.current) return;

    const runKeymap = Prec.high(
      keymap.of([
        {
          key: "Mod-Enter",
          preventDefault: true,
          run: () => {
            onRunRef.current?.();
            return true;
          },
        },
      ]),
    );

    const listener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        runKeymap,
        listener,
        ...baseExtensions(),
        ...(placeholder
          ? [
              EditorView.contentAttributes.of({
                "aria-label": ariaLabel,
                "data-placeholder": placeholder,
              }),
            ]
          : [
              EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
            ]),
      ],
    });

    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // We intentionally mount once; doc updates come through the imperative
    // dispatch below so the user's caret + history survive external resets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect external value changes (Reset / exercise switch) without
  // obliterating the user's own edits on every keystroke.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
  }, [value]);

  return (
    <div
      ref={hostRef}
      className="sqlearn-editor h-full w-full"
      data-empty={value.length === 0 ? "true" : "false"}
    />
  );
}
