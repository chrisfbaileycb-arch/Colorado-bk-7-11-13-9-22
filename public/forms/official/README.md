# Official court form templates

Download the current fillable PDFs from uscourts.gov (Bankruptcy Forms, Form 100 series) and
save them here under these exact names:

| App form  | File name          | Official form |
|-----------|--------------------|---------------|
| form101   | `form_b101.pdf`    | Official Form 101 |
| form106i  | `form_b106i.pdf`   | Official Form 106I |
| form106j  | `form_b106j.pdf`   | Official Form 106J |
| form122a1 | `form_b122a-1.pdf` | Official Form 122A-1 |

Then list each form's field names with `bun run forms:inspect public/forms/official/<file>`
and fill in its `fieldMap` in `lib/engine/pdf/official-form-filler.ts`, recording the form
edition in `mappedEdition`. Until a form is mapped, the app keeps producing the watermarked
data sheet for it.
