"use client";

import { Pencil, Check, X } from "lucide-react";
import { useState } from "react";

/**
 * EditableField — A field that toggles between display and edit mode.
 * Supports text inputs, selects, textareas, and checkbox.
 */

type EditableFieldProps =
  | {
      label: string;
      type?: "text" | "email" | "tel" | "textarea";
      value: string | undefined;
      onSave: (value: string) => void;
      disabled?: boolean;
      options?: never;
    }
  | {
      label: string;
      type: "select";
      value: string | undefined;
      options: { value: string; label: string }[];
      onSave: (value: string) => void;
      disabled?: boolean;
    }
  | {
      label: string;
      type: "checkbox";
      value: boolean | undefined;
      onSave: (value: boolean) => void;
      disabled?: boolean;
      options?: never;
    };

export function EditableField(props: EditableFieldProps) {
  const { label, disabled } = props;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string | boolean>(props.value ?? (props.type === "checkbox" ? false : ""));

  const startEdit = () => {
    setDraft(props.value ?? (props.type === "checkbox" ? false : ""));
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setDraft(props.value ?? (props.type === "checkbox" ? false : ""));
  };

  const save = () => {
    if (props.type === "checkbox") {
      props.onSave(draft as boolean);
    } else {
      props.onSave(draft as string);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && props.type !== "textarea") save();
    if (e.key === "Escape") cancel();
  };

  // Display value
  const displayValue = props.type === "checkbox"
    ? (props.value ? "Yes" : "No")
    : (props.type === "select" && props.options
      ? (props.options.find((o) => o.value === props.value)?.label || props.value)
      : props.value);

  // Display mode
  if (!editing) {
    return (
      <div className="py-2.5 border-b border-[rgba(61,61,61,0.04)] last:border-0 group">
        <dt className="font-body text-[11px] font-medium uppercase tracking-wider text-ansar-muted mb-0.5">
          {label}
        </dt>
        <dd className="font-body text-sm text-ansar-charcoal flex items-center justify-between gap-2">
          <span className="flex-1 min-w-0">
            {displayValue || <span className="text-ansar-muted italic">Not set</span>}
          </span>
          {!disabled && (
            <button
              onClick={startEdit}
              className="opacity-0 group-hover:opacity-100 p-1 text-ansar-muted hover:text-ansar-sage-600 hover:bg-ansar-sage-50 rounded transition-all"
              title="Edit"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </dd>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="py-2.5 border-b border-[rgba(61,61,61,0.04)] last:border-0">
      <dt className="font-body text-[11px] font-medium uppercase tracking-wider text-ansar-sage-600 mb-1">
        {label}
      </dt>
      <dd className="flex items-start gap-2">
        {props.type === "select" ? (
          <select
            value={draft as string}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 px-2.5 py-1.5 bg-white border border-ansar-sage-300 rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:border-ansar-sage-500 focus:ring-2 focus:ring-ansar-sage-100"
          >
            {props.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : props.type === "textarea" ? (
          <textarea
            value={draft as string}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            rows={3}
            className="flex-1 px-2.5 py-1.5 bg-white border border-ansar-sage-300 rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:border-ansar-sage-500 focus:ring-2 focus:ring-ansar-sage-100 resize-none"
          />
        ) : props.type === "checkbox" ? (
          <label className="flex items-center gap-2 cursor-pointer flex-1 py-1">
            <input
              type="checkbox"
              checked={draft as boolean}
              onChange={(e) => setDraft(e.target.checked)}
              className="w-4 h-4 rounded border-ansar-sage-300 text-ansar-sage-600 focus:ring-ansar-sage-500"
            />
            <span className="font-body text-sm text-ansar-charcoal">{draft ? "Yes" : "No"}</span>
          </label>
        ) : (
          <input
            type={props.type || "text"}
            value={draft as string}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 px-2.5 py-1.5 bg-white border border-ansar-sage-300 rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:border-ansar-sage-500 focus:ring-2 focus:ring-ansar-sage-100"
          />
        )}
        <div className="flex items-center gap-0.5 pt-1">
          <button
            onClick={save}
            className="p-1 text-ansar-sage-600 hover:bg-ansar-sage-50 rounded transition-colors"
            title="Save"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={cancel}
            className="p-1 text-ansar-muted hover:text-ansar-error hover:bg-red-50 rounded transition-colors"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </dd>
    </div>
  );
}
