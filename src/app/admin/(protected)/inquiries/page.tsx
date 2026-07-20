import { addInquiryNoteAction, updateInquiryAction } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin-shell";
import { StatusBadge } from "@/components/ui";
import { getAdminInquiries, getInquiryNotes } from "@/lib/data";

export default async function AdminInquiriesPage() {
  const [inquiries, notes] = await Promise.all([getAdminInquiries(), getInquiryNotes()]);
  return (
    <>
      <AdminPageHeader eyebrow="Sales workflow" title="Inquiries" description="Review private customer requests, track follow-up status and add internal notes." />
      <div className="grid gap-5">
        {inquiries.map((inquiry) => {
          const inquiryNotes = notes.filter((note) => note.inquiry_id === inquiry.id);
          return (
            <article key={inquiry.id} className="surface-card p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-[#072a47]">{inquiry.customerName}</h2>
                    <StatusBadge tone={inquiry.status === "spam" ? "danger" : inquiry.status === "closed" ? "neutral" : "warning"}>{inquiry.status}</StatusBadge>
                  </div>
                  <p className="mt-2 text-sm text-[#5b6e7a]">{inquiry.city} · {new Date(inquiry.submittedAt).toLocaleString("en-IN")}</p>
                </div>
                <form action={updateInquiryAction} className="flex items-end gap-2">
                  <input type="hidden" name="id" value={inquiry.id} />
                  <div className="field"><label htmlFor={`status-${inquiry.id}`}>Status</label><select id={`status-${inquiry.id}`} name="status" defaultValue={inquiry.status}><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="closed">Closed</option><option value="spam">Spam</option></select></div>
                  <button className="mb-px min-h-11 rounded-xl bg-[#072a47] px-4 text-sm font-semibold text-white">Update</button>
                </form>
              </div>
              <dl className="mt-6 grid gap-4 rounded-2xl bg-[#f6fafc] p-5 text-sm sm:grid-cols-2">
                <div><dt className="font-semibold text-[#6b7e8a]">Phone</dt><dd className="mt-1 text-[#172633]">{inquiry.phone}</dd></div>
                <div><dt className="font-semibold text-[#6b7e8a]">Email</dt><dd className="mt-1 text-[#172633]">{inquiry.email || "Not supplied"}</dd></div>
                <div><dt className="font-semibold text-[#6b7e8a]">Quantity</dt><dd className="mt-1 text-[#172633]">{inquiry.requiredQuantity}</dd></div>
                <div><dt className="font-semibold text-[#6b7e8a]">Source</dt><dd className="mt-1 text-[#172633]">{inquiry.sourcePage}</dd></div>
              </dl>
              <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-[#425563]">{inquiry.message}</p>
              {inquiryNotes.length ? <div className="mt-6 grid gap-2">{inquiryNotes.map((note) => <p key={note.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">{note.note}<span className="mt-2 block text-xs text-amber-700">{new Date(note.created_at).toLocaleString("en-IN")}</span></p>)}</div> : null}
              <form action={addInquiryNoteAction} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input type="hidden" name="id" value={inquiry.id} />
                <label className="sr-only" htmlFor={`note-${inquiry.id}`}>Private note</label>
                <input id={`note-${inquiry.id}`} name="note" required maxLength={2000} placeholder="Add a private note" className="min-h-11 flex-1 rounded-xl border border-[#c9d8dd] px-4" />
                <button className="min-h-11 rounded-xl border border-[#c9d8dd] px-4 text-sm font-semibold text-[#072a47]">Add note</button>
              </form>
            </article>
          );
        })}
        {!inquiries.length ? <div className="surface-card p-8 text-sm text-[#5b6e7a]">No enquiries have been submitted.</div> : null}
      </div>
    </>
  );
}
