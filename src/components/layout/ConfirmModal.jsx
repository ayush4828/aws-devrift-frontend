import { useEffect } from "react";

/**
 * Reusable confirmation modal.
 *
 * Props:
 *  - isOpen     {boolean}   whether the modal is visible
 *  - onConfirm  {function}  called when the user clicks the confirm button
 *  - onCancel   {function}  called when the user clicks cancel or the backdrop
 *  - title      {string}    bold headline inside the modal
 *  - message    {string}    body text / warning details
 *  - confirmLabel {string}  label for the destructive button (default "Confirm")
 *  - danger     {boolean}   if true, confirm button uses error colour (default true)
 */
const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  danger = true,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={onCancel}
      aria-modal="true"
      role="dialog"
    >
      {/* Dimmed background */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal panel */}
      <div
        className="relative z-10 w-full max-w-md mx-4 bg-surface-container-low border border-outline-variant/50 rounded-2xl shadow-2xl p-xl flex flex-col gap-lg animate-[scale-in_0.15s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon + Title */}
        <div className="flex items-start gap-md">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${danger ? "bg-error/15" : "bg-primary/10"}`}>
            <i className={`fa-solid ${danger ? "fa-triangle-exclamation text-error" : "fa-circle-info text-primary"} text-lg`}></i>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-white leading-tight mb-xs">{title}</h3>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-outline-variant/30" />

        {/* Action buttons */}
        <div className="flex gap-md justify-end">
          <button
            onClick={onCancel}
            className="px-lg py-sm font-bold font-label-caps text-label-caps text-on-surface-variant border border-outline-variant/50 rounded-lg hover:bg-surface-container-high hover:text-white transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-lg py-sm font-bold font-label-caps text-label-caps rounded-lg transition-all active:scale-95 ${
              danger
                ? "bg-error text-on-error hover:brightness-110 shadow-lg shadow-error/20"
                : "bg-primary text-on-primary hover:brightness-110 shadow-lg shadow-primary/20"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
