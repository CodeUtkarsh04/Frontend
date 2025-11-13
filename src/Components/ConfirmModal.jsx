export default function ConfirmModal({ open, title = "Confirm", message, busy = false, onConfirm, onCancel }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
                    <button onClick={onCancel} className="absolute top-3 right-3 text-2xl text-slate-500 hover:text-slate-700">×</button>

                    <div className="text-lg font-semibold mb-2">{title}</div>
                    <div className="text-sm text-slate-600 mb-6">{message}</div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onCancel}
                            disabled={busy}
                            className="rounded-xl px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 transition disabled:opacity-60"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={() => {
                                console.log("ConfirmModal OK clicked");
                                onConfirm && onConfirm();
                            }}
                            disabled={busy}
                            className="rounded-xl px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 transition disabled:opacity-60"
                        >
                            {busy ? "Working…" : "OK"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
